interface FeatureItem {
title: string;
subtitle: string;
}

interface LocaleFeatures {
prefix: string;
features: FeatureItem[];
}

export const TYPEWRITER_DATA: Record<string, LocaleFeatures> = {
zh: {
prefix: "用 Next.js 构建您的",
features: [
{ title: "革命性 SaaS", subtitle: "内置多租户、认证、支付、存储一站式解决，帮您节省数周开发时间，快速验证您的产品。" },
{ title: "认证鉴权系统", subtitle: "集成 Google、GitHub、Apple 等 OAuth 登录，支持 Magic Link、Passkey 及企业级 SSO，开箱即用。" },
{ title: "多租户应用", subtitle: "内置组织管理与成员权限体系，轻松构建支持多团队协作的 SaaS 产品。" },
{ title: "数据库服务", subtitle: "基于 Supabase / PostgreSQL，支持 Drizzle ORM，类型安全查询，自动迁移管理。" },
{ title: "在线支付功能", subtitle: "无缝集成 Stripe、Lemon Squeezy，支持订阅计划、一次性付款与 Webhook 自动处理。" },
{ title: "对象存储服务", subtitle: "对接 S3、Cloudflare R2、Supabase Storage，文件上传、管理与权限控制一体化。" },
{ title: "博客与文档", subtitle: "内置 MDX 博客与文档站点，支持内容集合、SEO 优化与多语言，内容即代码。" },
{ title: "数据分析平台", subtitle: "集成 PostHog、Google Analytics、Plausible 等主流分析服务，深入了解用户行为与转化漏斗。" },
],
},
en: {
prefix: "Build your next",
features: [
{ title: "Revolutionary SaaS", subtitle: "All-in-one: multi-tenancy, auth, payments & storage built-in. Ship your product weeks faster." },
{ title: "Authentication System", subtitle: "Google, GitHub & Apple OAuth, Magic Link, Passkeys and enterprise SSO — all ready out of the box." },
{ title: "Multi-tenant App", subtitle: "Built-in organization management and member roles to power multi-team SaaS products effortlessly." },
{ title: "Database Service", subtitle: "Supabase / PostgreSQL with Drizzle ORM for type-safe queries and automatic migration management." },
{ title: "Online Payments", subtitle: "Stripe & Lemon Squeezy integration with subscription plans, one-time payments and automatic webhooks." },
{ title: "Object Storage", subtitle: "S3, Cloudflare R2 and Supabase Storage for unified file upload, management and access control." },
{ title: "Blog & Docs", subtitle: "MDX-powered blog and documentation site with content collections, SEO optimization and i18n support." },
{ title: "Analytics Platform", subtitle: "PostHog, Google Analytics and Plausible integrations to understand user behavior and conversion funnels." },
],
},
de: {
prefix: "Baue dein",
features: [
{ title: "Revolutionäres SaaS", subtitle: "Alles in einem: Multi-Tenancy, Auth, Zahlungen & Speicher. Bringe dein Produkt Wochen schneller live." },
{ title: "Authentifizierungssystem", subtitle: "Google-, GitHub- & Apple-OAuth, Magic Link, Passkeys und Enterprise-SSO — alles sofort einsatzbereit." },
{ title: "Multi-Tenant-App", subtitle: "Integriertes Organisationsmanagement und Mitgliederrollen für teambasierte SaaS-Produkte." },
{ title: "Datenbankdienst", subtitle: "Supabase / PostgreSQL mit Drizzle ORM für typsichere Abfragen und automatisches Migrationsmanagement." },
{ title: "Online-Zahlungen", subtitle: "Stripe & Lemon Squeezy mit Abonnementplänen, Einmalzahlungen und automatischer Webhook-Verarbeitung." },
{ title: "Objektspeicher", subtitle: "S3, Cloudflare R2 und Supabase Storage für Datei-Upload, Verwaltung und Zugriffskontrolle." },
{ title: "Blog & Dokumentation", subtitle: "MDX-basierter Blog und Doku-Site mit Content Collections, SEO-Optimierung und i18n-Unterstützung." },
{ title: "Analytics-Plattform", subtitle: "PostHog, Google Analytics und Plausible für Nutzerverhalten und Conversion-Analysen." },
],
},
es: {
prefix: "Construye tu",
features: [
{ title: "SaaS Revolucionario", subtitle: "Todo en uno: multi-tenancy, autenticación, pagos y almacenamiento. Lanza tu producto semanas antes." },
{ title: "Sistema de Autenticación", subtitle: "OAuth de Google, GitHub y Apple, Magic Link, Passkeys y SSO empresarial listos para usar." },
{ title: "App Multi-inquilino", subtitle: "Gestión de organizaciones y roles de miembros integrados para productos SaaS colaborativos." },
{ title: "Servicio de Base de Datos", subtitle: "Supabase / PostgreSQL con Drizzle ORM para consultas con tipo seguro y gestión automática de migraciones." },
{ title: "Pagos en Línea", subtitle: "Stripe y Lemon Squeezy con planes de suscripción, pagos únicos y webhooks automáticos." },
{ title: "Almacenamiento de Objetos", subtitle: "S3, Cloudflare R2 y Supabase Storage para carga, gestión y control de acceso de archivos." },
{ title: "Blog y Documentación", subtitle: "Blog y sitio de documentación MDX con colecciones de contenido, SEO y soporte i18n." },
{ title: "Plataforma de Analíticas", subtitle: "Integraciones con PostHog, Google Analytics y Plausible para entender el comportamiento del usuario." },
],
},
fr: {
prefix: "Construisez votre",
features: [
{ title: "SaaS Révolutionnaire", subtitle: "Tout-en-un : multi-tenant, auth, paiements et stockage intégrés. Lancez votre produit des semaines plus vite." },
{ title: "Système d'Authentification", subtitle: "OAuth Google, GitHub et Apple, Magic Link, Passkeys et SSO entreprise — prêts à l'emploi." },
{ title: "Application Multi-tenant", subtitle: "Gestion des organisations et rôles membres intégrés pour des produits SaaS collaboratifs." },
{ title: "Service de Base de Données", subtitle: "Supabase / PostgreSQL avec Drizzle ORM pour des requêtes typées et la gestion automatique des migrations." },
{ title: "Paiements en Ligne", subtitle: "Intégration Stripe et Lemon Squeezy avec abonnements, paiements uniques et webhooks automatiques." },
{ title: "Stockage d'Objets", subtitle: "S3, Cloudflare R2 et Supabase Storage pour l'upload, la gestion et le contrôle d'accès des fichiers." },
{ title: "Blog et Documentation", subtitle: "Blog et site de documentation MDX avec collections de contenu, optimisation SEO et support i18n." },
{ title: "Plateforme d'Analytique", subtitle: "Intégrations PostHog, Google Analytics et Plausible pour comprendre le comportement utilisateur." },
],
},
};

export function getTypewriterData(locale: string): LocaleFeatures {
return TYPEWRITER_DATA[locale] ?? TYPEWRITER_DATA.en;
}
