import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";
import { LogIn } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In - SkillSoft",
  description: "Sign in to your SkillSoft account to access the competency management platform.",
};

export default function SignInPage() {
  // Modern flat design appearance - clean, minimal, compact
  const appearance = {
    elements: {
      // Main container - flat design principles
      rootBox: 
        "shadow-none border-0 bg-transparent",
      card: 
        "bg-background border border-border rounded-lg shadow-sm w-full max-w-md",
      
      // Clean typography hierarchy
      headerTitle: 
        "text-foreground text-xl font-semibold",
      headerSubtitle: 
        "text-muted-foreground text-sm mt-2",
      
      // Flat buttons - no gradients, minimal shadows
      formButtonPrimary: 
        "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 normal-case text-sm font-medium py-3 px-4 rounded-md border-0 w-full",
      
      formButtonSecondary: 
        "bg-background text-foreground hover:bg-muted transition-colors duration-200 normal-case text-sm font-medium py-3 px-4 rounded-md border border-border w-full",
      
      // Clean social buttons
      socialButtonsBlockButton: 
        "bg-background text-foreground border border-border hover:bg-muted transition-colors duration-200 text-sm font-medium py-3 px-4 rounded-md w-full",
      socialButtonsBlockButtonText: 
        "text-foreground font-medium",
      socialButtonsBlockButtonArrow:
        "text-muted-foreground",
      
      // Simple input styling
      formFieldInput: 
        "bg-background border border-border focus:border-primary hover:border-border/80 rounded-md px-3 py-3 text-sm transition-colors duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 w-full",
      formFieldLabel: 
        "text-foreground text-sm font-medium",
      formFieldLabelRow:
        "text-foreground text-sm font-medium",
      
      // Minimal divider
      dividerLine: 
        "bg-border",
      dividerText: 
        "text-muted-foreground text-xs font-medium px-4 bg-background",
      
      // Clean links
      footerActionLink: 
        "text-primary hover:text-primary/80 text-sm font-medium underline-offset-4 hover:underline transition-colors duration-200",
      footerActionText:
        "text-muted-foreground text-sm",
      
      // Simple error styling
      alertText: 
        "text-destructive text-sm",
      
      // Form structure
      form:
        "space-y-4",
      formFieldRow:
        "space-y-2",
      
      // Footer styling
      footer: 
        "text-center mt-6",
    },
    variables: {
      // Clean color system
      colorPrimary: "hsl(var(--primary))",
      colorBackground: "hsl(var(--background))",
      colorInputBackground: "hsl(var(--background))",
      colorInputText: "hsl(var(--foreground))",
      colorText: "hsl(var(--foreground))",
      colorTextSecondary: "hsl(var(--muted-foreground))",
      colorTextOnPrimaryBackground: "hsl(var(--primary-foreground))",
      colorDanger: "hsl(var(--destructive))",
      colorSuccess: "hsl(var(--primary))",
      colorNeutral: "hsl(var(--muted))",
      
      // Clean typography
      fontFamily: "inherit",
      fontSize: "0.875rem",
      
      // Minimal corner radius
      borderRadius: "0.375rem",
      spacingUnit: "1rem",
    },
    layout: {
      socialButtonsVariant: "blockButton" as const,
      socialButtonsPlacement: "top" as const,
      showOptionalFields: false,
    },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-4">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          {/* Title and description */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in to your SkillSoft account to continue
            </p>
          </div>
        </div>

        {/* Sign In Form */}
        <div className="flex justify-center">
          <SignIn 
            appearance={appearance}
            routing="path"
            path="/sign-in"
            afterSignInUrl="/dashboard"
            signUpUrl="/sign-up"
          />
        </div>
        
        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            By signing in, you agree to our{" "}
            <a href="#" className="text-primary hover:text-primary/80 underline-offset-4 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:text-primary/80 underline-offset-4 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
