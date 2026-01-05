'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Copy, Check, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyLinkButtonProps {
  url: string;
  variant?: 'button' | 'input' | 'icon';
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
}

/**
 * CopyLinkButton - Copy a URL to clipboard with visual feedback
 *
 * Variants:
 * - button: Full button with icon and text
 * - input: Read-only input with copy button
 * - icon: Icon-only button with tooltip
 */
export function CopyLinkButton({
  url,
  variant = 'button',
  className,
  size = 'default',
  showIcon = true,
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [url]);

  const Icon = copied ? Check : Copy;
  const iconClass = cn(
    'transition-colors',
    copied ? 'text-emerald-500' : '',
    size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  );

  if (variant === 'icon') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className={cn(
              size === 'sm' ? 'h-7 w-7' : 'h-9 w-9',
              className
            )}
          >
            <Icon className={iconClass} />
            <span className="sr-only">{copied ? 'Copied!' : 'Copy link'}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? 'Copied!' : 'Copy link'}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (variant === 'input') {
    return (
      <div className={cn('flex gap-2', className)}>
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={url}
            readOnly
            className={cn(
              'pl-9 pr-3 font-mono text-xs bg-muted/50 cursor-text select-all',
              size === 'sm' ? 'h-8' : 'h-10'
            )}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
        </div>
        <Button
          variant="outline"
          size={size === 'sm' ? 'sm' : 'default'}
          onClick={handleCopy}
          className={cn(
            'gap-1.5 shrink-0',
            copied && 'border-emerald-500 text-emerald-600'
          )}
        >
          <Icon className={iconClass} />
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    );
  }

  // Default: button variant
  return (
    <Button
      variant="outline"
      size={size === 'sm' ? 'sm' : 'default'}
      onClick={handleCopy}
      className={cn(
        'gap-1.5',
        copied && 'border-emerald-500 text-emerald-600',
        className
      )}
    >
      {showIcon && <Icon className={iconClass} />}
      {copied ? 'Copied!' : 'Copy Link'}
    </Button>
  );
}

interface ShareUrlDisplayProps {
  token: string;
  baseUrl?: string;
  masked?: boolean;
  className?: string;
}

/**
 * ShareUrlDisplay - Display and copy a share link URL
 *
 * Automatically constructs the full URL from the token
 */
export function ShareUrlDisplay({
  token,
  baseUrl,
  masked = false,
  className,
}: ShareUrlDisplayProps) {
  // Construct the full share URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const base = baseUrl || origin;
  const fullUrl = `${base}/shared/test/${token}`;

  // For masked tokens, show a placeholder
  const displayUrl = masked
    ? `${base}/shared/test/${'*'.repeat(8)}...`
    : fullUrl;

  return (
    <div className={cn('space-y-2', className)}>
      <CopyLinkButton
        url={masked ? '' : fullUrl}
        variant="input"
        size="sm"
      />
      {masked && (
        <p className="text-xs text-muted-foreground">
          Full link only visible to the link creator
        </p>
      )}
    </div>
  );
}
