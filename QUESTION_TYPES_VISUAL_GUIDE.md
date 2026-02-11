# Question Types - Visual Implementation Guide

## Overview
This guide documents the visual design and interaction patterns for each question type in the ImmersivePlayer.

---

## 1. LIKERT / LIKERT_SCALE / FREQUENCY_SCALE

### Description
Horizontal rating scale for measuring agreement, frequency, or intensity.

### Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [1]  Question Card                                             │
│                                                                 │
│  Как часто вы адаптируете стиль общения под аудиторию?         │
│  [Шкала оценки]                                                │
│                                                                 │
│  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐      │
│  │   1   │  │   2   │  │   3   │  │   4   │  │   5   │      │
│  │       │  │       │  │       │  │       │  │       │      │
│  │Никогда│  │Редко  │  │Иногда │  │Часто  │  │Всегда │      │
│  └───────┘  └───────┘  └───────┘  └───────┘  └───────┘      │
│                                                                 │
│  Выберите значение на шкале от 1 до 5                         │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 640px)

```
┌─────────────────────┐
│  [1]                │
│  Как часто...       │
│                     │
│  ┌───────┐ ┌───────┐│
│  │   1   │ │   2   ││
│  │Никогда│ │Редко  ││
│  └───────┘ └───────┘│
│  ┌───────┐ ┌───────┐│
│  │   3   │ │   4   ││
│  │Иногда │ │Часто  ││
│  └───────┘ └───────┘│
│  ┌───────┐          │
│  │   5   │          │
│  │Всегда │          │
│  └───────┘          │
└─────────────────────┘
```

### Styling Details

**Selected State:**
- Border: 2px emerald-500
- Background: emerald-500/10
- Text: emerald-400
- Shadow: emerald-500/20 glow

**Unselected State:**
- Border: 2px neutral-700
- Background: neutral-800/30
- Text: neutral-400

**Hover State:**
- Border: neutral-600
- Background: neutral-800/50

**Focus State:**
- Ring: 2px emerald-500/50
- Border: emerald-500

### Responsive Grid

- **Mobile (< 640px):** 2 columns
- **Tablet (640px+):** 3-5 columns depending on option count
- **Desktop (768px+):** 5 columns for 5-point scales

### Touch Targets
- Minimum height: 64px
- Padding: 16px (p-4)
- Gap: 12px (gap-3)

---

## 2. SJT / SITUATIONAL_JUDGMENT

### Description
Scenario-based questions with single-choice responses evaluating judgment in realistic situations.

### Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [2]  Question Card                                             │
│                                                                 │
│  │ Вы заметили, что коллега допускает ошибки в важном         │
│  │ проекте. Клиент уже выразил недовольство. Что вы           │
│  │ сделаете?                                                   │
│                                                                 │
│  Как вы поступите в данной ситуации?                          │
│  [Ситуационный вопрос]                                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [A]  Поговорю с коллегой наедине и предложу помощь       │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [B]  Сообщу руководителю о проблеме                      │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [C]  Исправлю ошибки сам, чтобы не создавать конфликт   │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [D]  Подниму вопрос на командной встрече                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Выберите наиболее подходящий ответ для данной ситуации   │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Key Elements

**Scenario Box:**
- Border-left: 2px neutral-700
- Background: neutral-800/20
- Padding: 8px 16px (py-2 pl-4)
- Italic text, neutral-400 color

**Option Buttons:**
- Full width with text-left alignment
- Letter indicators (A, B, C, D) in circles
- Min height: 56px
- Padding: 16px (p-4)

**Letter Indicator:**
- Size: 28px (w-7 h-7)
- Border: 2px
- Font: bold, xs size
- Selected: emerald-500 background, scale-110

**Hint Box:**
- Background: neutral-800/30
- Border: 1px neutral-700/50
- Padding: 12px vertical (py-3)
- Centered text

---

## 3. MCQ / MULTIPLE_CHOICE

### Description
Standard multiple-choice questions with single selection.

### Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [3]  Question Card                                             │
│                                                                 │
│  Какой подход наиболее эффективен для разрешения конфликта?   │
│  [Множественный выбор]                                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [A]  Активное слушание и поиск компромисса              │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [B]  Избегание прямой конфронтации                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [C]  Обращение к руководству                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [D]  Отстаивание своей позиции                           │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Styling
Same as SJT but without scenario box and contextual hint. Clean, straightforward selection interface.

---

## 4. BEHAVIORAL_EXAMPLE

### Description
Open-text questions asking for real-world behavioral examples using STAR method.

### Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [4]  Question Card                                             │
│                                                                 │
│  Опишите ситуацию, когда вы успешно разрешили сложный         │
│  конфликт в команде.                                           │
│  [Поведенческий пример]                                        │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Опишите конкретную ситуацию из вашего опыта...            ││
│  │                                                            ││
│  │                                                            ││
│  │                                                            ││
│  │                                                            ││
│  │                                                            ││
│  │                                                            ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Опишите конкретную ситуацию, что вы сделали, и каков был     │
│  результат                                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Textarea Styling

