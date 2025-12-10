"use client";

import { SignIn } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Client-side Sign In form wrapper
 * Isolates Clerk's dynamic data access to client-side rendering
 */
export function SignInForm() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        "text-muted-foreground text-xs bg-background px-2",
      
      // Clean footer links
      footerActionLink: 
        "text-primary hover:text-primary/80 text-sm",
      footerAction: 
        "text-muted-foreground text-sm",
      
      // Identity preview
      identityPreview: 
        "bg-muted/30 border border-border rounded-md p-3",
      identityPreviewText: 
        "text-foreground text-sm",
      identityPreviewEditButton: 
        "text-primary hover:text-primary/80 text-sm",
      
      // Alert styling
      alert: 
        "bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-3 text-sm",
      alertText:
        "text-destructive text-sm",
        
      // Loading states
      spinner:
        "text-primary",
        
      // Form field errors
      formFieldError:
        "text-destructive text-xs mt-1",
      formFieldErrorText:
        "text-destructive text-xs",
        
      // OTP inputs
      otpCodeFieldInput:
        "bg-background border border-border rounded-md w-12 h-12 text-center text-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20",
    },
    layout: {
      socialButtonsPlacement: "bottom" as const,
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
        <div className="flex justify-center min-h-[400px]">
          {mounted ? (
            <SignIn 
              appearance={appearance}
              routing="path"
              path="/sign-in"
              fallbackRedirectUrl="/dashboard"
              signUpUrl="/sign-up"
            />
          ) : (
            <div className="w-full h-[400px] bg-muted/10 rounded-lg animate-pulse" />
          )}
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
