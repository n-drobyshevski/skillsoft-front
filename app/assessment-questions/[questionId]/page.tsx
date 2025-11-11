import { notFound } from "next/navigation";
import { assessmentQuestionsApi, behavioralIndicatorsApi, competenciesApi } from "@/services/api";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	FileText,
	HelpCircle,
	Clock,
	BarChart,
	Info,
	Type,
	Award,
	Target,
	ExternalLink
} from "lucide-react";
import Link from "next/link";
import { EntityDetailLayout } from "../../components/EntityDetailLayout";
import QuestionDetailClient from "./components/QuestionDetailClient";
import { CompetencyHoverCard } from "../../behavioral-indicators/[indicatorId]/components/CompetencyHoverCard";
import { IndicatorHoverCard } from "../../components/IndicatorHoverCard";
import type { BehavioralIndicator, Competency } from "../../interfaces/domain-interfaces";
interface QuestionDetailPageProps {
	params: { questionId: string };
}

async function getQuestionData(questionId: string) {
	const question = await assessmentQuestionsApi.getQuestionById(questionId);
	
	if (!question) {
		return { question: null, indicator: null, competency: null };
	}

	let indicator: BehavioralIndicator | null = null;
	let competency: Competency | null = null;

	// Fetch indicator if available
	if (question.behavioralIndicatorId) {
		try {
			indicator = await behavioralIndicatorsApi.getIndicatorById(question.behavioralIndicatorId);
			
			// Fetch competency if indicator is available
			if (indicator?.competencyId) {
				competency = await competenciesApi.getCompetencyById(indicator.competencyId);
			}
		} catch {
			// Silent error handling - context loading is optional
		}
	}

	return { question, indicator, competency };
}


export default async function Page({ params }: QuestionDetailPageProps) {
	const { questionId } = await params;
	const { question, indicator, competency } = await getQuestionData(questionId);

	if (!question) {
		notFound();
	}

	return (
		<EntityDetailLayout>
			<QuestionDetailClient question={question} competency={competency} indicator={indicator}>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="w-5 h-5" />
								Question Details
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground leading-relaxed">
								{question.questionText}
							</p>
						</CardContent>
					</Card>

					{question.answerOptions && question.answerOptions.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<HelpCircle className="w-5 h-5" />
									Answer Options
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{question.answerOptions.map((option, index) => (
										<div
											key={index}
											className="p-4 bg-muted/50 rounded-lg border"
										>
											<p className="font-semibold">{option.text as string}</p>
											<div className="flex items-center justify-between mt-2">
												<Badge variant="secondary">Score: {option.score as number}</Badge>
												<p className="text-sm text-muted-foreground">{option.explanation as string}</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Scoring Rubric */}
					{question.scoringRubric && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<BarChart className="w-5 h-5" />
									Scoring Rubric
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground leading-relaxed">
									{question.scoringRubric}
								</p>
							</CardContent>
						</Card>
					)}
				</div>

				<div className="space-y-6">
					{/* Context Information */}
					{(competency || indicator) && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Info className="w-5 h-5" />
									Context
								</CardTitle>
								<CardDescription>
									This question is part of the following competency framework
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{competency && (
									<div className="flex items-center gap-3">
										<Award className="w-5 h-5 text-blue-600" />
										<div className="flex-1">
											<dt className="text-sm font-medium text-muted-foreground">
												Competency
											</dt>
											<CompetencyHoverCard competencyId={competency.id}>
												<Link 
													href={`/competencies/${competency.id}`}
													className="text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1"
												>
													{competency.name}
													<ExternalLink className="h-3 w-3" />
												</Link>
											</CompetencyHoverCard>
										</div>
									</div>
								)}
								
								{indicator && (
									<div className="flex items-center gap-3">
										<Target className="w-5 h-5 text-green-600" />
										<div className="flex-1">
											<dt className="text-sm font-medium text-muted-foreground">
												Behavioral Indicator
											</dt>
											<IndicatorHoverCard indicatorId={indicator.id}>
												<Link 
													href={`/behavioral-indicators/${indicator.id}`}
													className="text-green-600 hover:text-green-800 hover:underline font-medium flex items-center gap-1"
												>
													{indicator.title}
													<ExternalLink className="h-3 w-3" />
												</Link>
											</IndicatorHoverCard>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					)}

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Info className="w-5 h-5" />
								Metadata
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-3">
								<Type className="w-5 h-5 text-muted-foreground" />
								<div>
									<dt className="text-sm font-medium text-muted-foreground">
										Question Type
									</dt>
									<dd className="text-sm font-medium">
										{question.questionType.replace("_", " ")}
									</dd>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<BarChart className="w-5 h-5 text-muted-foreground" />
								<div>
									<dt className="text-sm font-medium text-muted-foreground">
										Difficulty Level
									</dt>
									<dd className="text-sm font-medium">
										{question.difficultyLevel}
									</dd>
								</div>
							</div>
							{question.timeLimit && (
								<div className="flex items-center gap-3">
									<Clock className="w-5 h-5 text-muted-foreground" />
									<div>
										<dt className="text-sm font-medium text-muted-foreground">
											Time Limit
										</dt>
										<dd className="text-sm font-medium">
											{question.timeLimit} seconds
										</dd>
									</div>
								</div>
							)}
							<div className="flex items-center gap-3">
								<Info className="w-5 h-5 text-muted-foreground" />
								<div>
									<dt className="text-sm font-medium text-muted-foreground">
										Order Index
									</dt>
									<dd className="text-sm font-medium">
										#{question.orderIndex}
									</dd>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
			</QuestionDetailClient>
		</EntityDetailLayout>
	);
}
