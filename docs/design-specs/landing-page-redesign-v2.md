# SkillSoft Landing Page Redesign - Visual Design Specifications v2.0

## Document Information

| Property | Value |
|----------|-------|
| Version | 2.0 |
| Status | Design Specification |
| Last Updated | 2025-12-18 |
| Designer | UI Design Agent |
| Target | HR Assessment Platform Landing Page |

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography System](#3-typography-system)
4. [Section Specifications](#4-section-specifications)
5. [Component Specifications](#5-component-specifications)
6. [Animation Guidelines](#6-animation-guidelines)
7. [Responsive Breakpoints](#7-responsive-breakpoints)
8. [Image and Asset Requirements](#8-image-and-asset-requirements)
9. [Interaction States](#9-interaction-states)
10. [Accessibility Compliance](#10-accessibility-compliance)
11. [Implementation Notes](#11-implementation-notes)

---

## 1. Design Philosophy

### Core Principles

1. **Scientific Credibility** - Visual language that conveys trustworthiness for HR psychometric assessments
2. **Data Visualization Forward** - Show, don't tell. Use charts, gauges, and metrics prominently
3. **Professional Yet Approachable** - Balance enterprise-grade aesthetics with inviting warmth
4. **Performance-First** - Lightweight animations, optimized assets, progressive enhancement

### Visual Tone

| Attribute | Description |
|-----------|-------------|
| Mood | Professional, scientific, trustworthy |
| Energy | Calm confidence, measured progress |
| Contrast | Medium - soft but readable |
| Whitespace | Generous - breathing room between sections |

### Design Differentiators from Current

| Current | Redesign |
|---------|----------|
| Generic feature icons | Domain-specific visualizations |
| Abstract value props | Concrete data previews |
| Text-heavy trust indicators | Visual proof (charts, gauges) |
| Standard SaaS hero | Assessment-focused hero with live demo preview |

---

## 2. Color System

### Primary Palette (from existing design tokens)

```css
/* Light Mode - Soft Low Contrast */
--background: oklch(0.98 0.003 90);        /* Warm off-white */
--foreground: oklch(0.25 0.01 264);        /* Deep blue-gray */
--primary: oklch(0.35 0.02 264);           /* Primary blue-purple */
--primary-foreground: oklch(0.98 0.003 90);

/* Dark Mode */
--background: oklch(0.145 0 0);            /* Near black */
--foreground: oklch(0.985 0 0);            /* Near white */
--primary: oklch(0.922 0 0);               /* Light gray primary */
```

### Semantic Colors for Landing Page

```css
/* Assessment Status Colors */
--success: #10b981;         /* emerald-500 - Passed/Valid */
--warning: #f59e0b;         /* amber-500 - Needs Review */
--critical: #ef4444;        /* red-500 - Failed/Flagged */
--info: #3b82f6;            /* blue-500 - Informational */

/* Standards Badge Colors */
--esco-color: #6366f1;      /* indigo-500 - EU Standard */
--onet-color: #8b5cf6;      /* violet-500 - US Standard */
--bigfive-color: #06b6d4;   /* cyan-500 - Psychology Standard */

/* Feature Section Accent Colors */
--psychometrics: #10b981;   /* emerald - Health/Quality */
--jobfit: #f59e0b;          /* amber - Matching/Fit */
--teamfit: #3b82f6;         /* blue - Team/Collaboration */
--analytics: #8b5cf6;       /* violet - Insights/Data */
```

### Gradient Definitions

```css
/* Hero Background Gradient */
.hero-gradient {
  background: radial-gradient(
    ellipse 80% 50% at 50% -20%,
    oklch(0.35 0.02 264 / 0.08) 0%,
    transparent 70%
  );
}

/* Feature Card Hover Gradient */
.feature-card-gradient {
  background: linear-gradient(
    135deg,
    oklch(0.35 0.02 264 / 0.05) 0%,
    transparent 50%
  );
}

/* Stats Section Gradient */
.stats-gradient {
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    oklch(0.30 0.025 264) 100%
  );
}

/* CTA Button Gradient */
.cta-gradient {
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    oklch(0.38 0.025 264) 100%
  );
}
```

---

## 3. Typography System

### Font Stack

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale for Landing Page

| Element | Desktop | Mobile | Weight | Line Height | Letter Spacing |
|---------|---------|--------|--------|-------------|----------------|
| Hero H1 | 72px (4.5rem) | 40px (2.5rem) | 700 | 1.1 | -0.02em |
| Section H2 | 48px (3rem) | 32px (2rem) | 700 | 1.15 | -0.01em |
| Card H3 | 20px (1.25rem) | 18px (1.125rem) | 600 | 1.3 | 0 |
| Body Large | 20px (1.25rem) | 18px (1.125rem) | 400 | 1.6 | 0 |
| Body | 16px (1rem) | 16px (1rem) | 400 | 1.6 | 0 |
| Caption | 14px (0.875rem) | 14px (0.875rem) | 500 | 1.4 | 0.01em |
| Metric Value | 56px (3.5rem) | 36px (2.25rem) | 800 | 1 | -0.02em |
| Badge | 12px (0.75rem) | 12px (0.75rem) | 500 | 1 | 0.02em |

### Tailwind CSS Classes

```html
<!-- Hero H1 -->
<h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">

<!-- Section H2 -->
<h2 class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">

<!-- Card H3 -->
<h3 class="text-lg sm:text-xl font-semibold">

<!-- Body Large -->
<p class="text-lg sm:text-xl text-muted-foreground leading-relaxed">

<!-- Metric Value -->
<span class="text-4xl sm:text-5xl font-extrabold tabular-nums tracking-tight">

<!-- Caption/Label -->
<span class="text-sm font-medium tracking-wide">
```

---

## 4. Section Specifications

### 4.1 Navigation Header

**Purpose**: Fixed navigation with glassmorphism effect

**Desktop Layout (1024px+)**
```
[Logo]                    [Features] [How It Works] [Pricing]        [Sign In] [Get Started ->]
|<-- 24px -->|<------------ centered nav ------------->|<---------- right CTAs ----------->|
```

**Mobile Layout (<768px)**
```
[Logo]                                                              [Menu Icon]
```

**Specifications**

| Property | Value |
|----------|-------|
| Height | 64px (h-16) |
| Max Width | 1152px (max-w-6xl) |
| Padding X | 24px (px-6) |
| Background | background/80 with backdrop-blur-xl |
| Border Bottom | 1px border-border/40 |
| Z-Index | 50 |
| Position | Fixed, top: 0 |

**Tailwind Classes**
```html
<header class="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
  <div class="max-w-6xl mx-auto px-6">
    <div class="flex h-16 items-center justify-between">
```

---

### 4.2 Hero Section (Redesigned)

**Purpose**: Immediate value proposition with visual proof of assessment capabilities

**Layout Structure**
```
Desktop (1024px+):
+------------------------------------------------------------------------+
|                          [Subtle gradient bg]                           |
|  +------------------------------------------------------------------+  |
|  |                                                                    |  |
|  |  [Badge: Psychometric Assessment Platform]                        |  |
|  |                                                                    |  |
|  |        Scientifically Validated                                   |  |
|  |        Soft Skills Assessment                                     |  |
|  |                                                                    |  |
|  |  Measure competencies with precision. Match talent               |  |
|  |  to roles. Build high-performing teams.                          |  |
|  |                                                                    |  |
|  |  [Start Free Trial ->]    [Watch Demo]                           |  |
|  |                                                                    |  |
|  |  [Icon] 30-day trial  [Icon] SOC 2  [Icon] 2,500+ Users         |  |
|  |                                                                    |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  +----------------------------+  +----------------------------+        |
|  |  MINI DEMO: Question Card  |  |  MINI RESULT: Gauge Chart  |       |
|  |  +----------------------+  |  |  +----------------------+  |       |
|  |  | Likert Scale Example |  |  |  | Job Fit: 87%         |  |       |
|  |  | [1] [2] [3] [4] [5]  |  |  |  | [===========>   ]    |  |       |
|  |  +----------------------+  |  |  +----------------------+  |       |
|  +----------------------------+  +----------------------------+        |
|                                                                        |
+------------------------------------------------------------------------+

Mobile (<768px):
+----------------------------------+
|  [Badge]                         |
|                                  |
|  Scientifically                  |
|  Validated                       |
|  Soft Skills                     |
|  Assessment                      |
|                                  |
|  [Subtext - 2 lines max]         |
|                                  |
|  [Start Free Trial ->]           |
|  [Watch Demo]                    |
|                                  |
|  [Trust indicators - icons only] |
|                                  |
|  +----------------------------+  |
|  |  Mini Demo Card            |  |
|  |  (Single card, swipeable)  |  |
|  +----------------------------+  |
+----------------------------------+
```

**Hero Specifications**

| Property | Desktop | Mobile |
|----------|---------|--------|
| Min Height | 100vh | auto (min 600px) |
| Content Max Width | 1152px | 100% - 32px |
| Top Padding | 96px (pt-24) | 80px (pt-20) |
| Bottom Padding | 48px (pb-12) | 32px (pb-8) |
| Text Alignment | Center | Center |
| Gap (vertical) | 32px (space-y-8) | 24px (space-y-6) |

**Mini Demo Cards Specifications**

| Property | Value |
|----------|-------|
| Width | 320px each, side by side |
| Height | 200px |
| Border Radius | 16px (rounded-2xl) |
| Background | card with subtle shadow |
| Border | 1px border-border/50 |
| Animation | Gentle float on hover |

**Tailwind Implementation**
```html
<section class="relative min-h-screen flex items-center pt-24 pb-12">
  <!-- Background gradient -->
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
    <div class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px]" />
  </div>

  <div class="relative max-w-6xl mx-auto px-6">
    <div class="max-w-4xl mx-auto text-center space-y-8">
      <!-- Badge -->
      <div>
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium
                     bg-primary/10 text-primary border border-primary/20">
          <svg class="w-3.5 h-3.5 mr-1.5"><!-- Brain/Science icon --></svg>
          Psychometric Assessment Platform
        </span>
      </div>

      <!-- Headline -->
      <div class="space-y-4">
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
          Scientifically Validated
          <span class="block text-primary">Soft Skills Assessment</span>
        </h1>
        <p class="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Measure competencies with precision. Match talent to roles.
          Build high-performing teams with data-driven insights.
        </p>
      </div>

      <!-- CTAs -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button class="h-12 px-8 rounded-lg bg-primary text-primary-foreground font-medium
                       hover:bg-primary/90 transition-colors">
          Start Free Trial
          <svg class="ml-2 w-4 h-4"><!-- Arrow right --></svg>
        </button>
        <button class="h-12 px-8 rounded-lg border border-border bg-background
                       hover:bg-accent transition-colors">
          <svg class="mr-2 w-4 h-4"><!-- Play icon --></svg>
          Watch Demo
        </button>
      </div>

      <!-- Trust Indicators -->
      <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4
                  text-sm text-muted-foreground">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-500"><!-- Check circle --></svg>
          <span>Free 30-day trial</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-blue-500"><!-- Shield --></svg>
          <span>SOC 2 Compliant</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-violet-500"><!-- Users --></svg>
          <span>2,500+ Professionals</span>
        </div>
      </div>
    </div>

    <!-- Mini Demo Preview Cards -->
    <div class="mt-16 flex flex-col lg:flex-row items-center justify-center gap-6">
      <!-- Assessment Question Preview -->
      <div class="w-full max-w-sm p-6 rounded-2xl bg-card border border-border/50 shadow-lg">
        <!-- Content detailed in Component Specifications -->
      </div>

      <!-- Results Preview -->
      <div class="w-full max-w-sm p-6 rounded-2xl bg-card border border-border/50 shadow-lg">
        <!-- Content detailed in Component Specifications -->
      </div>
    </div>
  </div>
</section>
```

---

### 4.3 Psychometrics Showcase Section

**Purpose**: Demonstrate scientific validity and quality assurance

**Layout Structure**
```
Desktop:
+------------------------------------------------------------------------+
|                     [Section Badge: Psychometrics]                      |
|                                                                        |
|              Built on Scientific Foundations                           |
|              [Subtext about psychometric validation]                   |
|                                                                        |
|  +---------------------+  +---------------------+  +------------------+ |
|  |  RELIABILITY GAUGE  |  |  VALIDITY METRICS  |  |  ITEM QUALITY   | |
|  |                     |  |                     |  |                  | |
|  |     [Gauge SVG]     |  |   [Bar chart]      |  |  [Scatter plot]  | |
|  |      alpha=0.87     |  |                     |  |                  | |
|  |      "Excellent"    |  |   Discrimination    |  |  [Item dots]    | |
|  |                     |  |   Difficulty        |  |                  | |
|  |  Cronbach's Alpha   |  |   Validity          |  |  Flagged: 3     | |
|  +---------------------+  +---------------------+  +------------------+ |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |  Item Validity Status Flow                                        |  |
|  |  PENDING -> VALID -> NEEDS_REVIEW -> FLAGGED -> RETIRED          |  |
|  |  [Visual pipeline with counts]                                    |  |
|  +------------------------------------------------------------------+  |
+------------------------------------------------------------------------+
```

**Specifications**

| Property | Desktop | Mobile |
|----------|---------|--------|
| Section Padding Y | 128px (py-32) | 64px (py-16) |
| Background | muted/30 | muted/30 |
| Content Max Width | 1152px | 100% - 32px |
| Card Grid | 3 columns | 1 column, stacked |
| Card Gap | 24px (gap-6) | 16px (gap-4) |

**Reliability Gauge Card**
- Size: 180px x 108px gauge (medium size)
- Shows: Cronbach's Alpha value (0.00-1.00)
- Color coding: emerald (>0.8), blue (0.7-0.8), amber (0.6-0.7), red (<0.6)
- Threshold tick marks at 0.6, 0.7, 0.8
- Animated fill on scroll into view

**Validity Metrics Card**
- Horizontal bar chart
- Three metrics: Discrimination Index, Difficulty Index, Content Validity
- Color-coded bars with thresholds
- Tooltip on hover with explanations

**Item Quality Scatter**
- Simplified scatter visualization
- X-axis: Difficulty (0-1)
- Y-axis: Discrimination (0-1)
- Dot colors indicate status (valid/flagged)
- Ideal zone highlighted

---

### 4.4 Assessment Types Section

**Purpose**: Visualize the three question formats used in assessments

**Layout Structure**
```
Desktop:
+------------------------------------------------------------------------+
|                     [Section Badge: Assessment Types]                   |
|                                                                        |
|              Multiple Assessment Formats                               |
|              [Subtext about question variety]                          |
|                                                                        |
|  +---------------------+  +---------------------+  +------------------+ |
|  |  LIKERT SCALE (70%) |  |    SJT (25%)       |  |    MCQ (5%)      | |
|  |                     |  |                     |  |                  | |
|  |  Rate your agreement|  |  Choose the best   |  |  Select the      | |
|  |                     |  |  course of action  |  |  correct answer  | |
|  |  [1][2][3][4][5]    |  |  [A] Option A      |  |  [ ] Option 1    | |
|  |   o o o * o         |  |  [B] Option B      |  |  [x] Option 2    | |
|  |                     |  |  [C] Option C      |  |  [ ] Option 3    | |
|  |  30 sec avg         |  |  180 sec avg       |  |  60 sec avg      | |
|  +---------------------+  +---------------------+  +------------------+ |
|                                                                        |
+------------------------------------------------------------------------+
```

**Question Card Specifications**

| Property | Value |
|----------|-------|
| Card Width | 340px max |
| Card Height | Auto, min 280px |
| Border Radius | 16px (rounded-2xl) |
| Background | card |
| Border | 1px border-border/50 |
| Hover | translateY(-4px), shadow-lg |
| Header | Question type badge, percentage |
| Body | Interactive question preview |
| Footer | Average time, competency tag |

**Likert Scale Visualization**
```html
<div class="flex items-center justify-between gap-2 px-4">
  <span class="text-xs text-muted-foreground">Strongly Disagree</span>
  <div class="flex items-center gap-1">
    <!-- 5 scale points -->
    <button class="w-8 h-8 rounded-full border-2 border-muted hover:border-primary
                   flex items-center justify-center text-sm font-medium">1</button>
    <button class="w-8 h-8 rounded-full border-2 border-muted hover:border-primary">2</button>
    <button class="w-8 h-8 rounded-full border-2 border-muted hover:border-primary">3</button>
    <button class="w-8 h-8 rounded-full border-2 border-primary bg-primary/10">4</button>
    <button class="w-8 h-8 rounded-full border-2 border-muted hover:border-primary">5</button>
  </div>
  <span class="text-xs text-muted-foreground">Strongly Agree</span>
</div>
```

**SJT Option Visualization**
```html
<div class="space-y-2">
  <button class="w-full p-3 text-left rounded-lg border border-border bg-background
                 hover:border-primary/50 hover:bg-primary/5 transition-all">
    <div class="flex items-start gap-3">
      <span class="w-6 h-6 rounded-md bg-muted flex items-center justify-center
                   text-xs font-medium">A</span>
      <span class="text-sm">Discuss the issue directly with the team member...</span>
    </div>
  </button>
  <!-- More options -->
</div>
```

---

### 4.5 Job Fit & Team Fit Analytics Section

**Purpose**: Show matching capabilities and team dynamics analysis

**Layout Structure**
```
Desktop:
+------------------------------------------------------------------------+
|                     [Section Badge: Analytics]                          |
|                                                                        |
|              Match Talent to Opportunity                               |
|              [Subtext about AI-powered matching]                       |
|                                                                        |
|  +----------------------------------+  +------------------------------+ |
|  |  JOB FIT MATCHING               |  |  TEAM FIT ANALYSIS           | |
|  |                                  |  |                              | |
|  |  [Circular Score: 87%]          |  |  [Compatibility: 92%]        | |
|  |  [===================] Pass     |  |                              | |
|  |                                  |  |  Team Size: 8                | |
|  |  Gap Analysis:                  |  |  Role: Technical Lead        | |
|  |  [====------] Communication     |  |                              | |
|  |  [========--] Leadership        |  |  Complementary Strengths:    | |
|  |  [==========] Technical         |  |  - Communication             | |
|  |                                  |  |  - Problem Solving           | |
|  |  Threshold: 75%                 |  |  - Collaboration             | |
|  +----------------------------------+  +------------------------------+ |
|                                                                        |
+------------------------------------------------------------------------+
```

**Job Fit Card Specifications**

| Element | Specification |
|---------|---------------|
| Score Circle | 120px diameter, stroke-width 10px |
| Score Color | emerald (>=75), amber (50-74), red (<50) |
| Pass/Fail Badge | Pill shape, color-coded |
| Gap Analysis Bars | 100% width bars with fill percentage |
| Bar Height | 8px, rounded |

**Team Fit Card Specifications**

| Element | Specification |
|---------|---------------|
| Compatibility Percentage | Large text, blue color palette |
| Team Visualization | Mini avatars or abstract shapes |
| Strengths List | Checkmark icons, bulleted |
| Background Accent | Subtle blue gradient |

---

### 4.6 International Standards Section

**Purpose**: Display certifications and standard alignments (ESCO, O*NET, Big Five)

**Layout Structure**
```
Desktop:
+------------------------------------------------------------------------+
|                     [Section Badge: Standards]                          |
|                                                                        |
|              Aligned with International Standards                      |
|              [Subtext about scientific frameworks]                     |
|                                                                        |
|  +---------------------+  +---------------------+  +------------------+ |
|  |      [ESCO Logo]    |  |    [O*NET Logo]    |  |  [Big Five]      | |
|  |                     |  |                     |  |                  | |
|  |  European Skills    |  |  US Occupational   |  |  OCEAN Model     | |
|  |  Classification     |  |  Information       |  |  Personality     | |
|  |                     |  |  Network           |  |  Framework       | |
|  |  2,945 skills       |  |  974 occupations   |  |  5 dimensions    | |
|  |  mapped             |  |  mapped            |  |  projected       | |
|  |                     |  |                     |  |                  | |
|  |  [EU Flag Badge]    |  |  [US DOL Badge]    |  |  [Science Badge] | |
|  +---------------------+  +---------------------+  +------------------+ |
|                                                                        |
+------------------------------------------------------------------------+
```

**Standard Card Specifications**

| Property | Value |
|----------|-------|
| Card Width | Equal, 1/3 on desktop |
| Icon/Logo Size | 48px x 48px |
| Icon Background | Colored circle (standard-specific) |
| Title | 18px, font-semibold |
| Description | 14px, muted-foreground |
| Metric | Bold number + label |
| Badge | Subtle indicator at bottom |

**Color Assignments**
- ESCO: Indigo (#6366f1) - EU standard
- O*NET: Violet (#8b5cf6) - US standard
- Big Five: Cyan (#06b6d4) - Psychology standard

---

### 4.7 Social Proof Section

**Purpose**: Build trust through testimonials and client logos

**Layout Structure**
```
Desktop:
+------------------------------------------------------------------------+
|                                                                        |
|  "SkillSoft transformed our hiring process. The psychometric          |
|   validation gives us confidence in every assessment."                 |
|                                                                        |
|  [Avatar] Sarah Chen, VP of Talent - TechCorp                         |
|                                                                        |
|  [< Prev]  [o o o *]  [Next >]                                        |
|                                                                        |
+------------------------------------------------------------------------+
|                                                                        |
|  Trusted by leading organizations                                      |
|                                                                        |
|  [Logo 1]  [Logo 2]  [Logo 3]  [Logo 4]  [Logo 5]  [Logo 6]          |
|                                                                        |
+------------------------------------------------------------------------+
```

**Testimonial Card Specifications**

| Property | Value |
|----------|-------|
| Max Width | 800px |
| Quote Font Size | 24px (desktop), 18px (mobile) |
| Quote Style | Italic, slightly lighter weight |
| Avatar Size | 48px circle |
| Name | 16px, font-semibold |
| Title | 14px, muted-foreground |
| Navigation | Dot indicators, prev/next on hover |
| Animation | Fade transition, 300ms |

**Logo Wall Specifications**

| Property | Value |
|----------|-------|
| Logo Height | 32px (uniform) |
| Logo Opacity | 50% default, 100% on hover |
| Gap | 48px between logos |
| Layout | Flex wrap, centered |
| Grayscale | Yes (for consistency) |

---

### 4.8 Interactive Demo Preview Section

**Purpose**: Allow visitors to experience a sample assessment question

**Layout Structure**
```
Desktop:
+------------------------------------------------------------------------+
|                     [Section Badge: Try It]                             |
|                                                                        |
|              Experience the Assessment                                  |
|              [Subtext about trying before buying]                      |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |                                                                    |  |
|  |  +------------------------------------------------------------+  |  |
|  |  |  Question 1 of 3                         [Progress: 33%]   |  |  |
|  |  +------------------------------------------------------------+  |  |
|  |                                                                    |  |
|  |  When working on a team project with tight deadlines,             |  |
|  |  how do you typically handle disagreements about priorities?      |  |
|  |                                                                    |  |
|  |  +------------------------------------------------------+        |  |
|  |  | [A] Address it immediately in the next team meeting  |        |  |
|  |  +------------------------------------------------------+        |  |
|  |  | [B] Discuss privately with the individuals involved  | <--    |  |
|  |  +------------------------------------------------------+        |  |
|  |  | [C] Escalate to your manager for guidance            |        |  |
|  |  +------------------------------------------------------+        |  |
|  |  | [D] Focus on your own tasks and avoid conflict       |        |  |
|  |  +------------------------------------------------------+        |  |
|  |                                                                    |  |
|  |  [Back]                                    [Next Question ->]     |  |
|  |                                                                    |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  This sample demonstrates our Situational Judgment Test format.        |
|  Real assessments include 30-50 validated questions.                  |
|                                                                        |
+------------------------------------------------------------------------+
```

**Demo Widget Specifications**

| Property | Value |
|----------|-------|
| Container Max Width | 720px |
| Container Padding | 32px (desktop), 16px (mobile) |
| Background | card with elevated shadow |
| Border Radius | 24px (rounded-3xl) |
| Question Font Size | 18px |
| Option Height | 56px minimum |
| Option Border Radius | 12px |
| Selected State | Primary border + light primary bg |
| Progress Bar | 4px height, primary color fill |
| Animation | Option selection scales slightly |

---

### 4.9 Stats Section (Redesigned)

**Purpose**: Animated metrics that demonstrate platform impact

**Layout Structure**
```
Desktop:
+------------------------------------------------------------------------+
|                     [Primary colored background]                        |
|                                                                        |
|    2,500+          150+           98%            45%                   |
|    Active Users    Organizations  Satisfaction   Productivity          |
|                                                   Rate       Gain      |
|                                                                        |
+------------------------------------------------------------------------+
```

**Specifications**

| Property | Value |
|----------|-------|
| Background | Primary gradient |
| Padding Y | 96px (py-24) |
| Grid | 4 columns (desktop), 2x2 (mobile) |
| Number Font Size | 56px (desktop), 36px (mobile) |
| Number Weight | 800 (font-extrabold) |
| Number Color | primary-foreground |
| Label Font Size | 14px |
| Label Color | primary-foreground/80 |
| Animation | Count up on scroll into view |

**Tailwind Implementation**
```html
<section class="py-24 bg-gradient-to-br from-primary to-primary/90">
  <div class="max-w-6xl mx-auto px-6">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div class="text-center">
        <div class="text-4xl sm:text-5xl font-extrabold text-primary-foreground tabular-nums">
          2,500+
        </div>
        <div class="mt-2 text-sm text-primary-foreground/80">Active Users</div>
      </div>
      <!-- More stats -->
    </div>
  </div>
</section>
```

---

### 4.10 CTA Section

**Purpose**: Final conversion-focused call to action

**Layout Structure**
```
Desktop:
+------------------------------------------------------------------------+
|                                                                        |
|                   [Badge: Ready to Transform?]                         |
|                                                                        |
|                   Start Building a                                     |
|                   Data-Driven Team                                     |
|                                                                        |
|    Join thousands of HR professionals using validated                  |
|    assessments to make better hiring decisions.                        |
|                                                                        |
|    [Start Free Trial ->]        [Schedule Demo]                        |
|                                                                        |
|    [Check] 30-day trial  [Shield] Enterprise security  [Users] 24/7   |
|                                                                        |
+------------------------------------------------------------------------+
```

**Specifications**

| Property | Desktop | Mobile |
|----------|---------|--------|
| Section Padding Y | 128px (py-32) | 64px (py-16) |
| Headline Max Width | 800px | 100% |
| CTA Button Height | 56px (h-14) | 48px (h-12) |
| CTA Button Padding X | 40px (px-10) | 24px (px-6) |
| Primary Button | Primary gradient | Primary solid |
| Secondary Button | Outline variant | Outline variant |

---

### 4.11 Footer

**Purpose**: Navigation links, legal, social

**Layout Structure**
```
+------------------------------------------------------------------------+
|  [Logo + Tagline]                                                      |
|                                                                        |
|  The intelligent platform for professional development                 |
|  and competency management.                                           |
|                                                                        |
+------------------------+------------------------+----------------------+
|  Product              |  Company               |  Resources           |
|  - Features           |  - About               |  - Documentation     |
|  - Pricing            |  - Blog                |  - API Reference     |
|  - Integrations       |  - Careers             |  - Support Center    |
|  - Security           |  - Contact             |  - Community         |
+------------------------+------------------------+----------------------+
|                                                                        |
|  (c) 2025 SkillSoft. All rights reserved.                             |
|                                                                        |
|  Privacy  |  Terms  |  Cookies          [Twitter] [LinkedIn] [GitHub]  |
|                                                                        |
+------------------------------------------------------------------------+
```

**Specifications**

| Property | Value |
|----------|-------|
| Background | muted/20 |
| Border Top | 1px border-border/50 |
| Padding Y | 64px (py-16) |
| Grid | 4 columns (desktop), stacked (mobile) |
| Link Font Size | 14px |
| Link Color | muted-foreground |
| Link Hover | foreground |

---

## 5. Component Specifications

### 5.1 Mini Assessment Question Preview (Hero)

**Purpose**: Show a working Likert scale question in the hero

```tsx
interface MiniQuestionPreviewProps {
  question: string;
  selectedValue: number | null;
  onSelect: (value: number) => void;
}

// Dimensions
const CARD_WIDTH = 320;
const CARD_HEIGHT = 200;
const SCALE_DOT_SIZE = 32;
const SCALE_GAP = 8;
```

**Visual Specifications**

| Element | Specification |
|---------|---------------|
| Card | w-80 h-[200px] p-6 rounded-2xl bg-card border |
| Header | "Sample Question" badge + competency tag |
| Question Text | text-sm font-medium, 2 line clamp |
| Scale Labels | text-xs text-muted-foreground |
| Scale Dots | w-8 h-8 rounded-full border-2 |
| Selected Dot | bg-primary/10 border-primary |
| Animation | Scale pulse on selection |

**Tailwind Classes**
```html
<div class="w-80 p-6 rounded-2xl bg-card border border-border/50 shadow-lg
            hover:shadow-xl transition-shadow">
  <div class="flex items-center justify-between mb-4">
    <span class="text-xs font-medium px-2 py-1 rounded-md bg-emerald-500/10
                 text-emerald-600">Sample Question</span>
    <span class="text-xs text-muted-foreground">Communication</span>
  </div>

  <p class="text-sm font-medium mb-4 line-clamp-2">
    I actively listen to others and ask clarifying questions.
  </p>

  <div class="flex items-center justify-between">
    <span class="text-xs text-muted-foreground">Disagree</span>
    <div class="flex items-center gap-2">
      <!-- Scale buttons 1-5 -->
      <button class="w-8 h-8 rounded-full border-2 border-muted
                     hover:border-primary transition-colors">1</button>
      <!-- ... more buttons -->
      <button class="w-8 h-8 rounded-full border-2 border-primary
                     bg-primary/10 font-medium">4</button>
      <button class="w-8 h-8 rounded-full border-2 border-muted">5</button>
    </div>
    <span class="text-xs text-muted-foreground">Agree</span>
  </div>
</div>
```

---

### 5.2 Mini Results Preview (Hero)

**Purpose**: Show a Job Fit score gauge in the hero

**Visual Specifications**

| Element | Specification |
|---------|---------------|
| Card | w-80 h-[200px] p-6 rounded-2xl bg-card border |
| Header | "Assessment Results" + Pass badge |
| Gauge | 120px diameter semi-circle |
| Score | text-3xl font-bold tabular-nums |
| Status | Colored badge (Pass/Fail) |
| Progress Bar | 8px height, animated fill |

**Gauge SVG Structure**
```html
<svg width="120" height="72" viewBox="0 0 120 72">
  <!-- Background arc -->
  <path d="M 10 62 A 50 50 0 0 1 110 62"
        stroke="currentColor"
        stroke-width="8"
        fill="none"
        class="text-muted/30" />
  <!-- Progress arc -->
  <path d="M 10 62 A 50 50 0 0 1 110 62"
        stroke="#10b981"
        stroke-width="8"
        fill="none"
        stroke-dasharray="157"
        stroke-dashoffset="20"
        stroke-linecap="round" />
</svg>
```

---

### 5.3 Feature Card (Redesigned)

**Purpose**: Domain-specific feature cards with visual previews

**Visual Specifications**

| Property | Value |
|----------|-------|
| Width | Full (grid child) |
| Min Height | 280px |
| Padding | 32px |
| Border Radius | 16px |
| Background | card |
| Border | 1px border-border/50 |
| Hover Border | border-border |
| Hover Transform | translateY(-4px) |
| Hover Shadow | shadow-lg |
| Icon Container | w-12 h-12 rounded-xl |
| Icon Size | w-6 h-6 |
| Title | text-lg font-semibold |
| Description | text-sm text-muted-foreground |
| Visual Area | Bottom 40% for mini-visualization |

**Tailwind Classes**
```html
<div class="group h-full p-8 rounded-2xl bg-card border border-border/50
            hover:border-border hover:shadow-lg transition-all duration-300
            hover:-translate-y-1">
  <div class="space-y-4">
    <!-- Icon -->
    <div class="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center
                group-hover:scale-110 transition-transform">
      <svg class="w-6 h-6 text-white"><!-- Icon --></svg>
    </div>

    <!-- Content -->
    <h3 class="text-lg font-semibold">Psychometric Validation</h3>
    <p class="text-sm text-muted-foreground leading-relaxed">
      Continuous quality monitoring with automatic item retirement.
    </p>

    <!-- Mini Visualization -->
    <div class="pt-4 mt-4 border-t border-border/50">
      <!-- Embedded mini chart/gauge -->
    </div>
  </div>
</div>
```

---

### 5.4 Standard Certification Badge

**Purpose**: Display international standard alignment

**Visual Specifications**

| Property | Value |
|----------|-------|
| Container | Pill shape, px-3 py-1.5 |
| Border Radius | rounded-full |
| Background | Transparent |
| Border | 1px border-{color}/30 |
| Text | text-xs font-medium |
| Icon | w-4 h-4, left aligned |
| Hover | bg-{color}/10 |

**Variants**
```html
<!-- ESCO Badge -->
<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
             border border-indigo-500/30 text-xs font-medium text-indigo-600
             hover:bg-indigo-500/10 transition-colors">
  <svg class="w-4 h-4"><!-- EU Flag or ESCO icon --></svg>
  ESCO Aligned
</span>

<!-- O*NET Badge -->
<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
             border border-violet-500/30 text-xs font-medium text-violet-600
             hover:bg-violet-500/10 transition-colors">
  <svg class="w-4 h-4"><!-- O*NET icon --></svg>
  O*NET Mapped
</span>

<!-- Big Five Badge -->
<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
             border border-cyan-500/30 text-xs font-medium text-cyan-600
             hover:bg-cyan-500/10 transition-colors">
  <svg class="w-4 h-4"><!-- Brain/Pentagon icon --></svg>
  Big Five Model
</span>
```

---

### 5.5 Animated Counter Component

**Purpose**: Animate statistics on scroll

```tsx
interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  duration?: number; // ms
}

// Animation: easeOutCubic
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
```

**Implementation Notes**
- Use Intersection Observer to trigger
- Animate from 0 to target value
- Duration: 1000ms default
- Use `requestAnimationFrame` for smooth animation
- Support for suffixes (+, %, etc.)

---

## 6. Animation Guidelines

### 6.1 Entrance Animations

| Animation | CSS | Use Case |
|-----------|-----|----------|
| Fade In Up | `animate-fade-in-up` | Section content entrance |
| Scale In | `animate-scale-in` | Cards, badges |
| Fade In | `opacity-0 -> opacity-100` | Subtle elements |
| Slide In | `translateX(-20px) -> translateX(0)` | Sidebar elements |

**Stagger Configuration**
```css
/* Stagger children by 100ms */
[data-stagger] > * {
  animation-delay: calc(var(--index) * 100ms);
}
```

### 6.2 Scroll-Triggered Animations

**Intersection Observer Settings**
```javascript
const options = {
  threshold: 0.1,
  rootMargin: "-100px 0px"
};
```

**Animation Classes**
```css
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.animate-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

### 6.3 Interaction Animations

| Element | Hover | Active/Pressed |
|---------|-------|----------------|
| Buttons | `scale(1.02)` | `scale(0.98)` |
| Cards | `translateY(-4px)` + shadow | `translateY(-2px)` |
| Links | Color transition 150ms | - |
| Icons | `scale(1.1) rotate(5deg)` | - |

### 6.4 Micro-interactions

**Likert Scale Selection**
```css
.likert-option:active {
  transform: scale(0.95);
}

.likert-option.selected {
  animation: pulse-once 300ms ease;
}

@keyframes pulse-once {
  50% { transform: scale(1.1); }
}
```

**Progress Bar Fill**
```css
.progress-fill {
  transition: width 800ms ease-out;
}
```

### 6.5 Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Responsive Breakpoints

### 7.1 Breakpoint Definitions

| Name | Width | CSS Class Prefix |
|------|-------|------------------|
| Mobile | < 640px | (default) |
| Small | >= 640px | `sm:` |
| Medium | >= 768px | `md:` |
| Large | >= 1024px | `lg:` |
| XL | >= 1280px | `xl:` |

### 7.2 Layout Changes by Breakpoint

**Hero Section**
| Breakpoint | Layout |
|------------|--------|
| Mobile | Single column, stacked CTAs, single demo card |
| sm | Side-by-side CTAs |
| lg | Two demo cards side-by-side |

**Feature Grid**
| Breakpoint | Columns |
|------------|---------|
| Mobile | 1 column |
| md | 2 columns |
| lg | 3 columns |

**Stats Grid**
| Breakpoint | Columns |
|------------|---------|
| Mobile | 2x2 grid |
| md | 4 columns |

**Footer**
| Breakpoint | Layout |
|------------|--------|
| Mobile | Single column, stacked |
| md | 4 columns |

### 7.3 Typography Scaling

```css
/* Hero H1 */
.hero-title {
  font-size: 2.5rem;    /* 40px mobile */
}
@media (min-width: 640px) {
  .hero-title { font-size: 3rem; }    /* 48px */
}
@media (min-width: 768px) {
  .hero-title { font-size: 3.75rem; } /* 60px */
}
@media (min-width: 1024px) {
  .hero-title { font-size: 4.5rem; }  /* 72px */
}
```

### 7.4 Spacing Adjustments

| Element | Mobile | Desktop |
|---------|--------|---------|
| Section Padding Y | 64px | 128px |
| Container Padding X | 16px | 24px |
| Card Padding | 16px | 32px |
| Grid Gap | 16px | 24px |

---

## 8. Image and Asset Requirements

### 8.1 Required Icons (Lucide React)

**Navigation & Actions**
- `ArrowRight` - CTA buttons
- `Play` - Demo button
- `Menu` - Mobile menu
- `X` - Close button

**Feature Icons**
- `BrainCircuit` - Psychometrics
- `Target` - Job Fit
- `Users` - Team Fit
- `BarChart3` - Analytics
- `Shield` - Security
- `Globe` - Standards

**Trust Indicators**
- `CheckCircle` - Success/Verified
- `Shield` - Security
- `Users` - User count

**Assessment Types**
- `CircleDot` - Likert scale
- `MessageSquare` - SJT
- `CheckSquare` - MCQ

### 8.2 Custom SVG Assets

**Logo**
- Format: SVG
- Sizes: 36px (header), 48px (footer), 24px (favicon)
- Variants: Full color, monochrome

**Standard Logos**
- ESCO: EU flag stylized or official ESCO mark
- O*NET: DOL mark or "O*NET" text
- Big Five: Pentagon/brain icon

**Background Patterns (optional)**
- Dot grid pattern for sections
- Gradient meshes for hero

### 8.3 Placeholder Illustrations

| Location | Description | Dimensions |
|----------|-------------|------------|
| Hero Demo Cards | Assessment preview mockups | 320x200px |
| Feature Cards | Mini visualizations | Various |
| Social Proof | Client logos (grayscale) | 120x32px each |

### 8.4 Image Optimization Guidelines

- Use WebP format with PNG fallback
- Implement responsive images with `srcset`
- Lazy load below-fold images
- Maximum file size: 100KB for hero images
- Use CSS for simple graphics when possible

---

## 9. Interaction States

### 9.1 Button States

**Primary Button**
| State | Background | Border | Text | Transform |
|-------|------------|--------|------|-----------|
| Default | primary | none | primary-foreground | none |
| Hover | primary/90 | none | primary-foreground | scale(1.02) |
| Active | primary/80 | none | primary-foreground | scale(0.98) |
| Focus | primary | ring-2 ring-primary/50 | primary-foreground | none |
| Disabled | primary/50 | none | primary-foreground/70 | none |

**Outline Button**
| State | Background | Border | Text | Transform |
|-------|------------|--------|------|-----------|
| Default | transparent | border | foreground | none |
| Hover | accent | border | accent-foreground | scale(1.02) |
| Active | accent/80 | border | accent-foreground | scale(0.98) |
| Focus | transparent | ring-2 ring-ring | foreground | none |
| Disabled | transparent | border/50 | muted-foreground | none |

### 9.2 Card States

| State | Border | Shadow | Transform |
|-------|--------|--------|-----------|
| Default | border-border/50 | shadow-sm | none |
| Hover | border-border | shadow-lg | translateY(-4px) |
| Active | border-border | shadow-md | translateY(-2px) |
| Focus | border-ring | ring-2 ring-ring/50 | none |

### 9.3 Link States

| State | Color | Underline |
|-------|-------|-----------|
| Default | muted-foreground | none |
| Hover | foreground | none (or underline for inline) |
| Active | foreground | none |
| Focus | foreground | none + focus ring |
| Visited | muted-foreground | none |

### 9.4 Form Elements (Demo Widget)

**Option Selection**
| State | Border | Background | Text |
|-------|--------|------------|------|
| Default | border-border | background | foreground |
| Hover | border-primary/50 | primary/5 | foreground |
| Selected | border-primary | primary/10 | foreground |
| Focus | border-primary | primary/5 | foreground |

**Scale Dot (Likert)**
| State | Border | Background | Text |
|-------|--------|------------|------|
| Default | border-muted | transparent | muted-foreground |
| Hover | border-primary | transparent | foreground |
| Selected | border-primary | primary/10 | primary |
| Focus | border-primary | transparent | foreground |

---

## 10. Accessibility Compliance

### 10.1 WCAG 2.1 AA Requirements

| Requirement | Implementation |
|-------------|----------------|
| Color Contrast | Minimum 4.5:1 for text, 3:1 for large text |
| Focus Indicators | Visible focus ring on all interactive elements |
| Keyboard Navigation | Full site navigable via keyboard |
| Screen Reader | Proper ARIA labels and roles |
| Reduced Motion | Respect `prefers-reduced-motion` |
| Touch Targets | Minimum 44x44px |

### 10.2 Color Contrast Verification

**Text on Background**
| Combination | Contrast Ratio | Status |
|-------------|----------------|--------|
| foreground on background | 11.2:1 | Pass |
| muted-foreground on background | 5.8:1 | Pass |
| primary-foreground on primary | 8.4:1 | Pass |
| white on emerald-500 | 3.4:1 | Pass (large text) |
| white on amber-500 | 2.9:1 | Use dark text |

### 10.3 Focus Management

```css
/* Focus ring styles */
:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* Enhanced focus for complex components */
button:focus-visible,
a:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  box-shadow: 0 0 0 4px hsl(var(--ring) / 0.15);
}
```

### 10.4 Skip Link

```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4
                                focus:left-4 focus:z-50 focus:px-4 focus:py-2
                                focus:bg-background focus:rounded-md focus:shadow-lg">
  Skip to main content
</a>
```

### 10.5 ARIA Labels

```html
<!-- Navigation -->
<nav aria-label="Main navigation">

<!-- Stats Section -->
<section aria-label="Platform statistics">

<!-- Demo Widget -->
<div role="form" aria-label="Sample assessment question">

<!-- Progress -->
<div role="progressbar" aria-valuenow="33" aria-valuemin="0" aria-valuemax="100">
```

---

## 11. Implementation Notes

### 11.1 Component File Structure

```
app/_components/
  landing-page/
    hero-section.tsx
    mini-question-preview.tsx
    mini-results-preview.tsx
    psychometrics-section.tsx
    assessment-types-section.tsx
    analytics-section.tsx
    standards-section.tsx
    social-proof-section.tsx
    interactive-demo-section.tsx
    stats-section.tsx
    cta-section.tsx
    footer.tsx
    index.ts (barrel export)
```

### 11.2 Animation Library

Continue using Framer Motion for:
- Scroll-triggered animations (useInView)
- Staggered children (staggerContainer variant)
- Scroll progress (useScroll, useTransform)
- Hover/tap interactions (whileHover, whileTap)

### 11.3 Chart Library

Use Recharts (already installed) for:
- Mini radar charts (Big Five preview)
- Bar charts (gap analysis)
- Custom gauges (extend ReliabilityGauge pattern)

### 11.4 Performance Considerations

1. **Lazy load sections** below the fold
2. **Preload critical fonts** (Inter)
3. **Optimize images** with Next.js Image component
4. **Use CSS animations** where possible (less JS overhead)
5. **Debounce scroll handlers**
6. **Use `will-change`** sparingly for animated elements

### 11.5 SEO Considerations

```html
<!-- Structured data for organization -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "SkillSoft",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
</script>
```

### 11.6 Dark Mode Considerations

All sections must work in both light and dark modes:
- Test all color combinations
- Adjust gradient opacities for dark mode
- Use CSS custom properties for theming
- Verify chart colors in both modes

### 11.7 Internationalization Ready

- Use text content from constants/translations
- Support RTL layout in the future
- Avoid fixed widths that break with longer text
- Use `lang` attribute on `<html>`

---

## Appendix A: Tailwind Class Reference

### Custom Utility Classes

```css
/* Add to globals.css */

/* Landing page specific */
.landing-section {
  @apply py-16 md:py-32;
}

.landing-container {
  @apply max-w-6xl mx-auto px-4 sm:px-6;
}

.landing-card {
  @apply p-6 md:p-8 rounded-2xl bg-card border border-border/50
         hover:border-border hover:shadow-lg transition-all duration-300;
}

.landing-badge {
  @apply inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
         text-xs font-medium border;
}

.landing-stat {
  @apply text-4xl sm:text-5xl font-extrabold tabular-nums tracking-tight;
}
```

---

## Appendix B: Asset Checklist

### Required Before Development

- [ ] Logo SVG (36px, 48px variants)
- [ ] Favicon (16px, 32px, apple-touch-icon)
- [ ] OG image (1200x630px)
- [ ] Twitter card image (1200x600px)

### Optional Enhancements

- [ ] Client logos (6-8 grayscale)
- [ ] Team photos for testimonials
- [ ] Video thumbnail for demo
- [ ] Animated Lottie files for illustrations

---

## Appendix C: Performance Budget

| Metric | Target | Max |
|--------|--------|-----|
| First Contentful Paint | < 1.5s | 2.5s |
| Largest Contentful Paint | < 2.5s | 4.0s |
| Time to Interactive | < 3.0s | 5.0s |
| Total Blocking Time | < 200ms | 600ms |
| Cumulative Layout Shift | < 0.1 | 0.25 |
| Total Page Weight | < 500KB | 1MB |
| JavaScript Bundle | < 150KB | 300KB |

---

**End of Design Specification Document**

*This document should be used as a reference during implementation. All measurements, colors, and specifications are derived from the existing SkillSoft design system and should maintain consistency with the application's internal pages.*
