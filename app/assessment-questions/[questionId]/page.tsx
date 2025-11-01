import { notFound } from "next/navigation";
import { assessmentQuestionsApi } from "@/services/api";
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
	Type
} from "lucide-react";
import QuestionHeader from "./components/question-header";
interface QuestionDetailPageProps {
	params: { questionId: string };
}

async function getQuestionData(questionId: string) {
	const question = await assessmentQuestionsApi.getQuestionById(questionId);
	return question;
}


export default async function Page({ params }: QuestionDetailPageProps) {
	const { questionId } = await params;
	const question = await getQuestionData(questionId);



	if (!question) {
		notFound();
	}


	return (
		<div className="container mx-auto px-6 py-8">
			<QuestionHeader 
				questionId={question.id}
				questionText={question.questionText}
				difficultyLevel={question.difficultyLevel}
				isActive={question.isActive}
			/>

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
				</div>

				<div className="space-y-6">
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
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
