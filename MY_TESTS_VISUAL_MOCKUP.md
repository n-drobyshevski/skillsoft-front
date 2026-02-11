# My Tests Page - Visual Mockups

## Before vs After Comparison

---

## BEFORE: Flat List Design

### Mobile View (375px):
```
┌─────────────────────────────────┐
│ [All] [Pending] [In Progress]  │
│ [Completed]                     │
├─────────────────────────────────┤
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ [Completed] [87%]           ┃ │
│ ┃ Communication Skills        ┃ │
│ ┃ 50 questions                ┃ │
│ ┃ ━━━━━━━━━━━━━━━━━━━━━      ┃ │
│ ┃ 87% ✓ Test passed           ┃ │
│ ┃ Завершен: 2h ago            ┃ │
│ ┃ [View Results →]            ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                 │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ [Completed] [82%]           ┃ │
│ ┃ Communication Skills        ┃ │ ← Same template!
│ ┃ 50 questions                ┃ │
│ ┃ ━━━━━━━━━━━━━━━━━━━━━      ┃ │
│ ┃ 82% ✓ Test passed           ┃ │
│ ┃ Завершен: 3 days ago        ┃ │
│ ┃ [View Results →]            ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                 │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ [Completed] [75%]           ┃ │
│ ┃ Communication Skills        ┃ │ ← Same template again!
│ ┃ 50 questions                ┃ │
│ ┃ ━━━━━━━━━━━━━━━━━━━━━      ┃ │
│ ┃ 75% ✗ Not passed            ┃ │
│ ┃ Завершен: 1 week ago        ┃ │
│ ┃ [View Results →]            ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                 │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ [In Progress] [60%]         ┃ │
│ ┃ Leadership Assessment       ┃ │ ← Different template
│ ┃ 40 questions                ┃ │
│ ┃ ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░  60%   ┃ │
│ ┃ 24/40 questions             ┃ │
│ ┃ Created: 1h ago             ┃ │
│ ┃ [Continue →]                ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────────────┘

Problems:
❌ Repetitive template names
❌ Hard to see test history
❌ Excessive scrolling
❌ No aggregate stats
❌ Difficult to compare attempts
```

---

## AFTER: Grouped Design

### Mobile View (375px):
```
┌─────────────────────────────────┐
│ [All] [Pending] [In Progress]  │
│ [Completed]                     │
├─────────────────────────────────┤
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ Communication Skills        ┃ │ ← Template Header
│ ┃ 3 попыток · 🏆87% · 📅2h    ┃ │ ← Aggregate Stats
│ ┃ ─────────────────────────   ┃ │
│ ┃ ┌─────────────────────┐     ┃ │
│ ┃ │ [Latest]            │     ┃ │
│ ┃ │ [Completed] [87%]   │     ┃ │ ← Latest Attempt
│ ┃ │ 50 questions        │     ┃ │   (Always Visible)
│ ┃ │ 87% ✓ Test passed   │     ┃ │
│ ┃ │ 2h ago              │     ┃ │
│ ┃ │ [View Results →]    │     ┃ │
│ ┃ └─────────────────────┘     ┃ │
│ ┃                             ┃ │
│ ┃ [▼ Show 2 more attempts][2] ┃ │ ← Collapse Trigger
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                 │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ Leadership Assessment       ┃ │ ← Different Template
│ ┃ 1 attempt · 📅1h            ┃ │
│ ┃ ─────────────────────────   ┃ │
│ ┃ ┌─────────────────────┐     ┃ │
│ ┃ │ [Latest]            │     ┃ │
│ ┃ │ [In Progress] [60%] │     ┃ │
│ ┃ │ ▓▓▓▓▓▓░░░░░ 60%     │     ┃ │
│ ┃ │ 24/40 questions     │     ┃ │
│ ┃ │ 1h ago              │     ┃ │
│ ┃ │ [Continue →]        │     ┃ │
│ ┃ └─────────────────────┘     ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────────────┘

Benefits:
✅ Clear template grouping
✅ Aggregate stats at a glance
✅ Less scrolling (3→2 cards)
✅ Latest attempt emphasized
✅ History on demand
```

---

## Expanded History State

