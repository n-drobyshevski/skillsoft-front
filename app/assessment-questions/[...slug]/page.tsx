import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string[] }>;
}

/**
 * Redirect from old /assessment-questions/* routes to new /hr/assessment-questions/*
 */
export default async function AssessmentQuestionsRedirect({ params }: Props) {
  const { slug } = await params;
  const path = slug ? slug.join("/") : "";
  redirect(`/hr/assessment-questions/${path}`);
}
