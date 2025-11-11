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
} from "lucide-react";
import { Suspense } from 'react';

import QuestionsList from './components/QuestionsList';
import { EntityDetailLayout } from '../../components/EntityDetailLayout';
import CompetencyDetailClient from './components/CompetencyDetailClient';

import QuestionsListSkeleton from './components/QuestionsListSkeleton';
import type {
	BehavioralIndicator,
	AssessmentQuestion,
} from "../../interfaces/domain-interfaces";
import { ProficiencyLevel } from "../../enums/domain_enums";
import { levelToColor, approvalStatusToColor } from "../../utils";

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
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FilePen className="w-5 h-5" />
                                Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
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
                                    <><div className="flex justify-end">
                                            <Button asChild>
                                                <Link href={`/behavioral-indicators/new?competencyId=${competency.id}`}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Indicator
                                                </Link>
                                            </Button>
                                        </div><div className="space-y-3">	
                                            {competency.behavioralIndicators.map((indicator) => (
                                                <IndicatorCard key={indicator.id} indicator={indicator} />
                                            ))}
                                        </div></>
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
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Info className="w-5 h-5" />
								Details
							</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-1">
								<div className="font-semibold text-muted-foreground">Category</div>
								<div>{competency.category}</div>
							</div>
							<div className="grid gap-1">
								<div className="font-semibold text-muted-foreground">Level</div>
								<Badge variant="outline" className={levelToColor(competency.level)}>{competency.level}</Badge>
							</div>
							<div className="grid gap-1">
								<div className="font-semibold text-muted-foreground">Approval Status</div>
								<Badge variant="outline" className={approvalStatusToColor(competency.approvalStatus)}>{competency.approvalStatus.replace("_", " ")}</Badge>
							</div>
							<div className="grid gap-1">
								<div className="font-semibold text-muted-foreground">Status</div>
								<Badge variant={competency.isActive ? "default" : "secondary"}>
									{competency.isActive ? "Active" : "Inactive"}
								</Badge>
							</div>
							<div className="grid gap-1">
								<div className="font-semibold text-muted-foreground">Version</div>
								<div>v{competency.version}</div>
							</div>
						</CardContent>
					</Card>
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
		<Card className="bg-card shadow-sm border border-border hover:shadow-md transition-all duration-200 hover:border-border/80 p-4">
			<div className="flex items-start justify-between gap-3">
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-2 mb-2">
						<h3 className="text-sm font-medium text-foreground line-clamp-1">
							{indicator.title}
						</h3>
						<div className="flex gap-1 shrink-0">
							<Badge 
								variant={indicator.observabilityLevel === ProficiencyLevel.EXPERT ? 'default' : 
								         indicator.observabilityLevel === ProficiencyLevel.ADVANCED ? 'secondary' :
								         indicator.observabilityLevel === ProficiencyLevel.PROFICIENT ? 'secondary' : 'outline'} 
								className="text-xs px-2 py-0.5"
							>
								{indicator.observabilityLevel}
							</Badge>
							<Badge variant="outline" className="text-xs px-2 py-0.5">
								W: {indicator.weight}
							</Badge>
						</div>
					</div>
					
					{indicator.description && (
						<p className="text-xs text-muted-foreground line-clamp-2 mb-3">
							{indicator.description}
						</p>
					)}
					
					<div className="flex gap-2">
						<Button 
							variant="ghost" 
							size="sm" 
							asChild 
							className="h-7 px-2 text-xs hover:bg-muted"
						>
							<Link href={`/behavioral-indicators/${indicator.id}`}>
								View
							</Link>
						</Button>
						<Button 
							variant="ghost" 
							size="sm" 
							asChild 
							className="h-7 px-2 text-xs hover:bg-muted"
						>
							<Link href={`/behavioral-indicators/${indicator.id}/edit`}>
								<Edit className="h-3 w-3 mr-1" />
								Edit
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
}
