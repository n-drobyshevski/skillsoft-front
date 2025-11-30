import Link from "next/link";
import { notFound } from "next/navigation";
import { competenciesApi, assessmentQuestionsApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Edit,
	FilePen,
	Target,
	Plus,
    Info,
    BarChart3,
} from "lucide-react";
import { Suspense } from 'react';

import QuestionsList from './_components/QuestionsList';
import { EntityDetailLayout } from '@/components/common/EntityDetailLayout';
import CompetencyDetailClient from './_components/CompetencyDetailClient';

import QuestionsListSkeleton from './_components/QuestionsListSkeleton';
import type {
	BehavioralIndicator,
	AssessmentQuestion,
} from "@/types/domain";
import { ProficiencyLevel } from "@/types/domain";
import { levelToColor, approvalStatusToColor } from "@/lib/ui-utils";

interface CompetencyDetailPageProps {
	params: Promise<{ competencyId: string }>;
}

async function getCompetencyData(competencyId: string) {
	const competency = await competenciesApi.getCompetencyById(competencyId);
	if (!competency) {
		return { competency: null, questions: [] };
	}

	const questions: AssessmentQuestion[] = [];
	if (competency.behavioralIndicators && competency.behavioralIndicators.length > 0) {
		for (const indicator of competency.behavioralIndicators) {
			const indicatorQuestions = await assessmentQuestionsApi.getIndicatorQuestions(
				competencyId, 
				indicator.id
			);
			if (indicatorQuestions) {
				questions.push(...indicatorQuestions);
			}
		}
	}

	return { competency, questions };
}

