"use client";

import { useEffect } from "react";

/**
 * Sets the `lang` attribute on <html> after hydration.
 *
 * With PPR (cacheComponents), the root layout is a static shell with
 * a default `lang="en"`. The actual locale is determined at request time
 * inside a Suspense boundary. This component bridges the gap by updating
 * the `lang` attribute once the locale is available on the client.
 */
export function HtmlLangSetter({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
