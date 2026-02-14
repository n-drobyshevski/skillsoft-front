import "./globals.css";

import * as React from "react";
import { Suspense } from "react";
import { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { LayoutProvider } from "@/components/layout/layout-provider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { shadcn } from '@clerk/themes';
import { SkipLinks, MainContentAnchor } from "@/components/accessibility";
import { HtmlLangSetter } from "@/components/providers/HtmlLangSetter";
import { SHARED_NAMESPACES, pickMessages } from "@/i18n/namespaces";

const inter = Inter({
	subsets: ["latin", "cyrillic"],
	display: "swap",
	variable: "--font-inter",
});

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
 * Root providers that require request-time data (locale, messages, auth).
 *
 * These are inside <Suspense> so that getLocale()/getMessages() (which read
 * headers/cookies) don't block the static HTML shell from being prerendered.
 *
 * Bundle optimization: Only shared namespaces are passed to NextIntlClientProvider.
 * Section-specific namespaces are loaded by layout-level providers in:
 * - app/(workspace)/psychometrics/layout.tsx
 * - app/(workspace)/test-templates/layout.tsx (top-level)
 * - app/(workspace)/profile/layout.tsx
 * Server components still have access to ALL messages via getTranslations().
 */
async function RootProviders({ children }: { children: React.ReactNode }) {
	const locale = await getLocale();
	const messages = await getMessages();
	const sharedMessages = pickMessages(
		messages as Record<string, unknown>,
		SHARED_NAMESPACES,
	);
	const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

	if (publishableKey && publishableKey.trim() !== '') {
		return (
			<ClerkProvider appearance={clerkAppearance}>
				<NextIntlClientProvider messages={sharedMessages} locale={locale}>
					<HtmlLangSetter locale={locale} />
					<LayoutContent>{children}</LayoutContent>
				</NextIntlClientProvider>
			</ClerkProvider>
		);
	}

	// Fallback without ClerkProvider (for development without Clerk keys)
	return (
		<NextIntlClientProvider messages={sharedMessages} locale={locale}>
			<HtmlLangSetter locale={locale} />
			<LayoutProvider>
				<QueryProvider>
					<SkipLinks />
					<MainContentAnchor />
					{children}
					<Toaster richColors />
				</QueryProvider>
			</LayoutProvider>
		</NextIntlClientProvider>
	);
}

/**
 * Root Layout
 *
 * PPR Strategy:
 * - <html> and <body> are the static shell (prerendered at build time).
 * - All dynamic data (locale, auth, messages) is fetched inside RootProviders,
 *   which is wrapped in <Suspense> so it doesn't block the static shell.
 * - Route-specific layouts handle sidebar/header:
 *   - (auth)/ - Minimal layout for sign-in/sign-up
 *   - (workspace)/ - Full dashboard layout with sidebar
 */
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className={`${inter.variable} mobile-container`}>
			<body className="mobile-container" suppressHydrationWarning>
				<Suspense fallback={<AuthLoadingFallback />}>
					<RootProviders>{children}</RootProviders>
				</Suspense>
				<Analytics />
			</body>
		</html>
	);
}
