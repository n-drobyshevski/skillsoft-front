"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";

import { questionDifficultyToColor } from "../../../utils";
import { DifficultyLevel } from "@/enums/domain_enums";
export default function QuestionHeader({
    questionId,
    difficultyLevel,
    isActive
}: {
    questionId: string;
    questionText: string;
    difficultyLevel: DifficultyLevel;
    isActive: boolean;
}) {
    const id = questionId;
    return (
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
				{id && (
					<Link href={`/assessment-questions/${id}/edit`} passHref>
						<Button>
							<Pencil className="mr-2 h-4 w-4" />
							Edit
						</Button>
					</Link>
				)}
			</div>
    );
}