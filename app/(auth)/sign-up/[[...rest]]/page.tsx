import { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { SignUpForm } from "../../_components/SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up - SkillSoft",
  description: "Create your SkillSoft account to start managing competencies and skills effectively.",
};

function SignUpSkeleton() {
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
 * Dynamic sign-up content that requires request-time data
 */
async function SignUpContent() {
  // Signal that this component needs request-time data
  await connection();
  return <SignUpForm />;
}

/**
 * Sign Up Page
 * 
 * Server component that renders a client-side auth form.
 * The SignUpForm is a client component to avoid SSR issues with Clerk.
 * Uses connection() inside Suspense for Next.js 16 cacheComponents compatibility.
 */
export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpSkeleton />}>
      <SignUpContent />
    </Suspense>
  );
}
