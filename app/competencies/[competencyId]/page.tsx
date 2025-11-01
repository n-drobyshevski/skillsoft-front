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
	ArrowLeft,
	Plus,
    Info,
} from "lucide-react";
import { Suspense } from 'react';

import QuestionsList from './components/QuestionsList';

import QuestionsListSkeleton from './components/QuestionsListSkeleton';
import type {
	BehavioralIndicator,
	Competency,
	AssessmentQuestion,
} from "../../interfaces/domain-interfaces";
import { levelToColor, approvalStatusToColor, questionDifficultyToColor } from "../../utils";

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
		<div className="container mx-auto px-6 py-8">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" asChild>
                        <Link href="/competencies">
						    <ArrowLeft className="w-4 h-4" />
						    <span className="sr-only">Go back</span>
                        </Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							{competency.name}
						</h1>
						<div className="flex items-center gap-2 mt-2">
							<Badge
								variant="outline"
                                className={levelToColor(competency.level)}
							>
								{competency.level}
							</Badge>
							<Badge variant={competency.isActive ? "default" : "secondary"}>
								{competency.isActive ? "Active" : "Inactive"}
							</Badge>
                            <Badge
                                variant="outline"
                                className={approvalStatusToColor(competency.approvalStatus)}
                            >
                                {competency.approvalStatus.replace("_", " ")}
                            </Badge>
						</div>
					</div>
				</div>
				<Link href={`/competencies/${competency.id}/edit`} passHref>
					<Button>
						<Edit className="mr-2 h-4 w-4" />
						Edit
					</Button>
				</Link>
			</div>

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
                            {/* Tab Navigation */}
                            <div className="border-b border-border bg-muted/20">
                                <div className="px-4 sm:px-6">
                                    <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0 gap-0">
                                        <TabsTrigger
                                            value="indicators"
                                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3 sm:py-4 text-sm font-medium transition-all touch-target data-[state=active]:text-primary"
                                        >
                                            <span className="hidden sm:inline">
                                                Behavioral Indicators {competency.behavioralIndicators?.length ? `(${competency.behavioralIndicators.length})` : ''}
                                            </span>
                                            <span className="sm:hidden">
                                                Indicators {competency.behavioralIndicators?.length ? `(${competency.behavioralIndicators.length})` : ''}
                                            </span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="questions"
                                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3 sm:py-4 text-sm font-medium transition-all touch-target data-[state=active]:text-primary"
                                        >
                                            <span className="hidden sm:inline">
                                                Assessment Questions {questions.length > 0 && `(${questions.length})`}
                                            </span>
                                            <span className="sm:hidden">
                                                Questions {questions.length > 0 && `(${questions.length})`}
                                            </span>
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <TabsContent value="indicators" className="p-4 sm:p-6 space-y-4 sm:space-y-6 m-0 focus-visible:outline-none">
                                {competency.behavioralIndicators &&
                                competency.behavioralIndicators.length > 0 ? (
                                    <><div className="flex justify-end">
                                            <Button asChild>
                                                <Link href={`/behavioral-indicators/new?competencyId=${competency.id}`}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Indicator
                                                </Link>
                                            </Button>
                                        </div><div className="space-y-3 sm:space-y-4">	
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

                            

                            

                            

							<TabsContent value="questions" className="p-4 sm:p-6 space-y-4 sm:space-y-6 m-0 focus-visible:outline-none">

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

		</div>

	);

}



function IndicatorCard({

	indicator,

}: {

	indicator: BehavioralIndicator;

}) {

	return (

		<Card className="bg-card shadow-sm border border-border hover:shadow-md transition-all duration-200 hover:border-border/80">

			<CardHeader className="pb-3 sm:pb-4">

				<div className="flex flex-col space-y-3 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">

					<div className="flex-1 min-w-0">

						<CardTitle className="text-base sm:text-lg font-semibold text-foreground mb-2 line-clamp-2 leading-tight">

							{indicator.title}

						</CardTitle>

						<p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-none">

							{indicator.description}

						</p>

					</div>

					<div className="flex flex-row gap-2 lg:flex-col lg:items-end shrink-0">

						<Badge variant="outline" className="text-xs whitespace-nowrap">

							Weight: {indicator.weight}

						</Badge>

						<Badge variant="secondary" className="text-xs whitespace-nowrap">

							{indicator.observabilityLevel}

						</Badge>

					</div>

				</div>

			</CardHeader>



			<CardContent className="pt-0">

				<div className="border-t border-border pt-3 sm:pt-4">

					<div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">

						<Button 

							variant="outline" 

							size="sm" 

							asChild 

							className="flex-1 sm:flex-none touch-target transition-colors"

						>

							<Link href={`/behavioral-indicators/${indicator.id}`}>

								View Details

							</Link>

						</Button>

						<Button 

							variant="outline" 

							size="sm" 

							asChild 

							className="flex-1 sm:flex-none touch-target transition-colors"

						>

							<Link href={`/behavioral-indicators/${indicator.id}/edit`}>

								<Edit className="h-4 w-4 mr-2" />

								Edit

							</Link>

						</Button>

					</div>

				</div>

			</CardContent>

		</Card>

	);

}
