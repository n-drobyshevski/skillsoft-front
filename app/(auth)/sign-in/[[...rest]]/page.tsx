import { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { SignInForm } from "../../_components/SignInForm";

export const metadata: Metadata = {
  title: "Sign In - SkillSoft",
  description: "Sign in to your SkillSoft account to access the competency management platform.",
};

function SignInSkeleton() {
  return (
    <div className="w-full max-w-md space-y-6 animate-pulse">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-lg bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-7 bg-muted rounded w-40 mx-auto" />
          <div className="h-4 bg-muted rounded w-64 mx-auto" />
        </div>
      </div>
      <div className="border border-border rounded-lg shadow-none">
        <div className="px-4 sm:px-6 py-6 space-y-4">
          <div className="h-11 bg-muted rounded-md" />
          <div className="h-px bg-border" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-9 bg-muted rounded-md" />
          </div>
          <div className="h-11 bg-muted rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Dynamic sign-in content that requires request-time data
 */
async function SignInContent() {
  // Signal that this component needs request-time data
  await connection();
  return <SignInForm />;
}

/**
 * Sign In Page
 * 
 * Server component that renders a client-side auth form.
 * The SignInForm is a client component to avoid SSR issues with Clerk.
 * Uses connection() inside Suspense for Next.js 16 cacheComponents compatibility.
 */
export default function SignInPage() {
  return (
    <Suspense fallback={<SignInSkeleton />}>
      <SignInContent />
    </Suspense>
  );
}
