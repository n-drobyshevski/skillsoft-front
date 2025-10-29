import "./globals.css";

import * as React from "react";
import { Metadata } from "next";

import { LayoutProvider } from "@/components/layout-provider";

export const metadata: Metadata = {
	title: "SkillSoft - Competency Management",
	description: "A platform for managing skills and competencies.",
};
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className="mobile-container">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
			</head>
			<body className="mobile-container">
				<LayoutProvider>{children}</LayoutProvider>
			</body>
		</html>
	);
}
