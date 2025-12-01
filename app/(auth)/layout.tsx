import { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Sign In - SkillSoft",
  description: "Sign in to your SkillSoft account to manage competencies and assessments.",
};

function AuthSkeleton() {
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
 * Auth content wrapper that requires request-time data
 */
async function AuthContent({ children }: { children: React.ReactNode }) {
  // Signal that auth routes need request-time data (for Clerk)
  await connection();
  return <>{children}</>;
}

/**
 * Auth Layout
 * 
 * Minimal layout for authentication pages (sign-in, sign-up).
 * No sidebar, no LensProvider - just centered auth UI.
 * Uses connection() inside Suspense for Next.js 16 cacheComponents compatibility.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
      <div className="w-full max-w-md p-4">
        <Suspense fallback={<AuthSkeleton />}>
          <AuthContent>{children}</AuthContent>
        </Suspense>
      </div>
    </div>
  );
}
