"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Share2, Link } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// ============================================
// Copy Button
// ============================================

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({
  text,
  label = "Скопировать",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      toast.success("Скопировано в буфер обмена", {
        duration: 2000,
        position: "bottom-center",
      });

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Не удалось скопировать");
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5",
        "text-xs font-medium px-2.5 py-1.5 rounded-lg",
        "bg-muted/40 hover:bg-muted/80",
        "text-muted-foreground hover:text-foreground",
        "border border-transparent hover:border-border/50",
        "transition-all duration-200",
        "touch-manipulation active:scale-95",
        // Minimum touch target
        "min-h-[28px]",
        // Success state
        copied && [
          "bg-emerald-100/80 dark:bg-emerald-900/30",
          "text-emerald-700 dark:text-emerald-400",
          "border-emerald-200/60 dark:border-emerald-800/40",
        ],
        className
      )}
      aria-label={copied ? "Скопировано" : label}
    >
      <span
        className={cn(
          "transition-transform duration-200",
          copied && "animate-copy-success"
        )}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </span>
      <span className="hidden sm:inline">{copied ? "Скопировано" : label}</span>
    </button>
  );
}

// ============================================
// Share Button
// ============================================

interface ShareButtonProps {
  termId: string;
  termName: string;
  termDefinition: string;
  className?: string;
}

export function ShareButton({
  termId,
  termName,
  termDefinition,
  className,
}: ShareButtonProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  const getShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/docs/glossary#${termId}`;
  }, [termId]);

  const shareText = `${termName}: ${termDefinition.slice(0, 100)}...`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setLinkCopied(true);
      toast.success("Ссылка скопирована");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error("Не удалось скопировать ссылку");
    }
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      getShareUrl()
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: termName,
          text: termDefinition,
          url: getShareUrl(),
        });
      } catch {
        // User cancelled
      }
    }
  };

  const canNativeShare =
    typeof navigator !== "undefined" && "share" in navigator;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "p-2 rounded-lg",
            "text-muted-foreground hover:text-foreground",
            "bg-muted/40 hover:bg-muted/80",
            "border border-transparent hover:border-border/50",
            "transition-all duration-200",
            "touch-manipulation active:scale-95",
            // Minimum touch target
            "min-h-[28px] min-w-[28px]",
            className
          )}
          aria-label="Поделиться"
        >
          <Share2 className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyLink}>
          {linkCopied ? (
            <Check className="size-4 mr-2 text-emerald-500" />
          ) : (
            <Link className="size-4 mr-2" />
          )}
          Копировать ссылку
        </DropdownMenuItem>

        <DropdownMenuItem onClick={shareToTelegram}>
          <svg
            className="size-4 mr-2"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
          Telegram
        </DropdownMenuItem>

        {canNativeShare && (
          <DropdownMenuItem onClick={shareNative}>
            <Share2 className="size-4 mr-2" />
            Другие приложения...
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================
// Term Actions Bar (combines all actions)
// ============================================

interface TermActionsProps {
  termId: string;
  termName: string;
  termDefinition: string;
  className?: string;
}

export function TermActions({
  termId,
  termName,
  termDefinition,
  className,
}: TermActionsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <CopyButton
        text={`${termName}: ${termDefinition}`}
        label="Копировать"
      />
      <ShareButton
        termId={termId}
        termName={termName}
        termDefinition={termDefinition}
      />
    </div>
  );
}
