'use client';

import React, { useCallback, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { TestTemplateSummary } from "@/types/domain";
import TestTemplateCard from "./TestTemplateCard";
import TemplateFilters from "./TemplateFilters";

interface TestTemplatesGridProps {
  templates: TestTemplateSummary[];
  canEdit?: boolean;
}

/**
 * Animation variants for staggered grid load
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * TestTemplatesGrid - Animated grid with filters and keyboard navigation
 *
 * Features:
 * - Staggered load animation using framer-motion
 * - Integrated search and filter controls
 * - Keyboard navigation between cards (arrow keys)
 * - Focus management with visible focus indicators
 * - Skip link for main content
 */
export default function TestTemplatesGrid({
  templates,
  canEdit = false,
}: TestTemplatesGridProps) {
  const [filteredTemplates, setFilteredTemplates] = useState<TestTemplateSummary[]>(templates);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Mark the first active template as recommended
  const recommendedTemplateId = templates.length > 0 ? templates[0]?.id : null;

  // Handle filtered templates change from filter component
  const handleFilteredTemplatesChange = useCallback((filtered: TestTemplateSummary[]) => {
    setFilteredTemplates(filtered);
    setFocusedIndex(-1); // Reset focus when filters change
  }, []);

  // Register card ref
  const setCardRef = useCallback((id: string, element: HTMLDivElement | null) => {
    if (element) {
      cardRefs.current.set(id, element);
    } else {
      cardRefs.current.delete(id);
    }
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gridRef.current?.contains(document.activeElement)) return;
      if (filteredTemplates.length === 0) return;

      // Calculate grid columns based on viewport
      const gridElement = gridRef.current;
      const gridStyle = window.getComputedStyle(gridElement);
      const gridColumns = gridStyle.getPropertyValue('grid-template-columns').split(' ').length;

      let newIndex = focusedIndex;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          newIndex = Math.min(focusedIndex + 1, filteredTemplates.length - 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newIndex = Math.max(focusedIndex - 1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newIndex = Math.min(focusedIndex + gridColumns, filteredTemplates.length - 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          newIndex = Math.max(focusedIndex - gridColumns, 0);
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = filteredTemplates.length - 1;
          break;
        default:
          return;
      }

      if (newIndex !== focusedIndex && newIndex >= 0 && newIndex < filteredTemplates.length) {
        setFocusedIndex(newIndex);
        const template = filteredTemplates[newIndex];
        if (template) {
          const cardElement = cardRefs.current.get(template.id);
          cardElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, filteredTemplates]);

  // Handle card focus
  const handleCardFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  if (!templates || templates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Skip Link for Accessibility */}
      <a
        href="#templates-grid"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring focus:rounded-md"
      >
        Skip to templates
      </a>

      {/* Filters */}
      <TemplateFilters
        templates={templates}
        onFilteredTemplatesChange={handleFilteredTemplatesChange}
      />

      {/* Grid */}
      <AnimatePresence mode="wait">
        {filteredTemplates.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-br from-muted/40 to-muted/10 blur-2xl" />
              <div className="relative rounded-2xl bg-muted/30 p-6 backdrop-blur-sm border border-border/50">
                <svg
                  className="h-12 w-12 text-muted-foreground/60 mx-auto animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mt-6 mb-2">
              No templates found
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
              Try adjusting your search or filter criteria to find what you&apos;re looking for.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            ref={gridRef}
            id="templates-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr"
            role="grid"
            aria-label={`${filteredTemplates.length} test templates`}
          >
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                variants={itemVariants}
                layout
                ref={(el) => setCardRef(template.id, el)}
                onFocus={() => handleCardFocus(index)}
                className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-lg"
                role="gridcell"
                tabIndex={focusedIndex === index ? 0 : -1}
              >
                <TestTemplateCard
                  template={template}
                  canEdit={canEdit}
                  isRecommended={template.id === recommendedTemplateId}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Reader Announcement */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {filteredTemplates.length === 0
          ? 'No templates match your current filters'
          : `Showing ${filteredTemplates.length} of ${templates.length} templates`}
      </div>
    </div>
  );
}
