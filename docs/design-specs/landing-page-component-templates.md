# SkillSoft Landing Page - Component Templates

## Quick Reference for Implementation

This document provides copy-paste ready Tailwind CSS templates for the redesigned landing page components.

---

## 1. Hero Section Components

### 1.1 Hero Badge

```tsx
// Badge with icon
<span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium
                 bg-primary/10 text-primary border border-primary/20
                 hover:bg-primary/15 transition-colors">
  <BrainCircuit className="w-3.5 h-3.5" />
  Psychometric Assessment Platform
</span>
```

### 1.2 Hero Headline

```tsx
<div className="space-y-4">
  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
    Scientifically Validated
    <span className="block text-primary">Soft Skills Assessment</span>
  </h1>
  <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
    Measure competencies with precision. Match talent to roles.
    Build high-performing teams with data-driven insights.
  </p>
</div>
```

### 1.3 Hero CTAs

```tsx
<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
  <Link href="/sign-up">
    <Button size="lg" className="h-12 px-8 text-base">
      Start Free Trial
      <ArrowRight className="ml-2 w-4 h-4" />
    </Button>
  </Link>
  <Button variant="outline" size="lg" className="h-12 px-8 text-base group">
    <Play className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
    Watch Demo
  </Button>
</div>
```

### 1.4 Trust Indicators Row

```tsx
<div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4
                text-sm text-muted-foreground">
  <div className="flex items-center gap-2">
    <CheckCircle className="w-4 h-4 text-emerald-500" />
    <span>Free 30-day trial</span>
  </div>
  <div className="flex items-center gap-2">
    <Shield className="w-4 h-4 text-blue-500" />
    <span>SOC 2 Compliant</span>
  </div>
  <div className="flex items-center gap-2">
    <Users className="w-4 h-4 text-violet-500" />
    <span>2,500+ Professionals</span>
  </div>
</div>
```

### 1.5 Mini Question Preview Card

```tsx
interface MiniQuestionPreviewProps {
  selectedValue: number | null;
  onSelect: (value: number) => void;
}

export function MiniQuestionPreview({ selectedValue, onSelect }: MiniQuestionPreviewProps) {
  return (
    <div className="w-full max-w-sm p-6 rounded-2xl bg-card border border-border/50
                    shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium px-2.5 py-1 rounded-md
                         bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          Sample Question
        </span>
        <span className="text-xs text-muted-foreground">Communication</span>
      </div>

      {/* Question */}
      <p className="text-sm font-medium mb-6 leading-relaxed">
        I actively listen to others and ask clarifying questions to ensure understanding.
      </p>

      {/* Likert Scale */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Strongly Disagree</span>
          <span>Strongly Agree</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => onSelect(value)}
              className={cn(
                "w-9 h-9 rounded-full border-2 text-sm font-medium transition-all",
                "hover:border-primary hover:bg-primary/5",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                selectedValue === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted text-muted-foreground"
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 1.6 Mini Results Preview Card

```tsx
interface MiniResultsPreviewProps {
  score: number; // 0-100
  passing: boolean;
}

export function MiniResultsPreview({ score, passing }: MiniResultsPreviewProps) {
  const strokeDashoffset = 157 * (1 - score / 100);

  return (
    <div className="w-full max-w-sm p-6 rounded-2xl bg-card border border-border/50
                    shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-medium px-2.5 py-1 rounded-md
                         bg-blue-500/10 text-blue-600 dark:text-blue-400">
          Assessment Results
        </span>
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full",
          passing
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/10 text-red-600 dark:text-red-400"
        )}>
          {passing ? 'Pass' : 'Needs Development'}
        </span>
      </div>

      {/* Gauge */}
      <div className="flex flex-col items-center">
        <svg width="120" height="72" viewBox="0 0 120 72" className="mb-2">
          {/* Background arc */}
          <path
            d="M 10 62 A 50 50 0 0 1 110 62"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/30"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d="M 10 62 A 50 50 0 0 1 110 62"
            stroke={passing ? '#10b981' : '#f59e0b'}
            strokeWidth="8"
            fill="none"
            strokeDasharray="157"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="text-center">
          <span className="text-3xl font-bold tabular-nums">{score}%</span>
          <p className="text-xs text-muted-foreground mt-1">Job Fit Score</p>
        </div>
      </div>

      {/* Mini gap bars */}
      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Communication</span>
          <span className="font-medium">92%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
        </div>
      </div>
    </div>
  );
}
```

---

## 2. Feature Section Components

### 2.1 Section Header

```tsx
interface SectionHeaderProps {
  badge: string;
  title: string;
  highlight?: string;
  description?: string;
}

