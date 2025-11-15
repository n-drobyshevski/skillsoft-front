import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	turbopack: {
		root: __dirname,
	},
	experimental: {
		// Enable optimized imports for better path resolution
		optimizePackageImports: ["@/components", "@/lib", "@/services", "@/context"],
	},
	// Add headers for better CORS handling
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
		];
	},
};

export default nextConfig;