export default async function CompetencyDetailPage({
	params,
}: CompetencyDetailPageProps) {
	const { competencyId } = await params;
	const { competency, questions } = await getCompetencyData(competencyId);

	if (!competency) {
		notFound();
	}

	return (
		<EntityDetailLayout>
			<CompetencyDetailClient competency={competency}>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
				<div className="lg:col-span-2 space-y-4">
                    <Card className="border-none shadow-sm bg-muted/30">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                                    <FilePen className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {competency.description ||
                                    "No description available for this competency."}
                            </p>
                        </CardContent>
                    </Card>
					<Card className="overflow-hidden">
                        <Tabs defaultValue="indicators" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="indicators">
                                    <span className="hidden sm:inline">
                                        Behavioral Indicators {competency.behavioralIndicators?.length ? `(${competency.behavioralIndicators.length})` : ''}
                                    </span>
                                    <span className="sm:hidden">
                                        Indicators {competency.behavioralIndicators?.length ? `(${competency.behavioralIndicators.length})` : ''}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="questions">
                                    <span className="hidden sm:inline">
                                        Assessment Questions {questions.length > 0 && `(${questions.length})`}
                                    </span>
                                    <span className="sm:hidden">
                                        Questions {questions.length > 0 && `(${questions.length})`}
                                    </span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="indicators" className="p-4 space-y-3">
                                {competency.behavioralIndicators &&
                                competency.behavioralIndicators.length > 0 ? (
                                    <>
                                        {/* Header with count and add button */}
                                        <div className="flex items-center justify-between pb-2 border-b border-border/40">
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                    Indicators
                                                </h4>
                                                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                                                    {competency.behavioralIndicators.length}
                                                </Badge>
                                            </div>
                                            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                                                <Link href={`/hr/behavioral-indicators/new?competencyId=${competency.id}`}>
                                                    <Plus className="mr-1.5 h-3 w-3" />
                                                    Add
                                                </Link>
                                            </Button>
                                        </div>
                                        
                                        {/* Indicators list */}
                                        <div className="space-y-1.5">	
                                            {competency.behavioralIndicators.map((indicator) => (
                                                <IndicatorCard key={indicator.id} indicator={indicator} />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-6 sm:py-8">
                                        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                                            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-sm sm:text-base font-medium text-foreground mb-1">
                                            No Behavioral Indicators
                                        </h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto mb-4 px-4">
                                            Add behavioral indicators to define what success looks like.
                                        </p>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/hr/behavioral-indicators/new?competencyId=${competency.id}`}>
                                                <Target className="h-3.5 w-3.5 mr-1.5" />
                                                Add Indicator
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

							<TabsContent value="questions" className="p-4 space-y-3">
								<Suspense fallback={<QuestionsListSkeleton />}>
									{questions.length > 0 ? (
										<QuestionsList questions={questions} />
									) : (
										<div className="text-center py-6 sm:py-8">
											<div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-full flex items-center justify-center mb-3">
												<FilePen className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
											</div>
											<h3 className="text-sm sm:text-base font-medium text-foreground mb-1">
												No Assessment Questions
											</h3>
											<p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto mb-4 px-4">
												Questions help evaluate behavioral indicators.
											</p>
												<Button variant="outline" size="sm" asChild>
													<Link href="/hr/assessment-questions">
														<FilePen className="h-3.5 w-3.5 mr-1.5" />
														Browse Questions
													</Link>
												</Button>
										</div>
									)}
								</Suspense>
							</TabsContent>
						</Tabs>
					</Card>
				</div>

				{/* Details Card */}
				<div className="space-y-4">
					<Card className="border-none shadow-sm bg-muted/30">
						<CardHeader className="p-4 pb-2">
							<CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
								<div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
									<Info className="w-3 h-3 text-blue-600 dark:text-blue-400" />
								</div>
								Details
							</CardTitle>
						</CardHeader>
						<CardContent className="p-4 pt-0 space-y-0">
							{/* Category */}
							<div className="flex items-center justify-between py-1.5 border-b border-border/40">
								<span className="text-xs text-muted-foreground">Category</span>
								<span className="text-xs font-medium text-foreground">{competency.category}</span>
							</div>
							
							{/* Level */}
							<div className="flex items-center justify-between py-1.5 border-b border-border/40">
								<span className="text-xs text-muted-foreground">Level</span>
								<Badge 
									variant="secondary" 
									className={`${levelToColor(competency.level)} text-xs h-5 px-1.5`}
								>
									{competency.level}
								</Badge>
							</div>
							
							{/* Approval Status */}
							<div className="flex items-center justify-between py-1.5 border-b border-border/40">
								<span className="text-xs text-muted-foreground">Approval</span>
								<Badge 
									variant="secondary" 
									className={`${approvalStatusToColor(competency.approvalStatus)} text-xs h-5 px-1.5`}
								>
									{competency.approvalStatus.replace("_", " ")}
								</Badge>
							</div>
							
							{/* Status */}
							<div className="flex items-center justify-between py-1.5 border-b border-border/40">
								<span className="text-xs text-muted-foreground">Status</span>
								<Badge 
									variant={competency.isActive ? "default" : "secondary"}
									className="text-xs h-5 px-1.5"
								>
									<div className={`w-1.5 h-1.5 rounded-full mr-1 ${competency.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
									{competency.isActive ? "Active" : "Inactive"}
								</Badge>
							</div>
							
							{/* Version */}
							<div className="flex items-center justify-between py-1.5">
								<span className="text-xs text-muted-foreground">Version</span>
								<span className="font-mono text-xs text-foreground bg-muted px-1.5 py-0.5 rounded">
									v{competency.version}
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Weight Distribution Chart - Only show if there are indicators */}
					{competency.behavioralIndicators && competency.behavioralIndicators.length > 0 && (
						<Card className="border-none shadow-sm bg-muted/30">
							<CardHeader className="p-4 pb-2">
								<CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
									<div className="p-1 rounded-md bg-purple-100 dark:bg-purple-900/30">
										<BarChart3 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
									</div>
									Weight Distribution
								</CardTitle>
							</CardHeader>
							<CardContent className="p-4 pt-0">
								<div className="space-y-2.5">
									{competency.behavioralIndicators.map((indicator, index) => {
										const totalWeight = competency.behavioralIndicators?.reduce((sum, i) => sum + i.weight, 0) || 1;
										const percentage = (indicator.weight / totalWeight) * 100;
										
										// Generate distinct colors for each indicator
										const hue = (index * 360 / competency.behavioralIndicators!.length) % 360;
										const color = `hsl(${hue}, 65%, 55%)`;
										
										return (
											<div key={indicator.id} className="space-y-1.5 group">
												<div className="flex justify-between items-center gap-2">
													<div className="flex items-center gap-2 flex-1 min-w-0">
														<div 
															className="w-2 h-2 rounded-full shrink-0"
															style={{ backgroundColor: color }}
														/>
														<span className="text-xs truncate">
															{indicator.title}
														</span>
													</div>
													<span className="text-xs text-muted-foreground font-mono shrink-0">
														{percentage.toFixed(0)}%
													</span>
												</div>
												<div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
													<div
														className="h-full rounded-full transition-all duration-500"
														style={{
															width: `${Math.max(percentage, 3)}%`,
															backgroundColor: color,
														}}
													/>
												</div>
											</div>
										);
									})}
									
									{/* Summary */}
									<div className="pt-2 mt-2 border-t border-border/40">
										<div className="flex justify-between text-xs text-muted-foreground">
											<span>{competency.behavioralIndicators.length} indicators</span>
											<span className="font-mono">Σ {(competency.behavioralIndicators.reduce((sum, i) => sum + i.weight, 0)).toFixed(2)}</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
			</CompetencyDetailClient>
		</EntityDetailLayout>
	);
}



function IndicatorCard({
	indicator,
}: {
	indicator: BehavioralIndicator;
}) {
	return (
		<div className="group relative flex items-center gap-2.5 p-2.5 rounded-lg border border-border/40 bg-background/50 hover:bg-background hover:border-primary/30 transition-all duration-150">
			{/* Color accent bar */}
			<div className="w-1 h-6 bg-primary/20 group-hover:bg-primary/50 rounded-full shrink-0 transition-colors" />
			
			{/* Main content */}
			<div className="flex-1 min-w-0 flex items-center gap-2">
				<h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
					{indicator.title}
				</h3>
				<Badge 
					variant="secondary"
					className={`text-[10px] h-4 px-1 shrink-0 ${
						indicator.observabilityLevel === ProficiencyLevel.EXPERT ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 
						indicator.observabilityLevel === ProficiencyLevel.ADVANCED ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
						indicator.observabilityLevel === ProficiencyLevel.PROFICIENT ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 
						'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
					}`}
				>
					{indicator.observabilityLevel}
				</Badge>
			</div>
			
			{/* Right side: Weight + Actions */}
			<div className="flex items-center gap-1.5 shrink-0">
				<span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
					{indicator.weight}
				</span>
				
				{/* Action buttons */}
				<div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
					<Button 
						variant="ghost" 
						size="icon" 
						asChild 
						className="h-5 w-5 hover:bg-primary/10"
					>
						<Link href={`/hr/behavioral-indicators/${indicator.id}`} title="View">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
								<circle cx="12" cy="12" r="3"/>
							</svg>
						</Link>
					</Button>
					<Button 
						variant="ghost" 
						size="icon" 
						asChild 
						className="h-5 w-5 hover:bg-primary/10"
					>
						<Link href={`/hr/behavioral-indicators/${indicator.id}/edit`} title="Edit">
							<Edit className="h-3 w-3" />
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
