"use client";

import { useState } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LogIn, UserPlus } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";

interface AuthModalsProps {
  size?: "sm" | "default" | "lg";
  showLabels?: boolean;
  className?: string;
}

export function AuthModals({ size = "default", showLabels = false, className = "" }: AuthModalsProps) {
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const buttonSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "default";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-4 w-4";

  const appearance = {
    variables: {
      colorPrimary: "hsl(var(--primary))",
      // colorBackground: "hsl(var(--background))",
      colorInputBackground: "hsl(var(--background))",
      colorInputText: "hsl(var(--foreground))",
      colorText: "hsl(var(--foreground))",
      colorTextSecondary: "hsl(var(--muted-foreground))",
      colorTextOnPrimaryBackground: "hsl(var(--primary-foreground))",
      colorDanger: "hsl(var(--destructive))",
      fontFamily: "inherit",
      borderRadius: "0.375rem",
    },
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size={buttonSize}>
            <LogIn className={iconSize} />
            {showLabels && <span>Sign In</span>}
          </Button>
        </DialogTrigger>
        <DialogTitle></DialogTitle>
        <DialogContent className="p-0 border-0 shadow-none bg-transparent max-h-[95vh] overflow-y-auto w-fit">
          <SignIn
            appearance={appearance}
            routing="hash"
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={signUpOpen} onOpenChange={setSignUpOpen}>
        <DialogTrigger asChild>
          <Button size={buttonSize}>
            <UserPlus className={iconSize} />
            {showLabels && <span>Sign Up</span>}
          </Button>
        </DialogTrigger>
        <DialogTitle></DialogTitle>
        <DialogContent className="p-0 border-0 shadow-none bg-transparent  max-h-[95vh] overflow-y-auto w-fit">
          <SignUp
            appearance={appearance}
            routing="hash"
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CompactAuthModals() {
  return <AuthModals size="sm" showLabels={false} className="shrink-0" />;
}

export function FullAuthModals() {
  return <AuthModals size="default" showLabels={true} className="hidden md:flex" />;
}