import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - SkillSoft",
  description: "Sign in to your SkillSoft account to manage competencies and assessments.",
};

/**
 * Auth Layout
 * 
 * Minimal layout for authentication pages (sign-in, sign-up).
 * No sidebar, no LensProvider - just centered auth UI.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
      <div className="w-full max-w-md p-4">
        {children}
      </div>
    </div>
  );
}
