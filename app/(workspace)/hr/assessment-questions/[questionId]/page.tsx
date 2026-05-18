import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
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
import { HelpTooltip } from "@/components/ui/help-tooltip";
import QuestionDetailClient from "./_components/QuestionDetailClient";
import { CompetencyHoverCard } from "../../behavioral-indicators/[indicatorId]/_components/CompetencyHoverCard";
import { IndicatorHoverCard } from "@/components/feedback/IndicatorHoverCard";
import type { BehavioralIndicator, Competency } from "@/types/domain";
import Loading from "./loading";

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


/**
 * Async data-fetching component for question detail.
 * Wrapped in Suspense to enable PPR static shell.
 */
async function QuestionDetailData({ questionId }: { questionId: string }) {
	const { question, indicator, competency } = await getQuestionData(questionId);

	if (!question) {
		notFound();
	}

	const t = await getTranslations("question.detail");
	const tQuestionType = await getTranslations("enums.questionType");
	const tDifficulty = await getTranslations("enums.difficultyLevel");
	const tTags = await getTranslations("forms.question.tags");
	const tHelp = await getTranslations("help.question");
	const tRubric = await getTranslations("enums.scoringRubric");

	const rubricCode = question.scoringRubric?.trim() ?? "";
	const isKnownRubric = rubricCode.length > 0 && tRubric.has(rubricCode);

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
								{t("questionDetails")}
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
									{t("answerOptions")}
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
															{t("points", { count: option.score as number })}
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
										<span>{t("totalOptions", { count: question.answerOptions.length })}</span>
										<span>
											{t("scoreRange", {
												min: Math.min(...question.answerOptions.map(o => o.score as number)),
												max: Math.max(...question.answerOptions.map(o => o.score as number)),
											})}
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
									<span className="inline-flex items-center">
										{t("scoringRubric")}
										<HelpTooltip
											content={tHelp("scoringRubric")}
											variant="help"
											size="sm"
											maxWidth={320}
										/>
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="rounded-lg border-l-[3px] border-orange-400 dark:border-orange-600 bg-orange-50/40 dark:bg-orange-950/15 px-4 py-3.5">
									{isKnownRubric ? (
										<div className="flex items-center">
											<span className="text-sm font-medium text-foreground">
												{tRubric(rubricCode)}
											</span>
											<HelpTooltip
												content={tRubric(`${rubricCode}_DESC`)}
												variant="info"
												size="md"
												maxWidth={320}
											/>
										</div>
									) : (
										<p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
											{question.scoringRubric}
										</p>
									)}
								</div>
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
									{t("context")}
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								{/* Vertical navigation path */}
								<nav className="space-y-3" aria-label={t("navigationPath")}>
									{competency && (
										<div className="flex items-center gap-3 group">
											<div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
												<Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
											</div>
											<div className="flex-1">
												<div className="text-xs text-muted-foreground mb-0.5">{t("competency")}</div>
												<CompetencyHoverCard competencyId={competency.id}>
													<Link 
														href={`/competencies/${competency.id}`}
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
												<div className="text-xs text-muted-foreground mb-0.5">{t("behavioralIndicator")}</div>
												<IndicatorHoverCard indicatorId={indicator.id}>
													<Link 
														href={`/behavioral-indicators/${indicator.id}`}
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
											<div className="text-xs text-muted-foreground mb-0.5">{t("assessmentQuestion")}</div>
											<span className="text-foreground font-medium text-sm">{t("currentQuestion")}</span>
										</div>
									</div>
								</nav>
								
								{/* Helper text */}
								<div className="mt-4 pt-3 border-t border-border/60">
									<p className="text-xs text-muted-foreground">
										{t("navigationHelp")}
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
								{t("metadata")}
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-0 space-y-4">
							<div className="flex items-center justify-between py-2 border-b border-border/50">
								<div className="flex items-center gap-3">
									<Type className="w-4 h-4 text-muted-foreground" />
									<dt className="text-sm font-medium text-muted-foreground">
										{t("questionType")}
									</dt>
								</div>
								<dd className="text-sm font-medium">
									{tQuestionType.has(question.questionType)
										? tQuestionType(question.questionType)
										: question.questionType.replace("_", " ")}
								</dd>
							</div>
							<div className="flex items-center justify-between py-2 border-b border-border/50">
								<div className="flex items-center gap-3">
									<BarChart className="w-4 h-4 text-muted-foreground" />
									<dt className="text-sm font-medium text-muted-foreground">
										{t("difficultyLevel")}
									</dt>
								</div>
								<dd className="text-sm font-medium">
									{tDifficulty.has(question.difficultyLevel)
										? tDifficulty(question.difficultyLevel)
										: question.difficultyLevel}
								</dd>
							</div>
							{question.timeLimit && (
								<div className="flex items-center justify-between py-2 border-b border-border/50">
									<div className="flex items-center gap-3">
										<Clock className="w-4 h-4 text-muted-foreground" />
										<dt className="text-sm font-medium text-muted-foreground">
											{t("timeLimit")}
										</dt>
									</div>
									<dd className="text-sm font-medium">
										{t("secondsValue", { seconds: question.timeLimit })}
									</dd>
								</div>
							)}
							{/* Context Tags */}
							{question.metadata?.tags && question.metadata.tags.length > 0 && (
								<div className="py-2 border-t border-border/50">
									<dt className="text-sm font-medium text-muted-foreground mb-2">
										{t("contextTags")}
									</dt>
									<dd className="flex flex-wrap gap-1.5">
										{question.metadata.tags.map((tag: string) => (
											<Badge
												key={tag}
												variant="secondary"
												className={`text-xs px-2 py-0.5 font-medium ${
													tag === 'GENERAL'
														? 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800'
														: ['IT', 'SALES', 'FINANCE', 'MEDICAL', 'ENGINEERING'].includes(tag)
														? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
														: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
												}`}
											>
												{tTags.has(tag) ? tTags(tag) : tag}
											</Badge>
										))}
									</dd>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
			</QuestionDetailClient>
		</EntityDetailLayout>
	);
}

export default async function Page({ params }: QuestionDetailPageProps) {
	const { questionId } = await params;

	return (
		<Suspense fallback={<Loading />}>
			<QuestionDetailData questionId={questionId} />
		</Suspense>
	);
}
