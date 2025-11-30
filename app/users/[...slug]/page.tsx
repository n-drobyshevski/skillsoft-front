import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string[] }>;
}

/**
 * Redirect from old /users/* routes to new /admin/users/*
 */
export default async function UsersRedirect({ params }: Props) {
  const { slug } = await params;
  const path = slug ? slug.join("/") : "";
  redirect(`/admin/users/${path}`);
}
