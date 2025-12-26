"use client";

import { useCallback } from "react";
import { GlossarySearch } from "./GlossarySearch";

/**
 * Client wrapper for GlossarySearch to handle term selection
 * Separated from the server component for better code splitting
 */
export function GlossarySearchClient() {
  const handleSelectTerm = useCallback((termId: string, _sectionId: string) => {
    const element = document.querySelector(`[data-term-id="${termId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Wait for scroll, then trigger open
      setTimeout(() => {
        const trigger = element.querySelector("[data-slot='accordion-trigger']");
        if (trigger instanceof HTMLElement) {
          trigger.click();
        }
      }, 300);
    }
  }, []);

  return <GlossarySearch onSelectTerm={handleSelectTerm} />;
}
