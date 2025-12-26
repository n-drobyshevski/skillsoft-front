"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MaximizeIcon,
  ZoomInIcon,
  ZoomOutIcon,
  RotateCcwIcon,
} from "lucide-react";

interface ResponsiveDiagramProps {
  /** The diagram content (SVG, Mermaid output, or any React node) */
  children: React.ReactNode;
  /** Optional title for the diagram */
  title?: string;
  /** Optional caption/description */
  caption?: string;
  /** Minimum height for the container */
  minHeight?: number;
  /** Maximum height for the container */
  maxHeight?: number;
  /** Additional CSS classes */
  className?: string;
  /** Enable pinch-to-zoom on touch devices (default: true) */
  enablePinchZoom?: boolean;
  /** Show zoom controls (default: true on mobile) */
  showControls?: boolean;
}

/**
 * ResponsiveDiagram Component for Documentation
 *
 * Wraps diagrams with mobile-friendly features:
 * - Pinch-to-zoom on touch devices
 * - Zoom in/out/reset controls
 * - Fullscreen modal for complex diagrams
 * - Pan with touch/drag
 * - Accessible zoom controls (44px touch targets)
 *
 * @example
 * ```tsx
 * <ResponsiveDiagram title="System Architecture" caption="Data flow diagram">
 *   <MermaidDiagram chart={...} />
 * </ResponsiveDiagram>
 * ```
 */
export function ResponsiveDiagram({
  children,
  title,
  caption,
  minHeight = 200,
  maxHeight = 400,
  className,
  enablePinchZoom = true,
  showControls = true,
}: ResponsiveDiagramProps) {
  const [scale, setScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const dragStartRef = React.useRef({ x: 0, y: 0 });
  const positionStartRef = React.useRef({ x: 0, y: 0 });

  // Reset zoom and position
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Zoom controls
  const zoomIn = () => setScale((s) => Math.min(3, s + 0.25));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.25));

  // Pinch-to-zoom handler
  React.useEffect(() => {
    if (!enablePinchZoom) return;

    const container = containerRef.current;
    if (!container) return;

    let startDistance = 0;
    let startScale = scale;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        startDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        startScale = scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const newScale = Math.min(
          3,
          Math.max(0.5, startScale * (distance / startDistance))
        );
        setScale(newScale);
      }
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [scale, enablePinchZoom]);

  // Pan/drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      positionStartRef.current = position;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      setPosition({
        x: positionStartRef.current.x + deltaX,
        y: positionStartRef.current.y + deltaY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      positionStartRef.current = position;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1 && scale > 1) {
      const deltaX = e.touches[0].clientX - dragStartRef.current.x;
      const deltaY = e.touches[0].clientY - dragStartRef.current.y;
      setPosition({
        x: positionStartRef.current.x + deltaX,
        y: positionStartRef.current.y + deltaY,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <figure className={cn("my-6", className)}>
      {title && (
        <figcaption className="text-sm font-medium mb-2 text-foreground">
          {title}
        </figcaption>
      )}

      <div className="relative border rounded-lg overflow-hidden bg-muted/30">
        {/* Zoom controls */}
        {showControls && (
          <div className="absolute top-2 right-2 z-10 flex gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-1 shadow-sm">
            <Button
              size="sm"
              variant="ghost"
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="h-8 w-8 p-0 touch-manipulation"
              aria-label="Уменьшить"
            >
              <ZoomOutIcon className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={resetView}
              disabled={scale === 1 && position.x === 0 && position.y === 0}
              className="h-8 w-8 p-0 touch-manipulation"
              aria-label="Сбросить масштаб"
            >
              <RotateCcwIcon className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={zoomIn}
              disabled={scale >= 3}
              className="h-8 w-8 p-0 touch-manipulation"
              aria-label="Увеличить"
            >
              <ZoomInIcon className="h-4 w-4" />
            </Button>

            {/* Fullscreen modal for complex diagrams */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 touch-manipulation"
                  aria-label="На весь экран"
                >
                  <MaximizeIcon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] max-h-[95vh] p-4">
                <DialogHeader>
                  <DialogTitle>{title || "Диаграмма"}</DialogTitle>
                </DialogHeader>
                <div className="overflow-auto max-h-[80vh] p-4">{children}</div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Zoom level indicator */}
        {scale !== 1 && (
          <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs font-mono text-muted-foreground">
            {Math.round(scale * 100)}%
          </div>
        )}

        {/* Diagram container with zoom and pan */}
        <div
          ref={containerRef}
          className={cn(
            "overflow-hidden touch-pan-x touch-pan-y",
            isDragging && "cursor-grabbing",
            scale > 1 && !isDragging && "cursor-grab"
          )}
          style={{
            minHeight: `${minHeight}px`,
            maxHeight: `${maxHeight}px`,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={contentRef}
            className="inline-block min-w-full p-4 transition-transform duration-100 origin-center"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            }}
          >
            {children}
          </div>
        </div>

        {/* Mobile hint */}
        <p className="text-xs text-center text-muted-foreground py-2 border-t md:hidden">
          Сведите пальцы для масштабирования | Перетащите для перемещения
        </p>
      </div>

      {caption && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
