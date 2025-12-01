import "./globals.css";

import * as React from "react";
import { Suspense } from "react";
import { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { LayoutProvider } from "@/components/layout/layout-provider";
import { Toaster } from "@/components/ui/sonner";
import { shadcn } from '@clerk/themes';

export const metadata: Metadata = {
	title: "SkillSoft - Competency Management",
	description: "A platform for managing skills and competencies.",
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'SkillSoft',
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: 'oklch(0.98 0.003 90)' },
		{ media: '(prefers-color-scheme: dark)', color: 'oklch(0.1 0.005 264)' }
	],
};

/**
 * Loading fallback for authentication
 * Shown while auth state is being resolved
 */
function AuthLoadingFallback() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="animate-pulse text-muted-foreground">Loading...</div>
		</div>
	);
}

/**
 * Inner layout content that may access auth state
 * Wrapped in Suspense for Next.js 16 cacheComponents compatibility
 */
async function LayoutContent({ children }: { children: React.ReactNode }) {
	return (
		<LayoutProvider>
			{children}
			<Toaster richColors />
		</LayoutProvider>
	);
}

const clerkAppearance = {
	baseTheme: shadcn,
	layout: {
		socialButtonsVariant: "blockButton" as const,
		socialButtonsPlacement: "top" as const,
	}
};

/**
 * Root Layout
 * 
 * Provides ClerkProvider for authentication and ThemeProvider via LayoutProvider.
 * Route-specific layouts handle sidebar/header:
 * - (auth)/ - Minimal layout for sign-in/sign-up
 * - (workspace)/ - Full dashboard layout with sidebar
 * 
 * Note: ClerkProvider uses dynamic prop for Next.js 16 cacheComponents compatibility.
 * This tells Clerk to defer auth state resolution to runtime.
 */
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

	// Always return the HTML structure, conditionally wrap with ClerkProvider
	if (publishableKey && publishableKey.trim() !== '') {
		return (
			<ClerkProvider 
				appearance={clerkAppearance}
				dynamic
			>
				<html lang="en" suppressHydrationWarning className="mobile-container">
					<body className="mobile-container" suppressHydrationWarning>
						<Suspense fallback={<AuthLoadingFallback />}>
							<LayoutContent>{children}</LayoutContent>
						</Suspense>
					</body>
				</html>
			</ClerkProvider>
		);
	}

	// Fallback without ClerkProvider (for development without Clerk keys)
	return (
		<html lang="en" suppressHydrationWarning className="mobile-container">
			<body className="mobile-container" suppressHydrationWarning>
				<LayoutProvider>
					{children}
					<Toaster richColors />
				</LayoutProvider>
			</body>
		</html>
	);
}
