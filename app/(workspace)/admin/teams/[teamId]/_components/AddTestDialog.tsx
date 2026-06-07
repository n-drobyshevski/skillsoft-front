"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, ClipboardList, Check, X } from "lucide-react";
import { GoalBadge } from "@/components/catalog/GoalBadge";
import { testTemplatesApi } from "@/services/api";
import { SharePermission } from "@/types/domain";
import type { TestTemplateSummary } from "@/types/domain";
import { addTestsToTeamAction } from "../actions";
import { toast } from "sonner";

interface AddTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  existingTemplateIds: string[];
}

const PERMISSION_OPTIONS: SharePermission[] = [
  SharePermission.VIEW,
  SharePermission.EDIT,
  SharePermission.MANAGE,
];

export default function AddTestDialog({
  open,
  onOpenChange,
  teamId,
  existingTemplateIds,
}: AddTestDialogProps) {
  const t = useTranslations("teams.detail.addTests");
  const tPerm = useTranslations("enums.permission");
  const [searchQuery, setSearchQuery] = useState("");
  const [templates, setTemplates] = useState<TestTemplateSummary[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [permission, setPermission] = useState<SharePermission>(SharePermission.VIEW);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load shareable (active) templates when the dialog opens
  useEffect(() => {
    if (!open) return;
    let active = true;
    setIsLoading(true);
    testTemplatesApi
      .getActiveTemplates()
      .then((data) => {
        if (active) setTemplates(data ?? []);
      })
      .catch(() => {
        if (active) setTemplates([]);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
          setHasLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [open]);

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (tpl) =>
        tpl.name.toLowerCase().includes(q) ||
        (tpl.description?.toLowerCase().includes(q) ?? false)
    );
  }, [templates, searchQuery]);

  const toggleTemplate = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetState = () => {
    setSelectedIds(new Set());
    setSearchQuery("");
    setPermission(SharePermission.VIEW);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetState();
  };

  const handleAdd = () => {
    if (selectedIds.size === 0) return;
    startTransition(async () => {
      const result = await addTestsToTeamAction(teamId, Array.from(selectedIds), permission);
      if (result.success) {
        toast.success(result.message);
        handleClose();
      } else {
        toast.error(result.message);
      }
    });
  };

  const isExisting = (id: string) => existingTemplateIds.includes(id);

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Permission + selection summary */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("permissionLabel")}</span>
            <Select
              value={permission}
              onValueChange={(v) => setPermission(v as SharePermission)}
            >
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERMISSION_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {tPerm(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedIds.size > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              <X className="h-3 w-3 mr-1" />
              {t("clear", { count: selectedIds.size })}
            </Button>
          )}
        </div>

        {/* Templates list */}
        <ScrollArea className="h-[300px] -mx-6 px-6">
          {hasLoaded && filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Search className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">{t("noTests")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTemplates.map((tpl) => {
                const selected = selectedIds.has(tpl.id);
                const existing = isExisting(tpl.id);
                return (
                  <div
                    key={tpl.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      existing
                        ? "opacity-50 cursor-not-allowed bg-muted/30"
                        : selected
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                    }`}
                    onClick={() => !existing && toggleTemplate(tpl.id)}
                  >
                    <Checkbox
                      checked={selected}
                      disabled={existing}
                      onCheckedChange={() => !existing && toggleTemplate(tpl.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{tpl.name}</p>
                        <GoalBadge goal={tpl.goal} />
                      </div>
                      {tpl.description && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {tpl.description}
                        </p>
                      )}
                    </div>
                    {existing && (
                      <Badge variant="outline" className="shrink-0">
                        <Check className="h-3 w-3 mr-1" />
                        {t("alreadyAdded")}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleAdd} disabled={selectedIds.size === 0 || isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("adding")}
              </>
            ) : (
              <>
                <ClipboardList className="h-4 w-4 mr-2" />
                {t("add")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