### Mobile View (375px) - After clicking "Show 2 more attempts":
```
┌─────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ Communication Skills        ┃ │
│ ┃ 3 попыток · 🏆87% · 📅2h    ┃ │
│ ┃ ─────────────────────────   ┃ │
│ ┃ ┌─────────────────────┐     ┃ │
│ ┃ │ [Latest]            │     ┃ │
│ ┃ │ [Completed] [87%]   │     ┃ │
│ ┃ │ 50 questions        │     ┃ │
│ ┃ │ 87% ✓ Test passed   │     ┃ │
│ ┃ │ 2h ago              │     ┃ │
│ ┃ │ [View Results →]    │     ┃ │
│ ┃ └─────────────────────┘     ┃ │
│ ┃                             ┃ │
│ ┃ [▲ Hide history]            ┃ │ ← Trigger (Expanded)
│ ┃                             ┃ │
│ ┃ ┌─────────────────────────┐ ┃ │
│ ┃ │[✓] 82% 🏆·3d ago [View]│ ┃ │ ← Compact Card
│ ┃ └─────────────────────────┘ ┃ │
│ ┃                             ┃ │
│ ┃ ┌─────────────────────────┐ ┃ │
│ ┃ │[✓] 75% 🏆·1w ago [View]│ ┃ │ ← Compact Card
│ ┃ └─────────────────────────┘ ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────────────┘

Benefits:
✅ History revealed smoothly
✅ Compact history cards save space
✅ Easy to compare scores
✅ Trigger updates to "Hide history"
```

---

## Desktop View Comparison

### BEFORE (1024px+):
```
┌────────────────────────────────────────────────────────────────────────────┐
│ Tabs: [All] [Pending] [In Progress] [Completed]                           │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ [Completed] [87%]                     Communication Skills          ┃ │
│ ┃ 50 questions | 87% ✓ Test passed | Завершен: 2 hours ago          ┃ │
│ ┃ [View Results →]                                                    ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                                            │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ [Completed] [82%]                     Communication Skills          ┃ │ ← Repetitive
│ ┃ 50 questions | 82% ✓ Test passed | Завершен: 3 days ago           ┃ │
│ ┃ [View Results →]                                                    ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                                            │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ [Completed] [75%]                     Communication Skills          ┃ │ ← Repetitive
│ ┃ 50 questions | 75% ✗ Not passed | Завершен: 1 week ago            ┃ │
│ ┃ [View Results →]                                                    ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└────────────────────────────────────────────────────────────────────────────┘
```

### AFTER (1024px+):
```
┌────────────────────────────────────────────────────────────────────────────┐
│ Tabs: [All] [Pending] [In Progress] [Completed]                           │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ Communication Skills Assessment                                     ┃ │
│ ┃ ─────────────────────────────────────────────────────────────────   ┃ │
│ ┃ 🎯 3 attempts  |  🏆 Best: 87%  |  📊 Avg: 81%  |  📅 Latest: 2h   ┃ │ ← Stats!
│ ┃                                                                     ┃ │
│ ┃ ┌─────────────────────────────────────────────────────────┐         ┃ │
│ ┃ │ [Latest]  [Completed] [87%]                             │         ┃ │
│ ┃ │ 50 questions | 87% ✓ Test passed | Completed: 2h ago   │         ┃ │
│ ┃ │ [View Results →]                                        │         ┃ │
│ ┃ └─────────────────────────────────────────────────────────┘         ┃ │
│ ┃                                                                     ┃ │
│ ┃ [▼ Show 2 more attempts]                                      [2]   ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                                            │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ Leadership Assessment                                               ┃ │
│ ┃ ─────────────────────────────────────────────────────────────────   ┃ │
│ ┃ 🎯 1 attempt  |  📅 Latest: 1h ago                                  ┃ │
│ ┃                                                                     ┃ │
│ ┃ ┌─────────────────────────────────────────────────────────┐         ┃ │
│ ┃ │ [Latest]  [In Progress] [60%]                           │         ┃ │
│ ┃ │ ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░ 60% | 24/40 questions             │         ┃ │
│ ┃ │ [Continue →]                                            │         ┃ │
│ ┃ └─────────────────────────────────────────────────────────┘         ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└────────────────────────────────────────────────────────────────────────────┘

Benefits:
✅ Cleaner, more organized
✅ Aggregate stats visible
✅ Less vertical space
✅ Better scanability
```

---

## Interactive States

### Hover State (Desktop):
```
┌────────────────────────────────────────┐
│ [▼ Show 2 more attempts]          [2]  │ ← Default
└────────────────────────────────────────┘

Hover:
┌────────────────────────────────────────┐
│ [▼ Show 2 more attempts]          [2]  │ ← Border solidifies
└────────────────────────────────────────┘   Background: muted/50
```

### Active/Touch State (Mobile):
```
Pressed:
┌────────────────────────────────────────┐
│ [▼ Show 2 more attempts]          [2]  │ ← Scale: 0.98
└────────────────────────────────────────┘   Subtle press animation
```

---

## Badge Evolution

### Collapsed State:
```
┌─────────────────────────────────────────┐
│ ▼ Show 2 more attempts            [2]   │ ← Count badge visible
└─────────────────────────────────────────┘
```

