import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	turbopack: {
		root: __dirname,
	},
	experimental: {
		// Enable optimized imports for better tree-shaking and path resolution
		optimizePackageImports: [
			"@/components", 
			"@/lib", 
			"@/services", 
			"@/context",
			"lucide-react",
			"@clerk/nextjs",
			"recharts",
		],
		// Enable server source maps for better debugging (disable in production)
		serverSourceMaps: false,
		// Enable View Transitions API for smooth page transitions (Next.js 16)
		viewTransition: true,
	},
	// Enable static optimization
	output: undefined, // Allow both static and server rendering
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
	},
	// Add headers for better CORS handling and performance
	async headers() {
		return [
			{
				source: "/api/:path*",
				headers: [
					{ key: "Access-Control-Allow-Origin", value: "*" },
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

export default nextConfig;
