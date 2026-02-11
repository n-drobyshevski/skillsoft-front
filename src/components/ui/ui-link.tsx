"use client";

import type * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Link variants using class-variance-authority
 * Provides consistent styling across the application
 */
const uiLinkVariants = cva(
	// Base styles - no underline by default, smooth transitions
	"inline-flex items-center gap-1.5 font-medium transition-all duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm no-underline",
	{
		variants: {
			variant: {
				// Default: subtle color change on hover
				default:
					"text-foreground/80 hover:text-foreground active:text-foreground/90",
				// Primary: uses primary color scheme
				primary:
					"text-primary hover:text-primary/80 active:text-primary/70",
				// Muted: subtle, secondary links
				muted:
					"text-muted-foreground hover:text-foreground active:text-foreground/90",
				// Ghost: minimal style with background on hover
				ghost:
					"text-foreground/80 hover:bg-accent hover:text-accent-foreground px-2 py-1 -mx-2 -my-1 rounded-md active:bg-accent/80",
				// Underline: traditional underlined link
				underline:
					"text-primary underline underline-offset-4 decoration-2 decoration-primary/50 hover:decoration-primary active:text-primary/80",
				// Destructive: for delete/danger actions
				destructive:
					"text-destructive hover:text-destructive/80 active:text-destructive/70",
			},
			size: {
				default: "text-sm",
				sm: "text-xs",
				lg: "text-base",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

/**
 * Props for the UiLink component
 */
export interface UiLinkProps
	extends Omit<React.ComponentProps<typeof Link>, "className">,
		VariantProps<typeof uiLinkVariants> {
	/** Additional CSS classes */
	className?: string;
	/** Whether the link is external (opens in new tab) */
	external?: boolean;
	/** Whether the link is disabled */
	disabled?: boolean;
	/** Whether the link is currently active */
	active?: boolean;
	/** Optional icon to show before the text */
	leadingIcon?: React.ReactNode;
	/** Optional icon to show after the text */
	trailingIcon?: React.ReactNode;
	/** Children content */
	children: React.ReactNode;
}

/**
 * UiLink Component
 *
 * A reusable link component that wraps Next.js Link with consistent styling.
 * Supports variants, external links, disabled state, and icon placement.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <UiLink href="/about">About Us</UiLink>
 *
 * // External link
 * <UiLink href="https://example.com" external>External Site</UiLink>
 *
 * // With icons
 * <UiLink href="/settings" leadingIcon={<SettingsIcon />}>Settings</UiLink>
 *
 * // Disabled state
 * <UiLink href="/admin" disabled>Admin Panel</UiLink>
 *
 * // Different variants
 * <UiLink href="/home" variant="primary">Home</UiLink>
 * <UiLink href="/docs" variant="muted">Documentation</UiLink>
 * <UiLink href="/action" variant="ghost">Ghost Link</UiLink>
 * ```
 */
function UiLink({
	className,
	variant,
	size,
	external = false,
	disabled = false,
	active = false,
	leadingIcon,
	trailingIcon,
	children,
	href,
	...props
}: UiLinkProps) {
	// Determine if this is an external URL
	const isExternal =
		external ||
		(typeof href === "string" &&
			(href.startsWith("https://") ||
				href.startsWith("https://") ||
				href.startsWith("//")));

	// External link attributes for security
	const externalProps = isExternal
		? {
				target: "_blank" as const,
				rel: "noopener noreferrer",
			}
		: {};

	// Disabled state styling
	const disabledStyles = disabled
		? "pointer-events-none opacity-50 cursor-not-allowed"
		: "";

	// Active state styling
	const activeStyles = active
		? "text-primary font-semibold"
		: "";

	// If disabled, render as a span instead of a link
	if (disabled) {
		return (
			<span
				data-slot="ui-link"
				className={cn(
					uiLinkVariants({ variant, size }),
					disabledStyles,
					className
				)}
				aria-disabled="true"
			>
				{leadingIcon && (
					<span className="shrink-0 [&>svg]:size-4" aria-hidden="true">
						{leadingIcon}
					</span>
				)}
				<span>{children}</span>
				{trailingIcon && (
					<span className="shrink-0 [&>svg]:size-4" aria-hidden="true">
						{trailingIcon}
					</span>
				)}
			</span>
		);
	}

	return (
		<Link
			data-slot="ui-link"
			href={href}
			className={cn(
				uiLinkVariants({ variant, size }),
				activeStyles,
				className
			)}
			aria-current={active ? "page" : undefined}
			{...externalProps}
			{...props}
		>
			{leadingIcon && (
				<span className="shrink-0 [&>svg]:size-4" aria-hidden="true">
					{leadingIcon}
				</span>
			)}
			<span>{children}</span>
			{trailingIcon && (
				<span className="shrink-0 [&>svg]:size-4" aria-hidden="true">
					{trailingIcon}
				</span>
			)}
			{isExternal && !trailingIcon && (
				<svg
					className="size-3.5 shrink-0 opacity-60"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fillRule="evenodd"
						d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
						clipRule="evenodd"
					/>
					<path
						fillRule="evenodd"
						d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
						clipRule="evenodd"
					/>
				</svg>
			)}
		</Link>
	);
}

export { UiLink, uiLinkVariants };
