"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/feedback/DeleteConfirmationDialog";
import { assessmentQuestionsApi } from "@/services/api";
import { toast } from 'sonner';
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { questionDifficultyToColor } from "@/app/utils";
import { DifficultyLevel } from "@/types/domain";
export default function QuestionHeader({
    questionId,
    questionText,
    difficultyLevel,
    isActive
}: {
    questionId: string;
    questionText: string;
    difficultyLevel: DifficultyLevel;
    isActive: boolean;
}) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            // Note: We need competencyId and behavioralIndicatorId for the API call
            // For now, we'll implement a simpler delete endpoint that doesn't require them
            await assessmentQuestionsApi.deleteQuestion('', '', questionId);
            toast.success('Question deleted successfully');
            router.push('/assessment-questions');
        } catch {
            toast.error('Failed to delete question. Please try again.');
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/assessment-questions">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="sr-only">Go back</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Assessment Question
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge
                                variant="outline"
                                className={questionDifficultyToColor(difficultyLevel)}
                            >
                                {difficultyLevel}
                            </Badge>
                            <Badge variant={isActive ? "default" : "secondary"}>
                                {isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                    <Link href={`/assessment-questions/${questionId}/edit`} passHref>
                        <Button>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                </div>
            </div>

            <DeleteConfirmationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDelete}
                title="Delete Assessment Question"
                description="Are you sure you want to delete this assessment question? This action cannot be undone."
                entityName={questionText}
                isDeleting={isDeleting}
                confirmButtonText="Delete Question"
            />
        </>
    );
}