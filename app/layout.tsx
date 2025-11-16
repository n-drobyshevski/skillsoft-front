import "./globals.css";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { LayoutProvider } from "@/components/layout-provider";
import { Toaster } from "@/components/ui/sonner";
import { shadcn } from '@clerk/themes';
export const metadata: Metadata = {
	title: "SkillSoft - Competency Management",
	description: "A platform for managing skills and competencies.",
};

const ConditionalClerkProvider = ({ children }: { children: React.ReactNode }) => {
	// Only wrap with ClerkProvider if publishable key is set
	const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
	
	if (publishableKey && publishableKey.trim() !== '') {
		const appearance = {
			theme: shadcn,
			layout: {
				socialButtonsVariant: "blockButton" as const,
				socialButtonsPlacement: "top" as const,
			}
			// variables: {
			// 	colorPrimary: "hsl(var(--primary))",
			// 	colorBackground: "hsl(var(--background))",
			// 	colorInputBackground: "hsl(var(--background))",
			// 	colorInputText: "hsl(var(--foreground))",
			// 	colorText: "hsl(var(--foreground))",
			// 	colorTextSecondary: "hsl(var(--muted-foreground))",
			// 	colorTextOnPrimaryBackground: "hsl(var(--primary-foreground))",
			// 	borderRadius: "0.5rem",
			// 	fontFamily: "inherit",
			// },
			// elements: {
			// 	card: "bg-background border border-border shadow-lg rounded-lg",
			// 	headerTitle: "text-foreground text-xl font-semibold",
			// 	headerSubtitle: "text-muted-foreground text-sm",
			// 	formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors duration-200 normal-case text-sm font-medium rounded-md border-0",
			// 	socialButtonsBlockButton: "bg-background border border-input hover:bg-accent hover:text-accent-foreground transition-colors duration-200 text-sm font-medium rounded-md shadow-sm",
			// 	formFieldInput: "bg-background border border-input rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors duration-200",
			// 	footerActionLink: "text-primary hover:text-primary/80 text-sm font-medium underline-offset-4 hover:underline transition-colors duration-200",
			// }
		};
		
		return (
			<ClerkProvider 
				appearance={appearance}
			>
				{children}
			</ClerkProvider>
		);
	}
	
	return <>{children}</>;
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ConditionalClerkProvider>
			<html lang="en" suppressHydrationWarning className="mobile-container">
				<head>
					<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
				</head>
				<body className="mobile-container" suppressHydrationWarning>
					<LayoutProvider>
						{children}
						<Toaster richColors />
					</LayoutProvider>
				</body>
			</html>
		</ConditionalClerkProvider>
	);
}
