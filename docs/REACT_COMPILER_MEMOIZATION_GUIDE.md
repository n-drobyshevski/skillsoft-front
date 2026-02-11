# React Compiler Memoization Guide

> **Status:** React Compiler enabled (`reactCompiler: true`)
> **React Version:** 19.2.1
> **Next.js Version:** 16.0.7

## Overview

With React Compiler enabled, automatic memoization is handled at compile time. This means many manual `useCallback`, `useMemo`, and `React.memo` usages are now redundant.

## What React Compiler Handles Automatically

### 1. Function Memoization
```tsx
// BEFORE: Manual useCallback
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

// AFTER: React Compiler handles this automatically
const handleClick = () => {
  doSomething(value);
};
```

### 2. Computed Values
```tsx
// BEFORE: Manual useMemo for filtering
const filteredItems = useMemo(
  () => items.filter(item => item.active),
  [items]
);

// AFTER: React Compiler optimizes automatically
const filteredItems = items.filter(item => item.active);
```

### 3. Component Memoization
```tsx
// BEFORE: React.memo wrapper
const MyComponent = React.memo(function MyComponent({ data }) {
  return <div>{data.name}</div>;
});

// AFTER: Just define the component
function MyComponent({ data }) {
  return <div>{data.name}</div>;
}
```

## When Manual Memoization is STILL Needed

### 1. External Dependencies
```tsx
// KEEP: Value passed to external libraries that need stable references
const options = useMemo(() => ({
  threshold: 0.5,
  rootMargin: '10px',
}), []);

useIntersectionObserver(ref, options);
```

### 2. Expensive Computations
```tsx
// KEEP: CPU-intensive calculations
const sortedAndGroupedData = useMemo(() => {
  return heavySort(data)
    .map(item => complexTransform(item))
    .reduce((acc, item) => groupByCategory(acc, item), {});
}, [data]);
```

### 3. Reference Equality for Effects
```tsx
// KEEP: When effects depend on object/array identity
const config = useMemo(() => ({
  apiKey: process.env.API_KEY,
  endpoint: getEndpoint(),
}), []);

useEffect(() => {
  initializeSDK(config);
}, [config]);
```

### 4. Callbacks Passed to Zustand/External Stores
```tsx
// KEEP: Callbacks used in store subscriptions
const handleStateChange = useCallback((newState) => {
  processState(newState);
}, [processState]);

useEffect(() => {
  return store.subscribe(handleStateChange);
}, [handleStateChange]);
```

## Patterns to Remove

### 1. Simple Event Handlers
```tsx
// REMOVE useCallback:
const handleClick = useCallback(() => onClick(id), [id, onClick]);

// REPLACE WITH:
const handleClick = () => onClick(id);
```

### 2. Simple Derived State
```tsx
// REMOVE useMemo:
const isValid = useMemo(() => value.length > 0, [value]);

// REPLACE WITH:
const isValid = value.length > 0;
```

### 3. Inline Filters/Maps
```tsx
// REMOVE useMemo:
const activeItems = useMemo(() => items.filter(i => i.active), [items]);

// REPLACE WITH:
const activeItems = items.filter(i => i.active);
```

### 4. React.memo on Simple Components
```tsx
// REMOVE React.memo:
const ListItem = React.memo(({ item }) => (
  <li>{item.name}</li>
));

// REPLACE WITH:
const ListItem = ({ item }) => (
  <li>{item.name}</li>
);
```

## Migration Checklist

When cleaning up a component:

1. [ ] Check if React Compiler is enabled (it is!)
2. [ ] Identify all `useCallback` usages
3. [ ] Identify all `useMemo` usages
4. [ ] Identify all `React.memo` wrappers
5. [ ] For each, determine if it falls into "KEEP" or "REMOVE" category
6. [ ] Remove unnecessary memoization
7. [ ] Test component behavior (should be identical)
8. [ ] Run type-check to ensure no issues

## Files with High Memoization Usage

These files have significant manual memoization that could be reviewed:

1. `src/components/test-player/ImmersivePlayer.tsx`
2. `app/(workspace)/psychometrics/flagged/_components/FlaggedItemsClient.tsx`
3. `app/(workspace)/hr/competencies/_components/CompetencyForm.tsx`
4. `src/components/test-player/QuestionCard.tsx`

## Performance Monitoring

After removing manual memoization, monitor:

1. Component re-render frequency (React DevTools)
2. Lighthouse performance scores
3. Web Vitals (LCP, FID, CLS)

If performance degrades, selectively add back `useMemo`/`useCallback` for that specific case.

## References

- [React Compiler Documentation](https://react.dev/learn/react-compiler)
- [Next.js 16 React Compiler](https://nextjs.org/docs/app/api-reference/next-config-js/reactCompiler)
- [Automatic Memoization RFC](https://github.com/reactjs/rfcs/blob/main/text/0229-compiler.md)
