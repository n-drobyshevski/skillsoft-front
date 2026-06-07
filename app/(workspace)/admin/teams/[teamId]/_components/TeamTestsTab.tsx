"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  ClipboardList,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  Pencil,
  Settings2,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SharePermission } from "@/types/domain";
import type { TemplateShare } from "@/types/domain";
import { useFormattedDates } from "@/hooks/useFormattedDates";
import { toast } from "sonner";
import AddTestDialog from "./AddTestDialog";
import ConfirmActionDialog from "./ConfirmActionDialog";
import { removeTestFromTeamAction } from "../actions";

interface TeamTestsTabProps {
  teamId: string;
  sharedTemplates: TemplateShare[];
}

const PERMISSION_STYLE: Record<
  SharePermission,
  { icon: typeof Eye; className: string }
> = {
  [SharePermission.VIEW]: {
    icon: Eye,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  [SharePermission.EDIT]: {
    icon: Pencil,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  [SharePermission.MANAGE]: {
    icon: Settings2,
    className: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
};

function PermissionBadge({ permission }: { permission: SharePermission }) {
  const tPerm = useTranslations("enums.permission");
  /* eslint-disable-next-line security/detect-object-injection -- typed enum key */
  const style = PERMISSION_STYLE[permission];
  const Icon = style.icon;
  return (
    <Badge variant="secondary" className={cn("gap-1 text-xs", style.className)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {tPerm(permission)}
    </Badge>
  );
}

function EmptyTestsState({ onAddClick }: { onAddClick: () => void }) {
  const t = useTranslations("teams.detail.tests");
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
          <ClipboardList className="h-8 w-8 text-violet-500 dark:text-violet-400" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold max-w-[320px] mb-2">{t("empty.title")}</h3>
        <p className="text-sm text-muted-foreground max-w-[320px] leading-relaxed mb-4">
          {t("empty.description")}
        </p>
        <Button size="sm" className="min-h-[44px] touch-manipulation" onClick={onAddClick}>
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          {t("addTest")}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function TeamTestsTab({ teamId, sharedTemplates }: TeamTestsTabProps) {
  const t = useTranslations("teams.detail.tests");
  const tConfirm = useTranslations("teams.detail.confirmations");
  const { formatDate } = useFormattedDates();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<{ open: boolean; share: TemplateShare | null }>({
    open: false,
    share: null,
  });

  const existingTemplateIds = useMemo(
    () => sharedTemplates.map((s) => s.templateId),
    [sharedTemplates]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sharedTemplates;
    return sharedTemplates.filter((s) =>
      (s.templateName ?? "").toLowerCase().includes(q)
    );
  }, [sharedTemplates, searchQuery]);

  const handleRemove = async () => {
    if (!confirmRemove.share) return;
    const result = await removeTestFromTeamAction(teamId, confirmRemove.share.id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  if (sharedTemplates.length === 0) {
    return (
      <>
        <EmptyTestsState onAddClick={() => setIsAddOpen(true)} />
        <AddTestDialog
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          teamId={teamId}
          existingTemplateIds={existingTemplateIds}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-auto sm:min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button className="w-full sm:w-auto min-h-[44px] sm:min-h-0 touch-manipulation" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          {t("addTest")}
        </Button>
      </div>

      {/* Shared templates list */}
      {filtered.length > 0 ? (
        <div className="space-y-2" role="list" aria-label="Shared tests">
          {filtered.map((share) => {
            const expired = share.expiresAt && new Date(share.expiresAt) < new Date();
            return (
              <Card
                key={share.id}
                className={cn(
                  "transition-all duration-200 hover:shadow-md hover:border-primary/30",
                  expired && "opacity-60"
                )}
                role="listitem"
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                    <ClipboardList className="h-5 w-5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/test-templates/${share.templateId}`}
                        className="font-semibold truncate hover:underline"
                      >
                        {share.templateName ?? t("untitled")}
                      </Link>
                      <PermissionBadge permission={share.permission} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {share.grantedByName && (
                        <span className="truncate">
                          {t("addedBy", { name: share.grantedByName })}
                        </span>
                      )}
                      <span className="flex items-center gap-1 shrink-0">
                        <CalendarClock className="h-3 w-3" aria-hidden="true" />
                        {formatDate(share.grantedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                      <Link href={`/test-templates/${share.templateId}`} aria-label={t("openTest")}>
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => setConfirmRemove({ open: true, share })}
                      aria-label={t("remove")}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
            <p className="text-muted-foreground">{t("noResults", { query: searchQuery })}</p>
          </CardContent>
        </Card>
      )}

      <div className="text-sm text-muted-foreground text-center pt-2">
        {t("count", { showing: filtered.length, total: sharedTemplates.length })}
      </div>

      <AddTestDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        teamId={teamId}
        existingTemplateIds={existingTemplateIds}
      />

      <ConfirmActionDialog
        open={confirmRemove.open}
        onOpenChange={(open) =>
          setConfirmRemove({ open, share: open ? confirmRemove.share : null })
        }
        title={tConfirm("removeTest.title")}
        description={tConfirm("removeTest.description", {
          name: confirmRemove.share?.templateName ?? t("untitled"),
        })}
        confirmLabel={tConfirm("removeTest.confirm")}
        cancelLabel={tConfirm("removeTest.cancel")}
        variant="destructive"
        onConfirm={handleRemove}
      />
    </div>
  );
}
