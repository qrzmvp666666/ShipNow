import crypto from "node:crypto";

import { createPurchase } from "@repo/database";
import { logger } from "@repo/logs";

import { getPlanIdByProviderPriceId } from "../../lib/provider-price-ids";

interface QiXiangConfig {
	apiUrl: string;
	pid: string;
	key: string;
}

function getQiXiangConfig(): QiXiangConfig {
	const apiUrl = process.env.QIXIANG_API_URL ?? "https://api.payqixiang.cn/mapi.php";
	const pid = process.env.QIXIANG_PID?.trim();
	const key = process.env.QIXIANG_KEY?.trim();

	if (!pid || !key) {
		throw new Error("Missing QIXIANG_PID or QIXIANG_KEY environment variables");
	}

	return { apiUrl, pid, key };
}

/**
 * Build MD5 sign string per QiXiang spec:
 * Sort all params (excluding sign / sign_type / empty values) by ASCII key order,
 * join as key=value pairs, append merchant key directly, then MD5 lowercase.
 */
function buildMd5Sign(params: Record<string, string>, secret: string): string {
	const signStr = Object.entries(params)
		.filter(([k, v]) => k !== "sign" && k !== "sign_type" && v !== "")
		.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
		.map(([k, v]) => `${k}=${v}`)
		.join("&");

	return crypto.createHash("md5").update(`${signStr}${secret}`).digest("hex").toLowerCase();
}

function generateOrderNo(prefix: string): string {
	const timestamp = Date.now().toString();
	const random = Math.random().toString(36).substring(2, 8).toUpperCase();
	return `${prefix}${timestamp}${random}`;
}

interface QiXiangCheckoutOptions {
	/** "wxpay" for WeChat Pay, "alipay" for Alipay */
	type: "wxpay" | "alipay";
	/** Amount in CNY yuan, e.g. 5999 */
	amount: number;
	/** Product display name (≤127 bytes) */
	productName: string;
	/** Server-side async notification URL */
	notifyUrl: string;
	/** Page redirect URL after payment */
	returnUrl: string;
	/** Client IP; any valid IP is accepted */
	clientIp?: string;
	/**
	 * Business extension param returned unchanged by QiXiang in the callback.
	 * Used to carry user/org/plan context so the webhook can create the purchase.
	 */
	param?: string;
}

interface QiXiangCheckoutResult {
	/** URL to redirect the user to for payment */
	checkoutLink: string;
	/** Our generated order number */
	orderNo: string;
}

/**
 * Initiate a QiXiang payment.  Returns a self-adaptive payment URL that works
 * for H5 (mobile), PC scan, and WeChat in-app payment without extra config.
 */
export async function createQiXiangCheckoutLink(
	options: QiXiangCheckoutOptions,
): Promise<QiXiangCheckoutResult> {
	const { apiUrl, pid, key } = getQiXiangConfig();
	const { type, amount, productName, notifyUrl, returnUrl, clientIp, param } = options;

	const orderNo = generateOrderNo(type === "wxpay" ? "WX" : "ALI");

	const params: Record<string, string> = {
		pid,
		type,
		out_trade_no: orderNo,
		notify_url: notifyUrl,
		return_url: returnUrl,
		name: productName.substring(0, 127),
		money: amount.toFixed(2),
		clientip: clientIp ?? "127.0.0.1",
		device: "jump",
		...(param ? { param } : {}),
	};

	params.sign = buildMd5Sign(params, key);
	params.sign_type = "MD5";

	const response = await fetch(apiUrl, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams(params).toString(),
	});

	const data = (await response.json()) as {
		code: number;
		msg?: string;
		trade_no?: string;
		payurl?: string;
		qrcode?: string;
	};

	if (data.code !== 1 || !data.payurl) {
		throw new Error(`QiXiang payment error: ${data.msg ?? "Unknown error"}`);
	}

	return { checkoutLink: data.payurl, orderNo };
}

/**
 * Callback param payload stored in the QiXiang `param` field.
 */
interface QiXiangCallbackParam {
	userId?: string;
	organizationId?: string;
	priceId?: string;
}

/**
 * GET webhook handler for QiXiang payment result notifications.
 * QiXiang sends a GET request to notify_url on successful payment.
 * Responds with plain text "success" to acknowledge receipt; any other response
 * triggers up to 5 retries.
 */
export async function qixiangWebhookHandler(req: Request): Promise<Response> {
	let key: string;

	try {
		({ key } = getQiXiangConfig());
	} catch (err) {
		logger.error("QiXiang webhook: missing config", err);
		return new Response("fail", { status: 500 });
	}

	const url = new URL(req.url);
	const params: Record<string, string> = {};
	url.searchParams.forEach((value, name) => {
		params[name] = value;
	});

	// Verify signature
	const receivedSign = params.sign;
	const expectedSign = buildMd5Sign(params, key);

	if (!receivedSign || receivedSign !== expectedSign) {
		logger.error("QiXiang webhook: signature mismatch", {
			received: receivedSign,
			expected: expectedSign,
		});
		return new Response("fail", { status: 400 });
	}

	// Only act on successful payments
	if (params.trade_status !== "TRADE_SUCCESS") {
		return new Response("success", { status: 200 });
	}

	const outTradeNo = params.out_trade_no;

	try {
		const paramStr = params.param ?? "{}";
		const paramData = JSON.parse(paramStr) as QiXiangCallbackParam;
		const { userId, organizationId, priceId } = paramData;

		if (!priceId) {
			logger.error("QiXiang webhook: missing priceId in param", { outTradeNo });
			return new Response("fail", { status: 400 });
		}

		const planId = getPlanIdByProviderPriceId(priceId);

		if (!planId) {
			logger.error("QiXiang webhook: unknown priceId", { priceId, outTradeNo });
			return new Response("fail", { status: 400 });
		}

		await createPurchase({
			organizationId: organizationId ?? null,
			userId: userId ?? null,
			// Use the QiXiang trade number as the internal customer identifier.
			// QiXiang is one-time only so no portal / subscription management is needed.
			customerId: `qixiang_${outTradeNo}`,
			type: "ONE_TIME",
			priceId,
		});

		logger.log("QiXiang purchase created", { outTradeNo, planId, userId, organizationId });

		return new Response("success", { status: 200 });
	} catch (error) {
		logger.error("QiXiang webhook error", error);
		return new Response("fail", { status: 500 });
	}
}
