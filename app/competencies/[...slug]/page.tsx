import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string[] }>;
}

/**
 * Redirect from old /competencies/* routes to new /hr/competencies/*
 */
export default async function CompetenciesRedirect({ params }: Props) {
  const { slug } = await params;
  const path = slug ? slug.join("/") : "";
  redirect(`/hr/competencies/${path}`);
}
