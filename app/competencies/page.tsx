import { redirect } from "next/navigation";

/**
 * Redirect from old /competencies route to new /hr/competencies
 */
export default function CompetenciesRedirect() {
  redirect("/hr/competencies");
}
