"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  AtSign,
  Check,
} from "lucide-react";

// Validation schema - requires either email or username
const createUserSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)/,
      "Must contain letters and numbers"
    ),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["USER", "EDITOR", "ADMIN"]),
}).refine(
  (data) => (data.email && data.email.length > 0) || (data.username && data.username.length > 0),
  { message: "Provide at least one", path: ["email"] }
);

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserResponse {
  success: boolean;
  user?: {
    id: string;
    email?: string;
    username?: string;
    firstName?: string | null;
    lastName?: string | null;
    role?: string;
  };
  error?: string;
}

export default function AddUserForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    type: "success" | "error";
    message: string;
    userId?: string;
  } | null>(null);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "USER",
    },
    mode: "onChange", // Enable real-time validation
  });

  // Watch email and username for visual feedback
  const email = form.watch("email");
  const username = form.watch("username");
  const hasEmail = email && email.length > 0;
  const hasUsername = username && username.length > 0;
  const hasIdentifier = hasEmail || hasUsername;

  // Clear the "either required" error when one field is filled
  useEffect(() => {
    if (hasIdentifier) {
      form.clearErrors("email");
    }
  }, [hasIdentifier, form]);

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as CreateUserResponse;

      if (result.success && result.user) {
        const identifier = result.user.email || result.user.username || 'New user';
        setSubmitResult({
          type: "success",
          message: `User "${identifier}" created successfully.`,
          userId: result.user.id,
        });
        form.reset();

        setTimeout(() => {
          router.push("/users");
          router.refresh();
        }, 1500);
      } else {
        setSubmitResult({
          type: "error",
          message: result.error || "Failed to create user. Please try again.",
        });
      }
    } catch (error) {
      setSubmitResult({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Login Identifier - Email OR Username */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold leading-none tracking-tight">Login Identifier</h3>
                <p className="text-sm text-muted-foreground mt-1">Choose email, username, or both</p>
              </div>
              {hasIdentifier && (
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                  <Check className="h-3.5 w-3.5" />
                  Valid
                </div>
              )}
            </div>
          </div>
          <div className="px-4 pb-4">
            {/* Email and Username with OR divider */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      Email
                      {hasEmail && <Check className="h-3 w-3 text-emerald-500" />}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        className={`h-9 ${hasEmail ? 'border-emerald-300 focus-visible:ring-emerald-500' : ''}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* OR Divider */}
              <div className="flex md:flex-col items-center justify-center gap-2 py-2 md:py-0 md:px-2">
                <div className="h-px md:h-auto md:w-px flex-1 bg-border" />
                <span className="text-xs font-medium text-muted-foreground bg-card px-1">or</span>
                <div className="h-px md:h-auto md:w-px flex-1 bg-border" />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                      <AtSign className="h-3.5 w-3.5 text-muted-foreground" />
                      Username
                      {hasUsername && <Check className="h-3 w-3 text-emerald-500" />}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="johndoe"
                        className={`h-9 ${hasUsername ? 'border-emerald-300 focus-visible:ring-emerald-500' : ''}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Hint text */}
            {!hasIdentifier && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Enter at least one — user can log in with either
              </p>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-4 pb-3">
            <h3 className="text-lg font-semibold leading-none tracking-tight">Password</h3>
          </div>
          <div className="px-4 pb-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 characters with letters & numbers"
                        className="h-9 pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-9 w-9 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* User Profile & Role */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-4 pb-3">
            <h3 className="text-lg font-semibold leading-none tracking-tight">Profile & Permissions</h3>
          </div>
          <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" className="h-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" className="h-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USER">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-slate-400" />
                          User
                        </div>
                      </SelectItem>
                      <SelectItem value="EDITOR">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          Editor
                        </div>
                      </SelectItem>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                          Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Result Alert */}
        {submitResult && (
          <Alert
            variant={submitResult.type === "success" ? "default" : "destructive"}
            className={
              submitResult.type === "success"
                ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                : ""
            }
          >
            {submitResult.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {submitResult.type === "success" ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription>{submitResult.message}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/users")}
            disabled={isSubmitting}
            className="h-9"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-9">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