**Dimensions:**
- Min height: 160px
- Full width
- Resize: none (fixed height)

**Colors:**
- Background: neutral-800/30
- Border: neutral-700
- Text: white
- Placeholder: neutral-500

**Focus State:**
- Border: emerald-500
- Ring: emerald-500/20

**Typography:**
- Font size: text-sm sm:text-base
- Line height: leading-relaxed
- Padding: 12px (px-3 py-2)

### STAR Method Hint
Guides users to describe:
- **S**ituation - Context
- **T**ask - Challenge
- **A**ction - What you did
- **R**esult - Outcome

### Auto-Save
- Debounce: 500ms after last keystroke
- Visual indicator: None (silent save)
- OnAnswer callback triggered with text value

---

## 5. OPEN_TEXT

### Description
Free-form text responses for detailed answers.

### Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [5]  Question Card                                             │
│                                                                 │
│  Какие факторы наиболее важны для вас при принятии решений?   │
│  [Открытый вопрос]                                             │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Введите ваш ответ...                                       ││
│  │                                                            ││
│  │                                                            ││
│  │                                                            ││
│  │                                                            ││
│  │                                                            ││
│  │                                                            ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Напишите развёрнутый ответ на вопрос                         │
└─────────────────────────────────────────────────────────────────┘
```

### Styling
Same as BEHAVIORAL_EXAMPLE but with:
- Generic placeholder: "Введите ваш ответ..."
- Generic hint: "Напишите развёрнутый ответ на вопрос"

---

## Shared Design Elements

### Question Number Badge
```
┌───────┐
│  [1]  │  - Size: 36px (w-9 h-9)
└───────┘  - Background: neutral-800
           - Text: neutral-400, bold
           - Rounded: full circle
```

### Question Type Badge
```
┌──────────────────────┐
│ [Шкала оценки]       │  - Background: neutral-800/50
└──────────────────────┘  - Padding: 8px 8px (px-2 py-1)
                          - Text: xs, neutral-500
                          - Rounded: default (sm)
```

### Color System

**Neutrals:**
- neutral-950: Page background
- neutral-900: Card background (with 50% opacity)
- neutral-800: Inactive elements, badges
- neutral-700: Borders
- neutral-600: Hover borders
- neutral-500: Tertiary text
- neutral-400: Secondary text
- neutral-300: Option text (unselected)
- white: Primary text, selected text

**Accent (Emerald):**
- emerald-500: Selection border, focus ring
- emerald-400: Selected text
- emerald-500/10: Selected background
- emerald-500/20: Shadow glow, focus ring

### Typography Scale

**Headings:**
- Question text: text-lg sm:text-xl (18px → 20px)
- Font weight: medium (500)

**Body:**
- Option text: text-sm sm:text-base (14px → 16px)
- Scenario text: text-sm (14px)

**Labels:**
- Type badge: text-xs (12px)
- Hints: text-xs (12px)
- Likert labels: text-xs sm:text-sm (12px → 14px)
- Likert values: text-xl sm:text-2xl (20px → 24px)

### Spacing System

**Card Padding:**
- Desktop: p-8 (32px)
- Mobile: p-6 (24px)

**Element Gaps:**
- Option spacing: space-y-3 (12px vertical)
- Grid gaps: gap-3 (12px)
- Header gap: gap-4 (16px)

**Margins:**
- Section spacing: mt-6 (24px)
- Label spacing: mt-2 (8px)

### Transitions

**Duration:**
- Default: duration-200 (200ms)
- All properties transitioned

**Transforms:**
- Active scale: scale-95 (Likert)
- Active scale: scale-[0.99] (MCQ/SJT)
- Selected scale: scale-110 (letter indicators)

**Easing:**
- Default: ease-in-out

---

## Accessibility Features

### ARIA Attributes

**All Buttons:**
- `aria-pressed`: boolean (selection state)
- `aria-label`: descriptive text with context

**Scenario Sections:**
- `role="note"`: marks scenario as supplementary
- `aria-label="Scenario context"`: describes purpose

**Textarea:**
- `aria-label`: question text
- `autoFocus`: true (for immediate typing)

### Keyboard Navigation

**Tab Order:**
1. Question number badge (non-interactive, skip)
2. Question text (non-interactive, skip)
3. All answer options in visual order
4. Hints (non-interactive, skip)

**Focus Indicators:**
- Ring: 2px emerald-500/50
- Border: emerald-500
- Outline: none (custom focus ring)

**Enter Key:**
- Activates focused button
- Submits answer (in ImmersivePlayer)

### Screen Reader Support

**Question Type Announcement:**
- Badge text read after question text
- Provides context for interaction pattern

**Option Announcement:**
- Letter + text for MCQ/SJT
- Value + label for Likert
- Full text for options

**State Changes:**
- "Pressed" state announced on selection
- Selection feedback via aria-pressed

### Color Contrast

**WCAG AAA (7:1+):**
- White on neutral-900: 15.5:1
- White on neutral-950: 18.7:1

**WCAG AA (4.5:1+):**
- emerald-400 on neutral-900: 8.2:1
- neutral-300 on neutral-900: 9.1:1
- neutral-400 on neutral-800: 6.4:1

---

## Responsive Breakpoints

```
Mobile:     < 640px   (sm:)
Tablet:     640px+    (sm:)
Desktop:    768px+    (md:)
Large:      1024px+   (lg:)
```

### Responsive Behavior

**Typography:**
- Scales up at `sm:` breakpoint (640px)
- Question text: 18px → 20px
- Option text: 14px → 16px
- Likert labels: 12px → 14px

**Grids:**
- Likert: 2 cols → 3-5 cols at `sm:` and `md:`
- Maintains min 56px touch targets at all sizes

**Spacing:**
- Card padding: 24px → 32px at `sm:`
- Maintains consistent gaps across breakpoints

---

## Animation Details

### Entrance (Question Transition)
- Slide from right: x: 300px → 0
- Fade in: opacity: 0 → 1
- Spring animation: stiffness 300, damping 30
- Duration: ~400ms

### Exit (Question Transition)
- Slide to left: x: 0 → -300px
- Fade out: opacity: 1 → 0
- Duration: ~200ms

### Button Interactions
- Hover: border color transition (200ms)
- Active: scale transform (200ms)
- Focus: ring appearance (200ms)
- Selection: all properties (200ms)

---

## Implementation Notes

### Component Structure

```tsx
<QuestionCard>
  <CardContent>
    {/* Header */}
    <QuestionNumber />
    <Scenario /> {/* if SJT */}
    <QuestionText />
    <TypeBadge />

    {/* Answer Section */}
    {isTextInput && <TextInput />}
    {isLikertType && <LikertScale />}
    {isMCQ/SJT && <StandardOptions />}

    {/* Footer */}
    {isSJT && <ContextualHint />}
  </CardContent>
