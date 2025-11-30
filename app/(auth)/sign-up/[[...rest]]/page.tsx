import { Metadata } from "next";
import { SignUpForm } from "../../_components/SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up - SkillSoft",
  description: "Create your SkillSoft account to start managing competencies and skills effectively.",
};

/**
 * Sign Up Page
 * 
 * Server component that renders a client-side auth form.
 * The SignUpForm is a client component to avoid SSR issues with Clerk.
 */
export default function SignUpPage() {
  return <SignUpForm />;
}
