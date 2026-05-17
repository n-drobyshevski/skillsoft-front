'use client';

import { AlertCircle } from 'lucide-react';

/**
 * Flattens nested react-hook-form errors into a list of dotted-path messages.
 * The combobox writes a single `standardCodes` field whose Zod schema produces
 * deep errors (e.g. `standardCodes.onetRef.code`), and the parent <FormMessage />
 * only sees the root-level error — nested ones never render.
 *
 * This component reads the subtree and renders every message in a tight list,
 * so users get inline feedback at picker-change time instead of an opaque
 * server-side 400 after submit.
 *
 * Typed as `unknown` because the react-hook-form `FieldErrors` generic is too
 * narrow for arbitrary depth and the walk below is purely structural.
 */
function collectMessages(errors: unknown, prefix = ''): { path: string; message: string }[] {
  if (!errors || typeof errors !== 'object') return [];
  const out: { path: string; message: string }[] = [];
  for (const key of Object.keys(errors as Record<string, unknown>)) {
    const value = (errors as Record<string, unknown>)[key];
    if (!value || typeof value !== 'object') continue;
    const path = prefix ? `${prefix}.${key}` : key;
    const errorLike = value as { message?: unknown };
    if (typeof errorLike.message === 'string') {
      out.push({ path, message: errorLike.message });
    } else {
      out.push(...collectMessages(value, path));
    }
  }
  return out;
}

interface StandardCodesErrorsProps {
  errors: unknown;
}

export function StandardCodesErrors({ errors }: StandardCodesErrorsProps) {
  const messages = collectMessages(errors);
  if (messages.length === 0) return null;

  return (
    <ul className="mt-2 space-y-1" role="alert" aria-live="polite">
      {messages.map(({ path, message }) => (
        <li key={path} className="flex items-start gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            <span className="font-mono text-[10px] text-destructive/70 mr-1">{path}</span>
            {message}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default StandardCodesErrors;
