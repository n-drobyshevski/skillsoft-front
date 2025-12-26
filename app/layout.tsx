import "./globals.css";

import * as React from "react";
import { Suspense } from "react";
import { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { LayoutProvider } from "@/components/layout/layout-provider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { shadcn } from '@clerk/themes';
import { SkipLinks, MainContentAnchor } from "@/components/accessibility";

export const metadata: Metadata = {
	title: "SkillSoft - Competency Management",
	description: "A platform for managing skills and competencies.",
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'SkillSoft',
	},
	// Prevent Dark Reader extension from modifying the DOM (causes hydration mismatches)
	other: {
		'darkreader-lock': '',
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	// Allow users to zoom for accessibility (WCAG 1.4.4)
	maximumScale: 5,
	userScalable: true,
	// Cover mode for safe area insets on notched devices
	viewportFit: 'cover',
	// Theme color for browser chrome
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: 'oklch(0.98 0.003 90)' },
		{ media: '(prefers-color-scheme: dark)', color: 'oklch(0.1 0.005 264)' }
	],
	// Color scheme for system-level UI
	colorScheme: 'light dark',
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
			<QueryProvider>
				{/* Skip links for keyboard navigation (WCAG 2.4.1) */}
				<SkipLinks />
				{/* Main content anchor for skip link target */}
				<MainContentAnchor />
				{children}
				<Toaster richColors />
			</QueryProvider>
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
						<Analytics />
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
					<QueryProvider>
						{/* Skip links for keyboard navigation (WCAG 2.4.1) */}
						<SkipLinks />
						{/* Main content anchor for skip link target */}
						<MainContentAnchor />
						{children}
						<Toaster richColors />
					</QueryProvider>
				</LayoutProvider>
				<Analytics />
			</body>
		</html>
	);
}
