'use client';

import React, { useCallback, useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { TestTemplateSummary } from "@/types/domain";
import TestTemplateCard from "./TestTemplateCard";
import TemplateFilters from "./TemplateFilters";

interface TestTemplatesGridProps {
  templates: TestTemplateSummary[];
  canEdit?: boolean;
}

/**
 * TestTemplatesGrid - Grid with filters and keyboard navigation
 *
 * Features:
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

  const t = useTranslations('template');

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
    <div className="space-y-4">
      {/* Skip Link for Accessibility */}
      <a
        href="#templates-grid"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring focus:rounded-md"
      >
        {t('grid.skipToTemplates')}
      </a>

      {/* Filters */}
      <TemplateFilters
        templates={templates}
        onFilteredTemplatesChange={handleFilteredTemplatesChange}
      />

      {/* Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-muted/50 p-4">
            <svg
              className="h-8 w-8 text-muted-foreground"
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
          <h3 className="text-base font-medium mt-4 mb-1">
            {t('grid.noTemplatesFound')}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {t('grid.noTemplatesDescription')}
          </p>
        </div>
      ) : (
        <div
          ref={gridRef}
          id="templates-grid"
          className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="grid"
          aria-label={t('grid.templateCount', { count: filteredTemplates.length })}
        >
          {filteredTemplates.map((template, index) => (
            <div
              key={template.id}
              ref={(el) => setCardRef(template.id, el)}
              onFocus={() => handleCardFocus(index)}
              className="w-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-md sm:focus-visible:rounded-xl"
              role="gridcell"
              tabIndex={focusedIndex === index ? 0 : -1}
            >
              <TestTemplateCard
                template={template}
                canEdit={canEdit}
                isRecommended={template.id === recommendedTemplateId}
              />
            </div>
          ))}
        </div>
      )}

      {/* Screen Reader Announcement */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {filteredTemplates.length === 0
          ? t('grid.templatesNotFoundByFilter')
          : t('filters.showingOf', { shown: filteredTemplates.length, total: templates.length })}
      </div>
    </div>
  );
}
