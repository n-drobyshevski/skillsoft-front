import { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import AddUserForm from "./AddUserForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.users');
  return {
    title: `${t('newTitle')} - SkillSoft`,
    description: t('newDescription'),
  };
}

/**
 * Add New User Page
 *
 * Server component that handles authorization and renders the user creation form.
 * Only accessible to ADMIN users.
 */
export default async function NewUserPage() {
  // Check auth
  const authResult = await auth();
  const { userId, orgRole } = authResult;
  const t = await getTranslations('users.new');

  if (!userId) {
    redirect("/sign-in");
  }

  // Only admins can create users
  const isAdmin = orgRole === "org:admin";
  if (!isAdmin) {
    redirect("/users");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:gap-6 md:p-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
      >
        <Link href="/users">
          <Button variant="outline" className="gap-2 h-9">
            <ArrowLeft className="h-4 w-4" />
            {t('backToUsers')}
          </Button>
        </Link>
      </PageHeader>

      <div className="mx-auto w-full max-w-3xl">
        <Suspense fallback={<FormSkeleton />}>
          <AddUserForm />
        </Suspense>
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Account Credentials */}
      <div className="rounded-lg border bg-card p-4 animate-pulse">
        <div className="h-5 w-40 bg-muted rounded mb-1" />
        <div className="h-4 w-56 bg-muted rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="h-9 bg-muted rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-9 bg-muted rounded" />
          </div>
        </div>
      </div>
      
      {/* Profile & Permissions */}
      <div className="rounded-lg border bg-card p-4 animate-pulse">
        <div className="h-5 w-44 bg-muted rounded mb-1" />
        <div className="h-4 w-48 bg-muted rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-9 bg-muted rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-9 bg-muted rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-12 bg-muted rounded" />
            <div className="h-9 bg-muted rounded" />
          </div>
        </div>
      </div>
      
      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <div className="h-9 w-20 bg-muted rounded" />
        <div className="h-9 w-28 bg-muted rounded" />
      </div>
    </div>
  );
}
