import { redirect } from "next/navigation";

/**
 * Redirect from old /assessment-questions route to new /hr/assessment-questions
 */
export default function AssessmentQuestionsRedirect() {
  redirect("/hr/assessment-questions");
}
