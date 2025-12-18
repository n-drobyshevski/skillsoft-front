"use client";

/**
 * Example Documentation Page
 *
 * This file demonstrates the usage of all documentation components.
 * Use this as a reference for building documentation pages.
 */

import * as React from "react";
import {
  DocsLayout,
  NavSection,
  DocsCallout,
  InfoCallout,
  WarningCallout,
  TipCallout,
  DangerCallout,
  DocsCodeBlock,
  DocsInlineCode,
  DocsSteps,
  DocsNavLinks,
  DocsTOC,
  DocsTOCMobile,
  DocsSimpleTable,
} from "../index";

/* ===== NAVIGATION CONFIGURATION ===== */

const docsSections: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Quick Start", href: "/docs/quick-start", badge: "New" },
      {
        title: "Installation",
        href: "/docs/installation",
        children: [
          { title: "System Requirements", href: "/docs/installation/requirements" },
          { title: "Docker Setup", href: "/docs/installation/docker" },
          { title: "Manual Setup", href: "/docs/installation/manual" },
        ],
      },
    ],
  },
  {
    title: "Test Building",
    items: [
      { title: "Overview", href: "/docs/test-building" },
      { title: "Question Types", href: "/docs/test-building/question-types" },
      { title: "Scoring Rules", href: "/docs/test-building/scoring" },
      { title: "Validation", href: "/docs/test-building/validation" },
    ],
  },
  {
    title: "Psychometrics",
    items: [
      { title: "Formulas", href: "/docs/psychometrics/formulas" },
      { title: "Item Analysis", href: "/docs/psychometrics/item-analysis" },
      { title: "Reliability", href: "/docs/psychometrics/reliability" },
    ],
  },
];

/* ===== TABLE OF CONTENTS ===== */

const tocHeadings = [
  { id: "introduction", text: "Introduction", level: 2 as const },
  { id: "callouts", text: "Callout Components", level: 2 as const },
  { id: "callout-info", text: "Info Callout", level: 3 as const },
  { id: "callout-warning", text: "Warning Callout", level: 3 as const },
  { id: "callout-tip", text: "Tip Callout", level: 3 as const },
  { id: "callout-danger", text: "Danger Callout", level: 3 as const },
  { id: "code-blocks", text: "Code Blocks", level: 2 as const },
  { id: "tables", text: "Tables", level: 2 as const },
  { id: "steps", text: "Step-by-Step Guides", level: 2 as const },
];

/* ===== EXAMPLE PAGE CONTENT ===== */

