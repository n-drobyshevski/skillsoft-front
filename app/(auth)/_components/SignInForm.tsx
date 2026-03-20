"use client";

import { useSignIn, useAuth } from "@clerk/nextjs";
import type { OAuthStrategy } from "@clerk/types";
import { LogIn, Loader2 } from "lucide-react";
import { useState, useCallback, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Step = "start" | "password" | "email_code";

/**
 * Custom sign-in form using Clerk's useSignIn() hook
 * with shadcn/ui components for document-mode design consistency.
 */
export function SignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("start");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const clearErrors = useCallback(() => {
    setError("");
    setFieldErrors({});
  }, []);

  const handleOAuth = useCallback(
    async (strategy: OAuthStrategy) => {
      if (!isLoaded || !signIn) return;
      setOauthLoading(true);
      clearErrors();
      try {
        await signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: "/sign-in/sso-callback",
          redirectUrlComplete: "/dashboard",
        });
      } catch (err: unknown) {
        setOauthLoading(false);
        const clerkErr = err as { errors?: Array<{ message: string }> };
        setError(clerkErr.errors?.[0]?.message ?? "OAuth sign-in failed");
      }
    },
    [isLoaded, signIn, clearErrors],
  );

  const handleEmailSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!isLoaded || !signIn) return;
      setLoading(true);
      clearErrors();
      try {
        const result = await signIn.create({ identifier: email });

        if (result.status === "needs_first_factor") {
          const factors = result.supportedFirstFactors ?? [];
          const hasPassword = factors.some(
            (f) => f.strategy === "password",
          );
          if (hasPassword) {
            setStep("password");
          } else {
            // Attempt email code
            await signIn.prepareFirstFactor({
              strategy: "email_code",
              emailAddressId: (
                factors.find((f) => f.strategy === "email_code") as
                  | { emailAddressId: string }
                  | undefined
              )?.emailAddressId ?? "",
            });
            setStep("email_code");
          }
        } else if (result.status === "complete" && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          window.location.href = "/dashboard";
        }
      } catch (err: unknown) {
        const clerkErr = err as {
          errors?: Array<{
            message: string;
            meta?: { paramName?: string };
          }>;
        };
        const firstErr = clerkErr.errors?.[0];
        if (firstErr?.meta?.paramName === "identifier") {
          setFieldErrors({ identifier: firstErr.message });
        } else {
          setError(firstErr?.message ?? "Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    },
    [isLoaded, signIn, setActive, email, clearErrors],
  );

  const handlePasswordSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!isLoaded || !signIn) return;
      setLoading(true);
      clearErrors();
      try {
        const result = await signIn.attemptFirstFactor({
          strategy: "password",
          password,
        });
        if (result.status === "complete" && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          window.location.href = "/dashboard";
        }
      } catch (err: unknown) {
        const clerkErr = err as {
          errors?: Array<{
            message: string;
            meta?: { paramName?: string };
          }>;
        };
        const firstErr = clerkErr.errors?.[0];
        if (firstErr?.meta?.paramName === "password") {
          setFieldErrors({ password: firstErr.message });
        } else {
          setError(firstErr?.message ?? "Invalid password");
        }
      } finally {
        setLoading(false);
      }
    },
    [isLoaded, signIn, setActive, password, clearErrors],
  );

  const handleCodeSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!isLoaded || !signIn) return;
      setLoading(true);
      clearErrors();
      try {
        const result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code,
        });
        if (result.status === "complete" && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          window.location.href = "/dashboard";
        }
      } catch (err: unknown) {
        const clerkErr = err as {
          errors?: Array<{
            message: string;
            meta?: { paramName?: string };
          }>;
        };
        const firstErr = clerkErr.errors?.[0];
        if (firstErr?.meta?.paramName === "code") {
          setFieldErrors({ code: firstErr.message });
        } else {
          setError(firstErr?.message ?? "Invalid code");
        }
      } finally {
        setLoading(false);
      }
    },
    [isLoaded, signIn, setActive, code, clearErrors],
  );

  const handleResendCode = useCallback(async () => {
    if (!isLoaded || !signIn) return;
    clearErrors();
    try {
      const factors = signIn.supportedFirstFactors ?? [];
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: (
          factors.find((f) => f.strategy === "email_code") as
            | { emailAddressId: string }
            | undefined
        )?.emailAddressId ?? "",
      });
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string }> };
      setError(clerkErr.errors?.[0]?.message ?? "Failed to resend code");
    }
  }, [isLoaded, signIn, clearErrors]);

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isSignedIn, router]);

  if (!isLoaded || isSignedIn) {
    return <SignInSkeleton />;
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to your SkillSoft account to continue
          </p>
        </div>
      </div>

      {/* Sign-in card — document mode */}
      <Card className="gap-0 py-0 rounded-lg shadow-none">
        <CardContent className="py-6">
          {/* Global error */}
          {error && (
            <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === "start" && (
            <div className="space-y-4">
              {/* Google OAuth */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuth("oauth_google")}
                disabled={oauthLoading}
              >
                {oauthLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </Button>

              {/* Divider */}
              <div className="relative flex items-center">
                <Separator className="flex-1" />
                <span className="px-3 text-xs text-muted-foreground bg-card">
                  or
                </span>
                <Separator className="flex-1" />
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Email or username</Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="you@example.com or username"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!fieldErrors.identifier}
                    required
                  />
                  {fieldErrors.identifier && (
                    <p className="text-destructive text-xs mt-1">
                      {fieldErrors.identifier}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  Continue
                </Button>
              </form>

              {/* Sign-up link */}
              <p className="text-sm text-center text-muted-foreground">
                Don&apos;t have an account?{" "}
                <a
                  href="/sign-up"
                  className="text-primary hover:text-primary/80 underline-offset-4 hover:underline"
                >
                  Sign up
                </a>
              </p>
            </div>
          )}

          {step === "password" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Signing in as{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!fieldErrors.password}
                    required
                  />
                  {fieldErrors.password && (
                    <p className="text-destructive text-xs mt-1">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  Sign in
                </Button>
              </form>

              <Button
                variant="link"
                className="w-full text-muted-foreground"
                onClick={() => {
                  setStep("start");
                  setPassword("");
                  clearErrors();
                }}
              >
                Use another method
              </Button>
            </div>
          )}

          {step === "email_code" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  We sent a code to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification code</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter code"
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    aria-invalid={!!fieldErrors.code}
                    required
                  />
                  {fieldErrors.code && (
                    <p className="text-destructive text-xs mt-1">
                      {fieldErrors.code}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  Verify
                </Button>
              </form>

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendCode}
                  className="text-muted-foreground"
                >
                  Resend code
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setStep("start");
                    setCode("");
                    clearErrors();
                  }}
                  className="text-muted-foreground"
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground">
        <p>
          By signing in, you agree to our{" "}
          <a
            href="#"
            className="text-primary hover:text-primary/80 underline-offset-4 hover:underline"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-primary hover:text-primary/80 underline-offset-4 hover:underline"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

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
      <Card className="gap-0 py-0 rounded-lg shadow-none">
        <CardContent className="py-6 space-y-4">
          <div className="h-11 bg-muted rounded-md" />
          <div className="h-px bg-border" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-9 bg-muted rounded-md" />
          </div>
          <div className="h-11 bg-muted rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
