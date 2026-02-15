"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Users,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Hourglass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CandidateResultDetails } from "./CandidateResultDetails";
import { AssessmentGoal, SessionStatus, TestSession } from "@/types/domain";

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
}: SessionsTableProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);

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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/5 hover:bg-muted/5">
              <TableHead className="w-[40%] min-w-[140px] pl-4">
                Candidate
              </TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[80px]">Score</TableHead>
              <TableHead className="hidden md:table-cell min-w-[100px]">
                Duration
              </TableHead>
              <TableHead className="hidden md:table-cell min-w-[120px]">
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
                  <TableCell className="pl-4 py-3 align-top sm:align-middle">
                    <div className="flex flex-col gap-0.5">
                      <p className="font-medium text-sm truncate max-w-[140px] sm:max-w-xs">
                        {session.candidateName || "Anonymous"}
                      </p>
                      {session.candidateEmail && (
                        <p className="text-xs text-muted-foreground truncate max-w-[140px] sm:max-w-xs">
                          {session.candidateEmail}
                        </p>
                      )}
                      {/* Mobile-only date display */}
                      <p className="text-[10px] text-muted-foreground md:hidden mt-1">
                        {session.createdAt
                          ? new Date(session.createdAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 align-top sm:align-middle">
                    <StatusBadge status={session.status} />
                  </TableCell>
                  <TableCell className="py-3 align-top sm:align-middle">
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
                  <TableCell className="hidden md:table-cell text-sm">
                    {session.durationMinutes
                      ? `${session.durationMinutes} min`
                      : "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {session.createdAt
                      ? new Date(session.createdAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell
                    className="text-right pr-4 py-3 align-top sm:align-middle"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isCompleted && (
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/5"
                      >
                        <Link
                          href={`/test-templates/results/${session.id}`}
                        >
                          <span className="hidden sm:inline mr-1">Full</span>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
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
    </>
  );
}
