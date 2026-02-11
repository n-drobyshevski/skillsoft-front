'use cache';

import { Metadata } from "next";
import { cacheLife } from "next/cache";

import { DocsBreadcrumb } from "../_components/DocsBreadcrumb";
import { DocsFooterNav } from "../_components/DocsFooterNav";
import { DocsToc } from "../_components/DocsToc";
import { GlossarySection } from "./_components/GlossarySection";
import { MobileSectionNav } from "./_components/MobileSectionNav";
import { GlossarySearchClient } from "./_components/GlossarySearchClient";
import { glossarySections } from "./_components/glossary-data";

export const metadata: Metadata = {
  title: "Глоссарий | Документация | SkillSoft",
  description: "Определения терминов, используемых в платформе SkillSoft",
};

// TOC items for desktop sidebar
const tocItems = [
  { id: "domain-terms", title: "Термины предметной области", level: 2 },
  { id: "psychometric-terms", title: "Психометрические термины", level: 2 },
  { id: "technical-terms", title: "Технические термины", level: 2 },
];

export default async function GlossaryPage() {
  cacheLife('max');

  return (
    <>
      {/* Skip link for accessibility */}
      <a href="#glossary-content" className="glossary-skip-link">
        Перейти к содержимому
      </a>

      {/* Mobile bottom navigation - visible on mobile only */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <MobileSectionNav
          sections={glossarySections.map((s) => ({
            id: s.id,
            label: s.label,
            count: s.terms.length,
          }))}
        />
      </div>

      <div className="docs-content pb-24 lg:pb-8">
        <DocsBreadcrumb />

        {/* Two-column layout: Content + Desktop TOC */}
        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-8">
          {/* Main content column */}
          <div className="min-w-0">
            {/* Page Header - Mobile optimized */}
            <header className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2 sm:mb-3">
                Глоссарий
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-4">
                Определения терминов, используемых в платформе SkillSoft и
                документации.
              </p>

              {/* Search */}
              <GlossarySearchClient />
            </header>

            {/* Main Content - Sections with accordions */}
            <main id="glossary-content" tabIndex={-1} className="space-y-8 sm:space-y-10">
              {glossarySections.map((section) => (
                <GlossarySection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  terms={section.terms}
                  category={section.category}
                />
              ))}
            </main>

            {/* Footer Navigation */}
            <DocsFooterNav />
          </div>

          {/* Desktop TOC column - sticky sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <DocsToc items={tocItems} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