export function SectionHeader({ badge, title, highlight, description }: SectionHeaderProps) {
  return (
    <div className="text-center space-y-4 mb-16 md:mb-20">
      <Badge variant="outline" className="mb-4">{badge}</Badge>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
        {title}{' '}
        {highlight && <span className="text-primary">{highlight}</span>}
      </h2>
      {description && (
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
```

### 2.2 Feature Card with Visualization

```tsx
interface FeatureCardProps {
  icon: LucideIcon;
  iconColor: string; // Tailwind bg color class
  title: string;
  description: string;
  visualization?: React.ReactNode;
}

export function FeatureCard({ icon: Icon, iconColor, title, description, visualization }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full p-6 md:p-8 rounded-2xl bg-card border border-border/50
                 hover:border-border hover:shadow-lg transition-all duration-300"
    >
      <div className="space-y-4">
        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
          className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconColor)}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>

        {/* Content */}
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Optional visualization */}
        {visualization && (
          <div className="pt-4 mt-4 border-t border-border/50">
            {visualization}
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

### 2.3 Psychometrics Mini Gauge

```tsx
export function PsychometricsMiniGauge({ value = 0.87 }: { value?: number }) {
  const getColor = (v: number) => {
    if (v >= 0.8) return '#10b981'; // emerald
    if (v >= 0.7) return '#3b82f6'; // blue
    if (v >= 0.6) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-10">
        <svg viewBox="0 0 64 40" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 4 36 A 28 28 0 0 1 60 36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted/30"
          />
          {/* Value arc */}
          <path
            d="M 4 36 A 28 28 0 0 1 60 36"
            fill="none"
            stroke={getColor(value)}
            strokeWidth="4"
            strokeDasharray={`${88 * value} 88`}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div>
        <div className="text-lg font-bold tabular-nums" style={{ color: getColor(value) }}>
          {value.toFixed(2)}
        </div>
        <div className="text-xs text-muted-foreground">Cronbach's Alpha</div>
      </div>
    </div>
  );
}
```

---

## 3. Assessment Types Components

### 3.1 Question Type Card

```tsx
interface QuestionTypeCardProps {
  type: 'likert' | 'sjt' | 'mcq';
  percentage: number;
  title: string;
  description: string;
  timeLimit: string;
  children: React.ReactNode;
}

export function QuestionTypeCard({
  type,
  percentage,
  title,
  description,
  timeLimit,
  children
}: QuestionTypeCardProps) {
  const typeColors = {
    likert: 'bg-emerald-500',
    sjt: 'bg-amber-500',
    mcq: 'bg-blue-500'
  };

  return (
    <div className="p-6 rounded-2xl bg-card border border-border/50
                    hover:border-border hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn("px-2.5 py-1 rounded-md text-xs font-medium text-white", typeColors[type])}>
          {title}
        </div>
        <span className="text-sm font-medium text-muted-foreground">{percentage}%</span>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-6">{description}</p>

      {/* Interactive Preview */}
      <div className="mb-4">
        {children}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span>{timeLimit} avg</span>
      </div>
    </div>
  );
}
```

### 3.2 Likert Scale Preview

```tsx
export function LikertPreview({ selected = 4 }: { selected?: number }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Rate your agreement:</p>
      <div className="flex items-center justify-between gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium",
              n === selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-muted text-muted-foreground"
            )}
          >
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.3 SJT Option Preview

```tsx
export function SJTPreview({ selected = 'B' }: { selected?: string }) {
  const options = [
    { letter: 'A', text: 'Address the issue immediately...' },
    { letter: 'B', text: 'Discuss privately with...' },
    { letter: 'C', text: 'Escalate to your manager...' },
  ];

  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <div
          key={opt.letter}
          className={cn(
            "p-2.5 rounded-lg border text-sm transition-all",
            opt.letter === selected
              ? "border-primary bg-primary/5"
              : "border-border"
          )}
        >
          <div className="flex items-start gap-2">
            <span className={cn(
              "w-5 h-5 rounded text-xs font-medium flex items-center justify-center shrink-0",
              opt.letter === selected
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {opt.letter}
            </span>
            <span className="text-xs line-clamp-1">{opt.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 3.4 MCQ Preview

```tsx
export function MCQPreview({ selected = 2 }: { selected?: number }) {
  const options = [
    'Option 1: First choice',
    'Option 2: Second choice',
    'Option 3: Third choice',
  ];

  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-2.5 p-2 rounded-lg text-sm",
            i + 1 === selected ? "bg-primary/5" : ""
          )}
        >
          <div className={cn(
            "w-4 h-4 rounded-full border-2 flex items-center justify-center",
            i + 1 === selected ? "border-primary" : "border-muted"
          )}>
            {i + 1 === selected && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </div>
          <span className="text-xs">{opt}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 4. Standards Section Components

### 4.1 Standard Card

```tsx
interface StandardCardProps {
  icon: LucideIcon;
  iconBg: string;
  name: string;
  fullName: string;
  metric: { value: string; label: string };
  badge: string;
  badgeColor: string;
}

export function StandardCard({
  icon: Icon,
  iconBg,
  name,
  fullName,
  metric,
  badge,
  badgeColor
}: StandardCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border/50 text-center
                    hover:border-border hover:shadow-lg transition-all">
      {/* Icon */}
      <div className={cn("w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4", iconBg)}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-1">{name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{fullName}</p>

      {/* Metric */}
      <div className="mb-4">
        <span className="text-2xl font-bold">{metric.value}</span>
        <span className="text-sm text-muted-foreground ml-1">{metric.label}</span>
      </div>

      {/* Badge */}
      <span className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
        badgeColor
      )}>
        <CheckCircle className="w-3 h-3" />
        {badge}
      </span>
    </div>
  );
}
```

### 4.2 Standard Badges Row

```tsx
export function StandardBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                       border border-indigo-500/30 text-xs font-medium text-indigo-600
                       dark:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
        <Globe className="w-3.5 h-3.5" />
        ESCO Aligned
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                       border border-violet-500/30 text-xs font-medium text-violet-600
                       dark:text-violet-400 hover:bg-violet-500/10 transition-colors">
        <Database className="w-3.5 h-3.5" />
        O*NET Mapped
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                       border border-cyan-500/30 text-xs font-medium text-cyan-600
                       dark:text-cyan-400 hover:bg-cyan-500/10 transition-colors">
        <BrainCircuit className="w-3.5 h-3.5" />
        Big Five Model
      </span>
    </div>
  );
}
```

---

## 5. Analytics Section Components

### 5.1 Job Fit Card

```tsx
export function JobFitPreview({ score = 87, threshold = 75 }: { score?: number; threshold?: number }) {
  const passing = score >= threshold;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - score / 100);

  return (
    <div className="p-6 rounded-2xl bg-card border border-border/50">
      <h3 className="text-lg font-semibold mb-4">Job Fit Analysis</h3>

      {/* Score Circle */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <svg width="100" height="100" className="transform -rotate-90">
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/20"
            />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke={passing ? '#10b981' : '#f59e0b'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{score}%</span>
          </div>
        </div>

        <div>
          <span className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium",
            passing
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-amber-500/10 text-amber-600"
          )}>
            {passing ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {passing ? 'Qualified' : 'Development Needed'}
          </span>
          <p className="text-sm text-muted-foreground mt-2">
            Threshold: {threshold}%
          </p>
        </div>
      </div>

      {/* Gap Bars */}
      <div className="space-y-3">
        <GapBar label="Communication" value={92} />
        <GapBar label="Leadership" value={78} />
        <GapBar label="Technical" value={95} />
      </div>
    </div>
  );
}

function GapBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color)}
             style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
```

### 5.2 Team Fit Card

```tsx
export function TeamFitPreview({ compatibility = 92 }: { compatibility?: number }) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-500/10
                    border border-blue-500/20">
      <h3 className="text-lg font-semibold mb-4">Team Compatibility</h3>

      {/* Compatibility Score */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-4xl font-bold text-blue-600">{compatibility}%</span>
        <div className="text-sm text-muted-foreground">
          <p>Team Size: 8 members</p>
          <p>Role: Technical Lead</p>
        </div>
      </div>

      {/* Strengths */}
      <div>
        <p className="text-sm font-medium mb-2">Complementary Strengths:</p>
        <div className="space-y-1.5">
          {['Communication', 'Problem Solving', 'Collaboration'].map((strength) => (
            <div key={strength} className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span>{strength}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Social Proof Components

### 6.1 Testimonial Card

```tsx
interface TestimonialProps {
  quote: string;
  author: string;
  title: string;
  company: string;
  avatarUrl?: string;
}

export function TestimonialCard({ quote, author, title, company, avatarUrl }: TestimonialProps) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed mb-6">
        "{quote}"
      </blockquote>

      <div className="flex items-center justify-center gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={author} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">
              {author.charAt(0)}
            </span>
          </div>
        )}
        <div className="text-left">
          <p className="font-semibold">{author}</p>
          <p className="text-sm text-muted-foreground">{title}, {company}</p>
        </div>
      </div>
    </div>
  );
}
```

### 6.2 Logo Wall

```tsx
export function LogoWall({ logos }: { logos: { name: string; url: string }[] }) {
  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-8">
        Trusted by leading organizations
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
        {logos.map((logo) => (
          <img
            key={logo.name}
            src={logo.url}
            alt={logo.name}
            className="h-8 opacity-50 hover:opacity-100 grayscale hover:grayscale-0
                       transition-all duration-300"
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 7. Interactive Demo Components

### 7.1 Demo Widget Container

```tsx
interface DemoWidgetProps {
  currentQuestion: number;
  totalQuestions: number;
  children: React.ReactNode;
  onPrevious: () => void;
  onNext: () => void;
}

export function DemoWidget({
  currentQuestion,
  totalQuestions,
  children,
  onPrevious,
  onNext
}: DemoWidgetProps) {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-card border border-border
                    shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium">
          Question {currentQuestion} of {totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-32 h-1.5 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Content */}
      {children}

      {/* Footer */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={currentQuestion === 1}
        >
          Back
        </Button>
        <Button onClick={onNext}>
          {currentQuestion === totalQuestions ? 'Submit' : 'Next Question'}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
```

### 7.2 SJT Question

```tsx
interface SJTQuestionProps {
  question: string;
  options: { letter: string; text: string }[];
  selectedOption: string | null;
  onSelect: (letter: string) => void;
}

export function SJTQuestion({ question, options, selectedOption, onSelect }: SJTQuestionProps) {
  return (
    <div>
      <p className="text-base md:text-lg font-medium leading-relaxed mb-6">
        {question}
      </p>

      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.letter}
            onClick={() => onSelect(option.letter)}
            className={cn(
              "w-full p-4 text-left rounded-xl border transition-all duration-200",
              "hover:border-primary/50 hover:bg-primary/5",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              selectedOption === option.letter
                ? "border-primary bg-primary/10"
                : "border-border bg-background"
            )}
          >
            <div className="flex items-start gap-3">
              <span className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center text-sm font-medium shrink-0",
                selectedOption === option.letter
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {option.letter}
              </span>
              <span className="text-sm">{option.text}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 8. Stats Section Components

### 8.1 Animated Stat

```tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface AnimatedStatProps {
  value: number;
  suffix?: string;
  label: string;
  duration?: number;
}

export function AnimatedStat({ value, suffix = '', label, duration = 1000 }: AnimatedStatProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.floor(value * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl font-extrabold text-primary-foreground tabular-nums">
        {displayValue.toLocaleString()}{suffix}
      </div>
      <div className="mt-2 text-sm text-primary-foreground/80">{label}</div>
    </div>
  );
}
```

### 8.2 Stats Section

```tsx
export function StatsSection() {
  const stats = [
    { value: 2500, suffix: '+', label: 'Active Users' },
    { value: 150, suffix: '+', label: 'Organizations' },
    { value: 98, suffix: '%', label: 'Satisfaction Rate' },
    { value: 45, suffix: '%', label: 'Productivity Gain' },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-primary to-primary/90">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <AnimatedStat key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## 9. CTA Section Components

### 9.1 Final CTA Block

```tsx
export function CTASection() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-6">
          <Star className="w-3.5 h-3.5 mr-1.5" />
          Ready to Transform?
        </Badge>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          Start Building a
          <span className="block text-primary">Data-Driven Team</span>
        </h2>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Join thousands of HR professionals using validated assessments
          to make better hiring decisions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/sign-up">
            <Button size="lg" className="h-14 px-10 text-lg">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="h-14 px-10 text-lg">
            Schedule Demo
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>30-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>Enterprise security</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-500" />
            <span>24/7 support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## 10. Utility Components

### 10.1 Section Wrapper

```tsx
interface SectionProps {
  id?: string;
  className?: string;
  background?: 'default' | 'muted' | 'primary';
  children: React.ReactNode;
}

export function Section({ id, className, background = 'default', children }: SectionProps) {
  const bgClasses = {
    default: '',
    muted: 'bg-muted/30',
    primary: 'bg-gradient-to-br from-primary to-primary/90'
  };

  return (
    <section
      id={id}
      className={cn("py-16 md:py-32", bgClasses[background], className)}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {children}
      </div>
    </section>
  );
}
```

### 10.2 Animated Container

```tsx
interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
}

export function AnimatedContainer({ children, className, stagger = false }: AnimatedContainerProps) {
  const containerVariants = stagger ? {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  } : {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

---

## Usage Example: Complete Section

```tsx
import { Section, SectionHeader, AnimatedContainer, FeatureCard, PsychometricsMiniGauge } from './components';

export function PsychometricsSection() {
  return (
    <Section id="psychometrics" background="muted">
      <SectionHeader
        badge="Psychometrics"
        title="Built on"
        highlight="Scientific Foundations"
        description="Continuous quality monitoring ensures every assessment maintains statistical validity."
      />

      <AnimatedContainer stagger className="grid md:grid-cols-3 gap-6">
        <FeatureCard
          icon={Activity}
          iconColor="bg-emerald-500"
          title="Reliability Monitoring"
          description="Cronbach's Alpha calculated in real-time across all competency scales."
          visualization={<PsychometricsMiniGauge value={0.87} />}
        />
        {/* More cards... */}
      </AnimatedContainer>
    </Section>
  );
}
```

---

**End of Component Templates**

*These templates are designed to work with the existing SkillSoft design system. Import the necessary dependencies from `@/components/ui` and ensure Framer Motion is available for animations.*
