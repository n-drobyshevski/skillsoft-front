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
    <div className="w-full max-w-md mx-auto animate-pulse">
      <div className="bg-background border border-border rounded-lg shadow-sm p-6 space-y-4">
        <div className="h-6 bg-muted rounded w-1/3"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
        <div className="space-y-3 mt-6">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
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