### Expanded State:
```
┌─────────────────────────────────────────┐
│ ▲ Hide history                           │ ← Badge hidden
└─────────────────────────────────────────┘
```

---

## Status Tab Integration

### All Tab:
Shows all template groups regardless of status

### Completed Tab (BEFORE):
```
┌─────────────────┐
│ Test 1 - Done   │
│ Test 1 - Done   │ ← Repetitive
│ Test 1 - Done   │ ← Repetitive
│ Test 2 - Done   │
└─────────────────┘
```

### Completed Tab (AFTER):
```
┌─────────────────────────────┐
│ Template 1 (3 attempts)     │ ← Grouped!
│  Latest: Done (87%)         │
│  [Show 2 more ▼]            │
├─────────────────────────────┤
│ Template 2 (1 attempt)      │
│  Latest: Done (92%)         │
└─────────────────────────────┘
```

---

## Color Coding

### Template Group Border:
```
Left border (4px):
- Primary color (matches theme)
- Provides visual anchor
- Template identity at a glance
```

### Status Badges:
```
✓ Completed: emerald-500
⚠ In Progress: amber-500
⏳ Pending: blue-500
✗ Abandoned: red-500
⏱ Timed Out: gray-500
```

### Score Indicators:
```
🏆 Best Score: amber-500 (trophy icon)
📊 Average Score: blue-500 (target icon)
✓ Passed: emerald-600
✗ Failed: red-600
```

---

## Animation Sequence

### Page Load:
```
1. Tabs fade in (0ms)
2. Group 1 fades in + slides up (100ms)
3. Group 2 fades in + slides up (200ms)
4. Group 3 fades in + slides up (300ms)
...
```

### Expand History:
```
1. Trigger rotates chevron (0ms)
2. History container height animates (0-200ms)
3. History cards fade in staggered (50ms each)
```

### Collapse History:
```
1. Trigger rotates chevron (0ms)
2. History cards fade out (0-100ms)
3. Container height animates (100-300ms)
```

---

## Comparison: Space Efficiency

### Scenario: User has 3 Communication Skills tests + 1 Leadership test

**BEFORE (Flat List):**
- Card height: ~180px per card
- Total cards: 4
- Total height: 720px
- Template names repeated: 3x

**AFTER (Grouped):**
- Group 1 (collapsed): ~280px
- Group 2: ~220px
- Total height: 500px
- Template names repeated: 0x

**Space Saved:** ~220px (30% reduction)

---

## Accessibility Features

### Screen Reader Announcement:
```
Collapsed:
"Button: Show 2 more attempts for Communication Skills Assessment"

Expanded:
"Button: Hide history for Communication Skills Assessment"

After Expand:
"Showing 2 historical attempts for Communication Skills Assessment"
```

### Keyboard Navigation:
```
Tab → Focus on first template group
Tab → Focus on "Show more" trigger (if history exists)
Enter/Space → Expand/collapse history
Tab → Focus on first history card action
Tab → Next template group
```

---

## Edge Cases Handled

### Single Attempt:
```
┌─────────────────────────────┐
│ Communication Skills        │
│ 1 attempt · 📅 2h           │ ← No "Show more" button
│ ───────────────────────────  │
│ [Latest] [Completed] 87%    │
│ [View Results →]            │
└─────────────────────────────┘
```

### Many Attempts (10+):
```
┌─────────────────────────────┐
│ Communication Skills        │
│ 12 attempts · 🏆95% · 📅1d  │
│ ───────────────────────────  │
│ [Latest] [Completed] 95%    │
│ [View Results →]            │
│                             │
│ [▼ Show 11 more]       [11] │ ← Shows count
└─────────────────────────────┘
```

### Very Long Template Name:
```
┌─────────────────────────────┐
│ Advanced Leadership and     │
│ Communication Skills Ass... │ ← Truncated
│ 3 attempts · 🏆87% · 📅2h   │
└─────────────────────────────┘
```

### Mixed Statuses in Same Template:
```
Groups show in multiple tabs:

All Tab:
- Shows template in "All"

In Progress Tab:
- Shows template with IN_PROGRESS sessions only

Completed Tab:
- Shows template with COMPLETED sessions only
```

---

## Conclusion

The grouped design provides:
- **30% less scrolling** for users with multiple attempts
- **Clearer visual hierarchy** with template headers
- **Better context** with aggregate stats
- **Mobile-optimized** touch targets and layout
- **Accessible** keyboard and screen reader support
- **Consistent** with existing design system

This mockup demonstrates the significant UX improvements while maintaining familiarity and design consistency.
