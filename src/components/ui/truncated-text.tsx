"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export interface TruncatedTextProps
	extends React.HTMLAttributes<HTMLSpanElement> {
	/** The text content to display */
	children: React.ReactNode;
	/** Number of lines before truncating (default: 1) */
	lines?: 1 | 2 | 3;
	/** Show full text in tooltip on hover (default: true) */
	showTooltip?: boolean;
	/** Custom max-width for the text container */
	maxWidth?: string;
	/** The HTML element to render as */
	as?: "span" | "p" | "div";
}

const lineClampClasses = {
	1: "line-clamp-1",
	2: "line-clamp-2",
	3: "line-clamp-3",
} as const;

/**
 * TruncatedText component for consistent text truncation across the app.
 * Supports single-line truncation (ellipsis) and multi-line clamping.
 * Optionally shows full text in a tooltip on hover.
 *
 * @example
 * // Single line truncation with tooltip
 * <TruncatedText>Very long text that will be truncated...</TruncatedText>
 *
 * @example
 * // Multi-line truncation
 * <TruncatedText lines={2}>Long description text...</TruncatedText>
 *
 * @example
 * // Without tooltip
 * <TruncatedText showTooltip={false}>Truncated text</TruncatedText>
 */
export function TruncatedText({
	children,
	lines = 1,
	showTooltip = true,
	maxWidth,
	as: Component = "span",
	className,
	...props
}: TruncatedTextProps) {
	const [isTruncated, setIsTruncated] = React.useState(false);
	const textRef = React.useRef<HTMLElement>(null);

	// Check if text is actually truncated
	React.useEffect(() => {
		const element = textRef.current;
		if (!element) return;

		const checkTruncation = () => {
			if (lines === 1) {
				// For single line, compare scrollWidth to clientWidth
				setIsTruncated(element.scrollWidth > element.clientWidth);
			} else {
				// For multi-line, compare scrollHeight to clientHeight
				setIsTruncated(element.scrollHeight > element.clientHeight);
			}
		};

		checkTruncation();

		// Re-check on resize
		const resizeObserver = new ResizeObserver(checkTruncation);
		resizeObserver.observe(element);

		return () => resizeObserver.disconnect();
	}, [children, lines]);

	const textContent =
		typeof children === "string" ? children : String(children);

	const truncatedElement = (
		<Component
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			ref={textRef as any}
			className={cn(
				"block overflow-hidden",
				lines === 1 ? "truncate" : lineClampClasses[lines],
				maxWidth && `max-w-[${maxWidth}]`,
				className
			)}
			style={maxWidth ? { maxWidth } : undefined}
			{...props}
		>
			{children}
		</Component>
	);

	// If tooltip is disabled or text isn't truncated, just render the text
	if (!showTooltip || !isTruncated) {
		return truncatedElement;
	}

	// Render with tooltip
	return (
		<Tooltip>
			<TooltipTrigger asChild>{truncatedElement}</TooltipTrigger>
			<TooltipContent
				side="top"
				className="max-w-xs break-words"
				sideOffset={4}
			>
				{textContent}
			</TooltipContent>
		</Tooltip>
	);
}

/**
 * ResponsiveTruncatedText - Adjusts truncation based on screen size.
 * Shows more lines on larger screens, fewer on mobile.
 *
 * @example
 * <ResponsiveTruncatedText mobileLines={1} desktopLines={2}>
 *   Long text content...
 * </ResponsiveTruncatedText>
 */
export interface ResponsiveTruncatedTextProps
	extends Omit<TruncatedTextProps, "lines"> {
	/** Lines to show on mobile (default: 1) */
	mobileLines?: 1 | 2 | 3;
	/** Lines to show on desktop md+ (default: 2) */
	desktopLines?: 1 | 2 | 3;
}

export function ResponsiveTruncatedText({
	children,
	mobileLines = 1,
	desktopLines = 2,
	showTooltip = true,
	maxWidth,
	as: Component = "span",
	className,
	...props
}: ResponsiveTruncatedTextProps) {
	const textContent =
		typeof children === "string" ? children : String(children);

	const mobileClamp = lineClampClasses[mobileLines];
	const desktopClamp = lineClampClasses[desktopLines];

	const element = (
		<Component
			className={cn(
				"block overflow-hidden",
				mobileClamp,
				`md:${desktopClamp}`,
				maxWidth && `max-w-[${maxWidth}]`,
				className
			)}
			style={maxWidth ? { maxWidth } : undefined}
			{...props}
		>
			{children}
		</Component>
	);

	if (!showTooltip) {
		return element;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>{element}</TooltipTrigger>
			<TooltipContent
				side="top"
				className="max-w-xs break-words"
				sideOffset={4}
			>
				{textContent}
			</TooltipContent>
		</Tooltip>
	);
}