export function ExampleDocsPage() {
  return (
    <DocsLayout
      sections={docsSections}
      title="Component Reference"
      description="A complete guide to using SkillSoft documentation components."
    >
      {/* Mobile TOC */}
      <DocsTOCMobile headings={tocHeadings} />

      {/* Introduction */}
      <section id="introduction">
        <h2 className="doc-section">Introduction</h2>
        <p className="doc-body">
          This page demonstrates all available documentation components.
          Each component is designed for optimal readability, accessibility,
          and mobile responsiveness.
        </p>
        <p className="doc-body">
          The <DocsInlineCode>DocsLayout</DocsInlineCode> component provides
          the main structure with sidebar navigation, mobile support, and
          reading progress indicator.
        </p>
      </section>

      {/* Callouts Section */}
      <section id="callouts">
        <h2 className="doc-section">Callout Components</h2>
        <p className="doc-body">
          Callouts are used to highlight important information. There are
          five variants available.
        </p>

        <h3 id="callout-info" className="doc-subsection">
          Info Callout
        </h3>
        <p className="doc-body">
          Use info callouts for general information and helpful context.
        </p>
        <InfoCallout title="Good to know">
          The assessment platform supports multiple question types including
          Likert scale, situational judgment, and multiple choice questions.
        </InfoCallout>

        <h3 id="callout-warning" className="doc-subsection">
          Warning Callout
        </h3>
        <p className="doc-body">
          Use warning callouts for important notices that require attention.
        </p>
        <WarningCallout title="Important">
          Always validate your test blueprint before publishing. Invalid
          configurations may lead to scoring errors.
        </WarningCallout>

        <h3 id="callout-tip" className="doc-subsection">
          Tip Callout
        </h3>
        <p className="doc-body">
          Use tip callouts for best practices and helpful suggestions.
        </p>
        <TipCallout title="Pro tip">
          Use keyboard shortcut <DocsInlineCode>Ctrl+K</DocsInlineCode> to
          quickly search the documentation from anywhere.
        </TipCallout>

        <h3 id="callout-danger" className="doc-subsection">
          Danger Callout
        </h3>
        <p className="doc-body">
          Use danger callouts for critical warnings and irreversible actions.
        </p>
        <DangerCallout title="Danger">
          Deleting a test template will permanently remove all associated
          sessions and results. This action cannot be undone.
        </DangerCallout>
      </section>

      {/* Code Blocks Section */}
      <section id="code-blocks">
        <h2 className="doc-section">Code Blocks</h2>
        <p className="doc-body">
          Code blocks support syntax highlighting, line numbers, and copy
          functionality.
        </p>

        <h3 className="doc-subsection">Basic Code Block</h3>
        <DocsCodeBlock
          code={`// Calculate discrimination index
const calculateRpb = (correct: number[], total: number[]) => {
  const mean = total.reduce((a, b) => a + b, 0) / total.length;
  // Point-biserial correlation formula
  return pearsonCorrelation(correct, total);
};`}
          language="typescript"
          filename="scoring.ts"
        />

        <h3 className="doc-subsection">With Line Highlighting</h3>
        <DocsCodeBlock
          code={`{
  "template": {
    "goal": "JOB_FIT",
    "questionCount": 25,
    "timeLimit": 1800
  },
  "competencies": [
    { "id": "uuid-1", "weight": 0.4 },
    { "id": "uuid-2", "weight": 0.6 }
  ]
}`}
          language="json"
          showLineNumbers
          highlightLines={[3, 4, 5]}
          caption="Blueprint configuration with highlighted goal settings"
        />

        <h3 className="doc-subsection">Formula Example</h3>
        <DocsCodeBlock
          code={`# Cronbach's Alpha Formula
alpha = (k / (k - 1)) * (1 - sum(var_i) / var_total)

Where:
  k = number of items
  var_i = variance of item i
  var_total = total variance of the scale`}
          language="text"
        />
      </section>

      {/* Tables Section */}
      <section id="tables">
        <h2 className="doc-section">Tables</h2>
        <p className="doc-body">
          Tables are responsive and scroll horizontally on mobile devices.
        </p>

        <DocsSimpleTable
          headers={["Metric", "Formula", "Good Threshold", "Purpose"]}
          rows={[
            [
              "Difficulty Index (p)",
              <DocsInlineCode key="p">Correct / Total</DocsInlineCode>,
              "0.2 - 0.9",
              "Item difficulty",
            ],
            [
              "Discrimination Index",
              <DocsInlineCode key="rpb">Point-Biserial r</DocsInlineCode>,
              ">= 0.25",
              "Distinguishing ability",
            ],
            [
              "Cronbach's Alpha",
              <DocsInlineCode key="alpha">(k/k-1) * (1 - sum/total)</DocsInlineCode>,
              ">= 0.7",
              "Internal consistency",
            ],
          ]}
          caption="Psychometric quality metrics used in validation"
        />
      </section>

      {/* Steps Section */}
      <section id="steps">
        <h2 className="doc-section">Step-by-Step Guides</h2>
        <p className="doc-body">
          Use steps to guide users through multi-step processes.
        </p>

        <DocsSteps
          steps={[
            {
              title: "Create a new test template",
              content: (
                <>
                  Navigate to <strong>Test Templates</strong> and click the{" "}
                  <strong>Create Template</strong> button. Fill in the basic
                  information including name, description, and goal type.
                </>
              ),
            },
            {
              title: "Configure competencies",
              content: (
                <>
                  Select the competencies to include in your assessment. Assign
                  weights to each competency based on the job requirements.
                  Total weights must sum to 1.0.
                </>
              ),
            },
            {
              title: "Add questions",
              content: (
                <>
                  Use the question builder to add assessment items. Each
                  question must be linked to a behavioral indicator and have
                  scoring rules configured.
                </>
              ),
            },
            {
              title: "Validate and publish",
              content: (
                <>
                  Run the validation checker to ensure your test meets quality
                  standards. Fix any issues flagged by the validator, then
                  publish the template.
                </>
              ),
            },
          ]}
        />
      </section>

      {/* Navigation Links */}
      <DocsNavLinks
        prev={{ href: "/docs/quick-start", title: "Quick Start Guide" }}
        next={{ href: "/docs/test-building", title: "Test Building Overview" }}
        labels={{ prev: "Previous", next: "Next" }}
      />

      {/* Desktop TOC (positioned in the layout) */}
      <div className="hidden xl:block fixed top-20 right-8 w-52">
        <DocsTOC headings={tocHeadings} />
      </div>
    </DocsLayout>
  );
}

export default ExampleDocsPage;
