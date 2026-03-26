"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Hourglass,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CandidateResultDetails } from "./CandidateResultDetails";
import { AssessmentGoal, SessionStatus, TestSession } from "@/types/domain";
import { DeleteConfirmationDialog } from "@/components/feedback/DeleteConfirmationDialog";
import { deleteTestSession, bulkDeleteTestSessions } from "../actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

// Extended session type with additional fields
type ExtendedSession = TestSession & {
  candidateName?: string;
  candidateEmail?: string;
  score?: number;
  durationMinutes?: number;
};

interface SessionsTableProps {
  sessions: ExtendedSession[];
  templateId: string;
  templateGoal?: AssessmentGoal;
  passingScore?: number;
  isAdmin?: boolean;
}

function StatusBadge({ status }: { status: SessionStatus }) {
  const configMap: Record<SessionStatus, { icon: typeof CheckCircle2; label: string; className: string }> = {
    [SessionStatus.COMPLETED]: {
      icon: CheckCircle2,
      label: "Completed",
      className:
        "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    },
    [SessionStatus.IN_PROGRESS]: {
      icon: Clock,
      label: "In Progress",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    },
    [SessionStatus.ABANDONED]: {
      icon: XCircle,
      label: "Abandoned",
      className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    },
    [SessionStatus.NOT_STARTED]: {
      icon: AlertCircle,
      label: "Not Started",
      className:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400",
    },
    [SessionStatus.TIMED_OUT]: {
      icon: Hourglass,
      label: "Timed Out",
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
    },
  };

  const config = configMap[status] || { icon: AlertCircle, label: status, className: "" };
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 text-xs py-0.5 px-2 whitespace-nowrap",
        config.className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

export function SessionsTable({
  sessions,
  templateId,
  templateGoal,
  passingScore = 70,
  isAdmin = false,
}: SessionsTableProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  // Delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "single"; sessionId: string; entityName: string }
    | { type: "bulk" }
    | null
  >(null);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("template.sessionDelete");

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sessions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sessions.map((s) => s.id)));
    }
  };

  const handleDeleteSingle = (session: ExtendedSession) => {
    setDeleteTarget({
      type: "single",
      sessionId: session.id,
      entityName: session.candidateName || session.candidateEmail || "Anonymous",
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteBulk = () => {
    setDeleteTarget({ type: "bulk" });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      if (deleteTarget.type === "single") {
        const result = await deleteTestSession(deleteTarget.sessionId, templateId);
        if (result.success) {
          toast.success(t("sessionDeleted"), {
            description: t("sessionDeletedDescription"),
          });
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(deleteTarget.sessionId);
            return next;
          });
        } else {
          toast.error(t("deleteError"), {
            description: t("deleteErrorDescription"),
          });
        }
      } else {
        const ids = Array.from(selectedIds);
        const result = await bulkDeleteTestSessions(ids, templateId);
        if (result.success) {
          toast.success(
            t("sessionsDeleted", { count: result.deleted ?? ids.length }),
            {
              description: t("sessionsDeletedDescription", {
                deleted: result.deleted ?? ids.length,
              }),
            }
          );
          setSelectedIds(new Set());
        } else {
          toast.error(t("deleteError"), {
            description: t("bulkDeleteErrorDescription"),
          });
        }
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    });
  };

  const handleRowClick = (session: ExtendedSession) => {
    if (session.status === SessionStatus.COMPLETED) {
      setSelectedSessionId(session.id);
      setSheetOpen(true);
    }
  };

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 px-4 border-t sm:border rounded-b-lg bg-muted/5 sm:bg-muted/20">
        <Users className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
        <h3 className="text-base font-medium mb-1">No sessions found</h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Candidates will appear here once they start the test.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Bulk Actions Toolbar (Admin only) */}
      {isAdmin && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 border rounded-t-lg">
          <span className="text-sm text-muted-foreground">
            {t("selected", { count: selectedIds.size })}
          </span>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 min-h-[44px] sm:min-h-0"
            onClick={handleDeleteBulk}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            {t("deleteSelected", { count: selectedIds.size })}
          </Button>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="flex flex-col gap-2 md:hidden">
        {sessions.map((session) => {
          const isCompleted = session.status === SessionStatus.COMPLETED;

          return (
            <div
              key={session.id}
              className={cn(
                "rounded-lg border bg-card p-3 shadow-sm",
                isCompleted &&
                  "cursor-pointer hover:bg-muted/50 active:bg-muted/60 transition-colors"
              )}
              onClick={() => handleRowClick(session)}
              role={isCompleted ? "button" : undefined}
              tabIndex={isCompleted ? 0 : undefined}
              onKeyDown={(e) => {
                if (isCompleted && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  handleRowClick(session);
                }
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="font-medium text-sm truncate">
                    {session.candidateName || "Anonymous"}
                  </p>
                  {session.candidateEmail && (
                    <p className="text-xs text-muted-foreground truncate">
                      {session.candidateEmail}
                    </p>
                  )}
                </div>
                <StatusBadge status={session.status} />
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-muted-foreground">
                  {session.score !== undefined ? (
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        session.score >= passingScore
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      {session.score}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {session.durationMinutes
                    ? `${session.durationMinutes} min`
                    : "—"}
                </span>
                <span>
                  {session.createdAt
                    ? new Date(session.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>

              {isCompleted && (
                <div className="mt-2 pt-2 border-t">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs text-primary hover:text-primary hover:bg-primary/5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link href={`/test-templates/results/${session.id}`}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      View Full Results
                    </Link>
                  </Button>
                </div>
              )}

              {isAdmin && (
                <div className="mt-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full min-h-[44px] text-xs text-destructive hover:text-destructive hover:bg-destructive/5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSingle(session);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    {t("deleteSession")}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/5 hover:bg-muted/5">
              {isAdmin && (
                <TableHead className="w-[40px] pl-4">
                  <Checkbox
                    checked={sessions.length > 0 && selectedIds.size === sessions.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              <TableHead className="w-[40%] min-w-[140px] pl-4">
                Candidate
              </TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[80px]">Score</TableHead>
              <TableHead className="min-w-[100px]">
                Duration
              </TableHead>
              <TableHead className="min-w-[120px]">
                Started
              </TableHead>
              <TableHead className="text-right pr-4 min-w-[80px]">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => {
              const isCompleted = session.status === SessionStatus.COMPLETED;

              return (
                <TableRow
                  key={session.id}
                  className={cn(
                    "group",
                    isCompleted &&
                      "cursor-pointer hover:bg-muted/50 transition-colors"
                  )}
                  onClick={() => handleRowClick(session)}
                >
                  {isAdmin && (
                    <TableCell
                      className="pl-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedIds.has(session.id)}
                        onCheckedChange={() => toggleSelect(session.id)}
                        aria-label={`Select ${session.candidateName || "session"}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="pl-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <p className="font-medium text-sm truncate max-w-xs">
                        {session.candidateName || "Anonymous"}
                      </p>
                      {session.candidateEmail && (
                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                          {session.candidateEmail}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <StatusBadge status={session.status} />
                  </TableCell>
                  <TableCell className="py-3">
                    {session.score !== undefined ? (
                      <span
                        className={cn(
                          "font-semibold text-sm",
                          session.score >= passingScore
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {session.score}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {session.durationMinutes
                      ? `${session.durationMinutes} min`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {session.createdAt
                      ? new Date(session.createdAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell
                    className="text-right pr-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {isCompleted && (
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/5"
                        >
                          <Link href={`/test-templates/results/${session.id}`}>
                            <span className="mr-1">Full</span>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {isCompleted && (
                              <>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/test-templates/results/${session.id}`}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Full Results
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteSingle(session)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t("deleteSession")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Talent Sheet Side Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selectedSession?.candidateName || "Candidate"} Results
            </SheetTitle>
            <SheetDescription>
              Quick analysis and competency breakdown
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 h-[calc(100vh-8rem)] overflow-hidden">
            {selectedSessionId && (
              <CandidateResultDetails
                sessionId={selectedSessionId}
                templateGoal={templateGoal}
                passingScore={passingScore}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title={
          deleteTarget?.type === "single"
            ? t("deleteSessionTitle")
            : t("bulkDeleteTitle", { count: selectedIds.size })
        }
        description={
          deleteTarget?.type === "single"
            ? t("deleteSessionDescription")
            : t("bulkDeleteDescription", { count: selectedIds.size })
        }
        entityName={
          deleteTarget?.type === "single"
            ? deleteTarget.entityName
            : `${selectedIds.size} sessions`
        }
        isDeleting={isPending}
        confirmButtonText={t("deleteSession")}
      />
    </>
  );
}
