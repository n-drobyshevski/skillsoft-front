import { Metadata } from "next";
import { SignInForm } from "../../_components/SignInForm";

export const metadata: Metadata = {
  title: "Sign In - SkillSoft",
  description: "Sign in to your SkillSoft account to access the competency management platform.",
};

/**
 * Sign In Page
 * 
 * Server component that renders a client-side auth form.
 * The SignInForm is a client component to avoid SSR issues with Clerk.
 */
export default function SignInPage() {
  return <SignInForm />;
}

