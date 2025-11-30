import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string[] }>;
}

/**
 * Redirect from old /behavioral-indicators/* routes to new /hr/behavioral-indicators/*
 */
export default async function BehavioralIndicatorsRedirect({ params }: Props) {
  const { slug } = await params;
  const path = slug ? slug.join("/") : "";
  redirect(`/hr/behavioral-indicators/${path}`);
}
