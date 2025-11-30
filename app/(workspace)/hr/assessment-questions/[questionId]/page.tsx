import { notFound } from "next/navigation";
import { assessmentQuestionsApi, behavioralIndicatorsApi, competenciesApi } from "@/services/api";
import {
	Card,
	CardContent,
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
import { EntityDetailLayout } from "@/components/common/EntityDetailLayout";
import QuestionDetailClient from "./_components/QuestionDetailClient";
import { CompetencyHoverCard } from "@/app/(workspace)/hr/behavioral-indicators/[indicatorId]/_components/CompetencyHoverCard";
import { IndicatorHoverCard } from "@/components/feedback/IndicatorHoverCard";
import type { BehavioralIndicator, Competency } from "@/types/domain";
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
					<Card className="border-none shadow-sm bg-muted/30">
						<CardHeader className="pb-4">
							<CardTitle className="text-base font-medium flex items-center gap-2.5">
								<div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
									<FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
								</div>
								Question Details
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-0">
							<p className="text-sm text-muted-foreground leading-relaxed">
								{question.questionText}
							</p>
						</CardContent>
					</Card>

					{question.answerOptions && question.answerOptions.length > 0 && (
						<Card className="border-none shadow-sm bg-muted/30">
							<CardHeader className="pb-4">
								<CardTitle className="text-base font-medium flex items-center gap-2.5">
									<div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
										<HelpCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
									</div>
									Answer Options
									<Badge variant="secondary" className="ml-1 font-medium text-xs">
										{question.answerOptions.length}
									</Badge>
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="space-y-2">
									{question.answerOptions.map((option, index) => (
										<div
											key={index}
											className="group relative bg-background/50 border border-border/50 rounded-lg hover:bg-background hover:border-primary/40 hover:shadow-sm transition-all duration-200 overflow-hidden"
										>
											{/* Main content area */}
											<div className="flex items-start gap-3 p-3">
												{/* Option indicator */}
												<div className="flex items-center gap-3 flex-1 min-w-0">
													<div className="w-6 h-6 bg-muted/60 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 border-2 border-transparent group-hover:border-purple-200 dark:group-hover:border-purple-800">
														<span className="text-xs font-semibold text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400">
															{String.fromCharCode(65 + index)}
														</span>
													</div>
													
													{/* Option content */}
													<div className="flex-1 min-w-0 space-y-1">
														{/* Option text */}
														<p className="text-sm font-medium text-foreground line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">
															{option.text as string}
														</p>
														
														{/* Explanation if exists */}
														{option.explanation && (
															<p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
																{option.explanation as string}
															</p>
														)}
													</div>
													
													{/* Score badge */}
													<div className="shrink-0">
														<Badge
															variant="secondary"
															className={`text-xs px-2 py-1 font-medium ${
																(option.score as number) >= 80
																	? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
																	: (option.score as number) >= 60
																	? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
																	: (option.score as number) >= 40
																	? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
																	: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
															}`}
														>
															{option.score} pts
														</Badge>
													</div>
												</div>
											</div>
											
											{/* Hover effect overlay */}
											<div className="absolute inset-0 bg-linear-to-r from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
										</div>
									))}
								</div>
								
								{/* Summary info */}
								<div className="mt-4 pt-3 border-t border-border/60">
									<div className="flex justify-between text-xs text-muted-foreground font-medium">
										<span>Total options: {question.answerOptions.length}</span>
										<span>
											Score range: {Math.min(...question.answerOptions.map(o => o.score as number))} - {Math.max(...question.answerOptions.map(o => o.score as number))} pts
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Scoring Rubric */}
					{question.scoringRubric && (
						<Card className="border-none shadow-sm bg-muted/30">
							<CardHeader className="pb-4">
								<CardTitle className="text-base font-medium flex items-center gap-2.5">
									<div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
										<BarChart className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
									</div>
									Scoring Rubric
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<p className="text-sm text-muted-foreground leading-relaxed">
									{question.scoringRubric}
								</p>
							</CardContent>
						</Card>
					)}
				</div>

				<div className="space-y-6">
					{/* Context Information */}
					{(competency || indicator) && (
						<Card className="border-none shadow-sm bg-muted/30">
							<CardHeader className="pb-3">
								<CardTitle className="text-base font-medium flex items-center gap-2.5">
									<div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
										<Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
									</div>
									Context
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								{/* Vertical navigation path */}
								<nav className="space-y-3" aria-label="Navigation path">
									{competency && (
										<div className="flex items-center gap-3 group">
											<div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
												<Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
											</div>
											<div className="flex-1">
												<div className="text-xs text-muted-foreground mb-0.5">Competency</div>
												<CompetencyHoverCard competencyId={competency.id}>
													<Link 
														href={`/hr/competencies/${competency.id}`}
														className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium flex items-center gap-1.5 transition-colors group text-sm"
													>
														<span className="line-clamp-1">{competency.name}</span>
														<ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 shrink-0" />
													</Link>
												</CompetencyHoverCard>
											</div>
										</div>
									)}
									
									{indicator && (
										<div className="flex items-center gap-3 group">
											<div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
												<Target className="w-4 h-4 text-green-600 dark:text-green-400" />
											</div>
											<div className="flex-1">
												<div className="text-xs text-muted-foreground mb-0.5">Behavioral Indicator</div>
												<IndicatorHoverCard indicatorId={indicator.id}>
													<Link 
														href={`/hr/behavioral-indicators/${indicator.id}`}
														className="text-green-600 hover:text-green-800 dark:hover:text-green-300 hover:underline font-medium flex items-center gap-1.5 transition-colors group text-sm"
													>
														<span className="line-clamp-1">{indicator.title}</span>
														<ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 shrink-0" />
													</Link>
												</IndicatorHoverCard>
											</div>
										</div>
									)}
									
									<div className="flex items-center gap-3">
										<div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30">
											<HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
										</div>
										<div className="flex-1">
											<div className="text-xs text-muted-foreground mb-0.5">Assessment Question</div>
											<span className="text-foreground font-medium text-sm">Current Question</span>
										</div>
									</div>
								</nav>
								
								{/* Helper text */}
								<div className="mt-4 pt-3 border-t border-border/60">
									<p className="text-xs text-muted-foreground">
										Navigate through the competency framework hierarchy
									</p>
								</div>
							</CardContent>
						</Card>
					)}

					<Card className="border-none shadow-sm bg-muted/30">
						<CardHeader className="pb-4">
							<CardTitle className="text-base font-medium flex items-center gap-2.5">
								<div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-900/30">
									<Info className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
								</div>
								Metadata
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-0 space-y-4">
							<div className="flex items-center justify-between py-2 border-b border-border/50">
								<div className="flex items-center gap-3">
									<Type className="w-4 h-4 text-muted-foreground" />
									<dt className="text-sm font-medium text-muted-foreground">
										Question Type
									</dt>
								</div>
								<dd className="text-sm font-medium">
									{question.questionType.replace("_", " ")}
								</dd>
							</div>
							<div className="flex items-center justify-between py-2 border-b border-border/50">
								<div className="flex items-center gap-3">
									<BarChart className="w-4 h-4 text-muted-foreground" />
									<dt className="text-sm font-medium text-muted-foreground">
										Difficulty Level
									</dt>
								</div>
								<dd className="text-sm font-medium">
									{question.difficultyLevel}
								</dd>
							</div>
							{question.timeLimit && (
								<div className="flex items-center justify-between py-2 border-b border-border/50">
									<div className="flex items-center gap-3">
										<Clock className="w-4 h-4 text-muted-foreground" />
										<dt className="text-sm font-medium text-muted-foreground">
											Time Limit
										</dt>
									</div>
									<dd className="text-sm font-medium">
										{question.timeLimit} seconds
									</dd>
								</div>
							)}
							<div className="flex items-center justify-between py-2">
								<div className="flex items-center gap-3">
									<Info className="w-4 h-4 text-muted-foreground" />
									<dt className="text-sm font-medium text-muted-foreground">
										Order Index
									</dt>
								</div>
								<dd className="font-mono font-medium text-foreground bg-muted px-2 py-0.5 rounded text-xs">
									#{question.orderIndex}
								</dd>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
			</QuestionDetailClient>
		</EntityDetailLayout>
	);
}
