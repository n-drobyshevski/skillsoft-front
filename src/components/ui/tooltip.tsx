"use client";

import { useState, useEffect, useCallback } from "react";
import type * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

function TooltipProvider({
	delayDuration = 0,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
	return (
		<TooltipPrimitive.Provider
			data-slot="tooltip-provider"
			delayDuration={delayDuration}
			{...props}
		/>
	);
}

interface TooltipProps extends React.ComponentProps<typeof TooltipPrimitive.Root> {
	/** Auto-hide the tooltip after this duration (in ms). Set to 0 to disable. */
	autoHideDuration?: number;
}

function Tooltip({
	autoHideDuration = 0,
	open: controlledOpen,
	onOpenChange,
	defaultOpen,
	...props
}: TooltipProps) {
	const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : internalOpen;

	const handleOpenChange = useCallback((nextOpen: boolean) => {
		if (!isControlled) {
			setInternalOpen(nextOpen);
		}
		onOpenChange?.(nextOpen);
	}, [isControlled, onOpenChange]);

	// Auto-hide timer
	useEffect(() => {
		if (!open || autoHideDuration <= 0) return;

		const timer = setTimeout(() => {
			handleOpenChange(false);
		}, autoHideDuration);

		return () => clearTimeout(timer);
	}, [open, autoHideDuration, handleOpenChange]);

	return (
		<TooltipProvider>
			<TooltipPrimitive.Root 
				data-slot="tooltip" 
				open={open}
				onOpenChange={handleOpenChange}
				{...props} 
			/>
		</TooltipProvider>
	);
}

function TooltipTrigger({
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
	return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
	className,
	sideOffset = 0,
	children,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
	return (
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Content
				data-slot="tooltip-content"
				sideOffset={sideOffset}
				className={cn(
					"bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
					className,
				)}
				{...props}
			>
				{children}
				<TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
			</TooltipPrimitive.Content>
		</TooltipPrimitive.Portal>
	);
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
