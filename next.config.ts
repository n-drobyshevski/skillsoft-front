import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
	// Enable React Compiler for automatic memoization (Next.js 16)
	reactCompiler: true,
	// PPR enabled via Cache Components (Next.js 16)
	// Clerk @clerk/nextjs v6.35+ supports this configuration.
	cacheComponents: true,
	turbopack: {
		root: __dirname,
	},
	// ============================================================================
	// Custom cacheLife profiles for 'use cache' directive
	// Usage: cacheLife('entityData') in server functions
	// ============================================================================
	cacheLife: {
		// Short-lived data: user sessions, real-time stats (1 minute)
		realtime: {
			stale: 30,       // Allow stale for 30s
			revalidate: 30,  // Revalidate every 30s
			expire: 60,      // Expire after 1 minute
		},
		// Entity data: competencies, questions, indicators (5 minutes)
		entityData: {
			stale: 60,       // Allow stale for 1 minute
			revalidate: 300, // Revalidate every 5 minutes
			expire: 600,     // Expire after 10 minutes
		},
		// User data: profiles, roles (15 minutes)
		userData: {
			stale: 300,      // Allow stale for 5 minutes
			revalidate: 900, // Revalidate every 15 minutes
			expire: 1800,    // Expire after 30 minutes
		},
		// Reference data: standards, categories (1 hour)
		referenceData: {
			stale: 1800,     // Allow stale for 30 minutes
			revalidate: 3600, // Revalidate every hour
			expire: 7200,    // Expire after 2 hours
		},
		// Static content: docs pages, marketing pages (1 hour revalidation, 24h expire)
		staticContent: {
			stale: 3600,      // Allow stale for 1 hour
			revalidate: 3600, // Revalidate every hour
			expire: 86400,    // Expire after 24 hours
		},
	},
	experimental: {
		// ========================================================================
		// Turbopack Filesystem Cache (Beta) - Speeds up dev restarts
		// ========================================================================
		// Enable filesystem caching for Turbopack in development
		// Persists cache across dev server restarts for faster startup
		turbopackFileSystemCacheForDev: true,
		// Note: turbopackFileSystemCacheForBuild requires Next.js canary

		// Control client-side router cache staleness
		staleTimes: {
			dynamic: 30, // Cache dynamic pages for 30s on client
			static: 180, // Cache static pages for 3 minutes on client
		},
		// Enable optimized imports for better tree-shaking and path resolution
		optimizePackageImports: [
			"@/components",
			"@/lib",
			"@/services",
			"@/context",
			"lucide-react",
			"@clerk/nextjs",
			"recharts",
			"@radix-ui/react-icons",
			"@tanstack/react-table",
			"motion",
			// Added for better bundle optimization
			"date-fns",
			"sonner",
			"@dnd-kit/core",
			"@dnd-kit/sortable",
			"fuse.js",
			"zod",
			"react-hook-form",
			"next-intl",
		],
		// Enable server source maps for better debugging (disable in production)
		serverSourceMaps: false,
		// Enable View Transitions API for smooth page transitions (Next.js 16)
		viewTransition: true,
	},
	// ========================================================================
	// Build Performance Optimizations
	// ========================================================================
	// Disable development indicator for cleaner UI
	devIndicators: false,
	// Enable static optimization
	output: 'standalone',
	// Disable source maps in production to reduce bundle size
	productionBrowserSourceMaps: false,
	// Enable compression for better performance
	compress: true,
	// Optimize images
	images: {
		formats: ['image/webp', 'image/avif'],
		minimumCacheTTL: 60,
		deviceSizes: [320, 420, 640, 768, 1024, 1200, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		// Disable blur placeholders in development for faster builds
		disableStaticImages: false,
		// Remote patterns for external images (Clerk avatars)
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'img.clerk.com',
			},
			{
				protocol: 'https',
				hostname: '*.clerk.com',
			},
		],
	},
	// Skip type checking during build (run separately with npm run type-check)
	typescript: {
		// Set to true if you want faster builds (type-check separately)
		ignoreBuildErrors: false,
	},
	// Add headers for better CORS handling and performance
	async headers() {
		return [
			{
				source: "/api/:path*",
				headers: [
					{ key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" },
					{ key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
					{ key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
				],
			},
			{
				// Apply security headers to all routes
				source: "/(.*)",
				headers: [
					{
						key: "X-DNS-Prefetch-Control",
						value: "on"
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block"
					},
					{
						key: "X-Frame-Options",
						value: "SAMEORIGIN"
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff"
					},
					{
						key: "Referrer-Policy",
						value: "origin-when-cross-origin"
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()"
					},
					{
						key: "Content-Security-Policy",
						value: "worker-src 'self' blob:;"
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload"
					}
				],
			},
		];
	},
	// Add rewrites for better SEO
	async rewrites() {
		return [
			{
				source: '/sitemap.xml',
				destination: '/api/sitemap'
			},
			{
				source: '/robots.txt',
				destination: '/api/robots'
			}
		];
	},
	// PoweredBy header removal for security
	poweredByHeader: false,
	// Enable React Strict Mode for better development experience
	reactStrictMode: true,
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
