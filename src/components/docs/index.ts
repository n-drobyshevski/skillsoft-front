/**
 * Documentation Hub Components
 *
 * A collection of components for building the SkillSoft internal documentation hub.
 * These components are designed for optimal readability, accessibility, and
 * mobile responsiveness.
 *
 * @module components/docs
 */

// Layout component
export { DocsLayout } from "./DocsLayout";
export type { NavItem, NavSection, DocsLayoutProps } from "./DocsLayout";

// Callout components for highlighting important information
export {
  DocsCallout,
  InfoCallout,
  WarningCallout,
  TipCallout,
  NoteCallout,
  DangerCallout,
} from "./DocsCallout";

// Code block components
export { DocsCodeBlock, DocsInlineCode } from "./DocsCodeBlock";

// Step-by-step guide components
export {
  DocsSteps,
  DocsStep,
  DocsStepsContainer,
} from "./DocsSteps";

// Navigation components
export { DocsNavLinks } from "./DocsNavLinks";

// Table of contents components
export { DocsTOC, DocsTOCMobile, useHeadings } from "./DocsTOC";

// Progress indicator
export { DocsProgress } from "./DocsProgress";

// Table components
export {
  DocsTable,
  DocsTableHeader,
  DocsTableBody,
  DocsTableRow,
  DocsTableHead,
  DocsTableCell,
  DocsSimpleTable,
} from "./DocsTable";
