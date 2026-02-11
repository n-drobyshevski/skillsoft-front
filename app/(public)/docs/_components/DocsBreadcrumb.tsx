"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { getBreadcrumbs } from "@/lib/docs/navigation";

interface DocsBreadcrumbProps {
  /** Override the automatic breadcrumb generation */
  items?: Array<{ title: string; href: string }>;
}

/**
 * Documentation Breadcrumb Navigation
 *
 * Automatically generates breadcrumbs based on the current path,
 * or accepts manual items for override.
 *
 * Uses inline separator to avoid li-inside-li hydration issues.
 */
export function DocsBreadcrumb({ items: propItems }: DocsBreadcrumbProps) {
  const pathname = usePathname();
  const items = propItems || getBreadcrumbs(pathname);

  if (items.length <= 1) {
    return null;
  }

  // Build flat array of elements to avoid Fragment nesting issues
  const elements: React.ReactNode[] = [];

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;

    elements.push(
      <BreadcrumbItem key={item.href}>
        {isLast ? (
          <BreadcrumbPage>{item.title}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink asChild>
            <Link href={item.href}>{item.title}</Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
    );

    // Add separator as a separate li element (not using BreadcrumbSeparator to avoid nesting)
    if (!isLast) {
      elements.push(
        <li
          key={`${item.href}-sep`}
          role="presentation"
          aria-hidden="true"
          className="[&>svg]:size-3.5"
        >
          <ChevronRight />
        </li>
      );
    }
  });

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>{elements}</BreadcrumbList>
    </Breadcrumb>
  );
}