</QuestionCard>
```

### Render Logic

```typescript
// Question type classification
const isLikertType = LIKERT | LIKERT_SCALE | FREQUENCY_SCALE
const isSJT = SJT | SITUATIONAL_JUDGMENT
const isMCQ = MCQ | MULTIPLE_CHOICE | SINGLE_CHOICE
const isOpenText = OPEN_TEXT
const isBehavioralExample = BEHAVIORAL_EXAMPLE
const isTextInput = isOpenText || isBehavioralExample

// Renderer selection
if (isTextInput) → renderTextInput()
else if (isLikertType) → renderLikertScale()
else → renderStandardOptions()
```

### Answer Value Handling

**Likert:**
- Value type: `number`
- Field: `likertValue`

**Text Input:**
- Value type: `string`
- Field: `textResponse`

**MCQ/SJT (single):**
- Value type: `string` (option.id)
- Field: `selectedOptionIds[0]`

**MCQ (multiple - future):**
- Value type: `string[]` (option.id[])
- Field: `selectedOptionIds`

---

## Testing Scenarios

### Desktop (1920x1080)
1. All question types render correctly
2. 5-point Likert displays as 5 columns
3. Hover states work smoothly
4. Focus indicators visible

### Tablet (768x1024)
1. Likert adjusts to appropriate columns
2. Touch targets remain 56px+
3. Typography scales correctly

### Mobile (375x667)
1. Likert stacks to 2 columns
2. All buttons tap-friendly (56px+)
3. Text inputs use full width
4. Scenario box readable
5. No horizontal scrolling

### Keyboard Navigation
1. Tab through all options
2. Enter selects option
3. Focus indicators visible
4. No focus traps

### Screen Reader (NVDA/JAWS)
1. Question text announced
2. Type badge announced
3. Options announced with context
4. Selection state announced

### Dark Mode
Already implemented - neutral dark theme is the default.

---

## Future Enhancements

### Multi-Select MCQ
- Checkbox indicators instead of radio
- "Select all that apply" hint
- Multiple selection tracking
- Visual count of selections

### Rich Text
- Markdown support in BEHAVIORAL_EXAMPLE
- Preview tab for formatted view
- Toolbar for common formatting

### Character Limits
- Display character count for text inputs
- Visual indicator at 80%, 90%, 100%
- Validation feedback

### Time Pressure Indicators
- Visual countdown per question
- Color changes as time runs low
- Auto-submit on timeout

### Difficulty Indicators
- Badge showing question difficulty
- Estimated time to complete
- Adaptive UI based on difficulty

---

This guide provides comprehensive visual and technical documentation for implementing and maintaining question type UIs in the SkillSoft assessment platform.
