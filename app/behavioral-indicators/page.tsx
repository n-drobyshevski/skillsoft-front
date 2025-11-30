import { redirect } from "next/navigation";

/**
 * Redirect from old /behavioral-indicators route to new /hr/behavioral-indicators
 */
export default function BehavioralIndicatorsRedirect() {
  redirect("/hr/behavioral-indicators");
}
