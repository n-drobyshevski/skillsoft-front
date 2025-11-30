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
	params: { competencyId: string };
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
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm bg-muted/30">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-medium flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                    <FilePen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
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

                            <TabsContent value="indicators" className="p-6 space-y-4">
                                {competency.behavioralIndicators &&
                                competency.behavioralIndicators.length > 0 ? (
                                    <>
                                        {/* Header with count and add button */}
                                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-medium text-muted-foreground">
                                                    Behavioral Indicators
                                                </h4>
                                                <Badge variant="secondary" className="text-xs">
                                                    {competency.behavioralIndicators.length}
                                                </Badge>
                                            </div>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/behavioral-indicators/new?competencyId=${competency.id}`}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Indicator
                                                </Link>
                                            </Button>
                                        </div>
                                        
                                        {/* Indicators list */}
                                        <div className="space-y-2">	
                                            {competency.behavioralIndicators.map((indicator) => (
                                                <IndicatorCard key={indicator.id} indicator={indicator} />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8 sm:py-12">
                                        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
                                            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
                                            No Behavioral Indicators
                                        </h3>
                                        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-4 sm:mb-6 px-4 leading-relaxed">
                                            This competency doesn&apos;t have any behavioral indicators yet.
                                            Add some to start defining what success looks like.
                                        </p>
                                        <Button variant="outline" asChild className="touch-target">
                                            <Link href={`/behavioral-indicators/new?competencyId=${competency.id}`}>
                                                <Target className="h-4 w-4 mr-2" />
                                                Add Indicator
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

							<TabsContent value="questions" className="p-6 space-y-4">
								<Suspense fallback={<QuestionsListSkeleton />}>
									{questions.length > 0 ? (
										<QuestionsList questions={questions} />
									) : (
										<div className="text-center py-8 sm:py-12">
											<div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
												<FilePen className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
											</div>
											<h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
												No Assessment Questions
											</h3>
											<p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-4 sm:mb-6 px-4 leading-relaxed">
												This competency doesn&apos;t have any assessment questions yet.
												Questions help evaluate behavioral indicators.
											</p>
											<Button variant="outline" asChild className="touch-target">
												<Link href="/assessment-questions">
													<FilePen className="h-4 w-4 mr-2" />
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
				<div className="space-y-6">
					<Card className="border-none shadow-sm bg-muted/30">
						<CardHeader className="pb-4">
							<CardTitle className="text-base font-medium flex items-center gap-2.5 text-foreground">
								<div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
									<Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
								</div>
								Details
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-0 space-y-4">
							{/* Category */}
							<div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
								<span className="text-sm text-muted-foreground font-medium">Category</span>
								<span className="text-sm font-medium text-foreground">{competency.category}</span>
							</div>
							
							{/* Level */}
							<div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
								<span className="text-sm text-muted-foreground font-medium">Proficiency Level</span>
								<Badge 
									variant="secondary" 
									className={`${levelToColor(competency.level)} font-medium text-xs px-2.5 py-1`}
								>
									{competency.level}
								</Badge>
							</div>
							
							{/* Approval Status */}
							<div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
								<span className="text-sm text-muted-foreground font-medium">Approval Status</span>
								<Badge 
									variant="secondary" 
									className={`${approvalStatusToColor(competency.approvalStatus)} font-medium text-xs px-2.5 py-1`}
								>
									{competency.approvalStatus.replace("_", " ")}
								</Badge>
							</div>
							
							{/* Status */}
							<div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
								<span className="text-sm text-muted-foreground font-medium">Status</span>
								<Badge 
									variant={competency.isActive ? "default" : "secondary"}
									className="font-medium text-xs px-2.5 py-1"
								>
									<div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${competency.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
									{competency.isActive ? "Active" : "Inactive"}
								</Badge>
							</div>
							
							{/* Version */}
							<div className="flex items-center justify-between py-2">
								<span className="text-sm text-muted-foreground font-medium">Version</span>
								<span className="font-mono font-medium text-foreground bg-muted px-2 py-0.5 rounded text-xs">
									v{competency.version}
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Weight Distribution Chart - Only show if there are indicators */}
					{competency.behavioralIndicators && competency.behavioralIndicators.length > 0 && (
						<Card className="border-none shadow-sm bg-muted/30">
							<CardHeader className="pb-3">
								<CardTitle className="text-base font-medium flex items-center gap-2.5 text-foreground">
									<div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
										<BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
									</div>
									Weight Distribution
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="space-y-3.5">
									{competency.behavioralIndicators.map((indicator, index) => {
										const totalWeight = competency.behavioralIndicators?.reduce((sum, i) => sum + i.weight, 0) || 1;
										const percentage = (indicator.weight / totalWeight) * 100;
										
										// Generate distinct colors for each indicator
										const hue = (index * 360 / competency.behavioralIndicators!.length) % 360;
										const color = `hsl(${hue}, 65%, 55%)`;
										
										return (
											<div key={indicator.id} className="space-y-2.5 group">
												<div className="flex justify-between items-start gap-3">
													<div className="flex items-center gap-2.5 flex-1 min-w-0">
														<div 
															className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-background/50"
															style={{ backgroundColor: color }}
														/>
														<div className="flex-1 min-w-0">
															<div className="text-sm font-medium truncate group-hover:text-foreground transition-colors leading-tight">
																{indicator.title}
															</div>
															<div className="text-xs text-muted-foreground mt-0.5 font-medium">
																Weight: {indicator.weight}
															</div>
														</div>
													</div>
													<Badge variant="secondary" className="text-xs whitespace-nowrap font-medium px-2 py-1 bg-muted">
														{percentage.toFixed(1)}%
													</Badge>
												</div>
												<div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden group-hover:bg-muted transition-colors">
													<div
														className="h-full rounded-full transition-all duration-700 ease-out hover:brightness-110"
														style={{
															width: `${Math.max(percentage, 3)}%`,
															backgroundColor: color,
															boxShadow: `0 0 6px ${color}20`,
														}}
													/>
												</div>
											</div>
										);
									})}
									
									{/* Summary */}
									<div className="pt-3 mt-4 border-t border-border/60">
										<div className="flex justify-between text-xs text-muted-foreground font-medium">
											<span>Total indicators: {competency.behavioralIndicators.length}</span>
											<span>Total weight: {(competency.behavioralIndicators.reduce((sum, i) => sum + i.weight, 0)).toFixed(3)}</span>
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
		<Card className="group relative bg-background/50 border-border/50 hover:bg-background hover:border-primary/40 hover:shadow-sm transition-all duration-200 overflow-hidden">
			<CardContent className="p-0">
				{/* Main content area */}
				<div className="flex items-center gap-3 p-4 min-h-[60px]">
					{/* Status indicator dot */}
					<div className="flex items-center gap-3 flex-1 min-w-0">
						<div className="w-2 h-8 bg-primary/20 group-hover:bg-primary/60 rounded-full transition-colors duration-200 shrink-0" />
						
						{/* Content */}
						<div className="flex-1 min-w-0 space-y-1">
							{/* Title and level on same line */}
							<div className="flex items-center gap-2 mb-1">
								<h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
									{indicator.title}
								</h3>
								<Badge 
									variant="secondary"
									className={`text-xs px-1.5 py-0.5 font-medium shrink-0 ${
										indicator.observabilityLevel === ProficiencyLevel.EXPERT ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 
										indicator.observabilityLevel === ProficiencyLevel.ADVANCED ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
										indicator.observabilityLevel === ProficiencyLevel.PROFICIENT ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 
										'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
									}`}
								>
									{indicator.observabilityLevel}
								</Badge>
							</div>
							
							{/* Description if exists */}
							{indicator.description && (
								<p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
									{indicator.description}
								</p>
							)}
						</div>
						
						{/* Weight and actions on the right */}
						<div className="flex items-center gap-2 shrink-0">
							{/* Weight badge */}
							<div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">
								{indicator.weight}
							</div>
							
							{/* Action buttons - only visible on hover */}
							<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
								<Button 
									variant="ghost" 
									size="sm" 
									asChild 
									className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary"
								>
									<Link href={`/behavioral-indicators/${indicator.id}`} title="View Details">
										<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
											<circle cx="12" cy="12" r="3"/>
										</svg>
									</Link>
								</Button>
								<Button 
									variant="ghost" 
									size="sm" 
									asChild 
									className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary"
								>
									<Link href={`/behavioral-indicators/${indicator.id}/edit`} title="Edit">
										<Edit className="h-3 w-3" />
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
				
				{/* Hover effect overlay */}
				<div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
			</CardContent>
		</Card>
	);
}
