import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { ClerkProvider } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import WorkspaceShell from "./_components/WorkspaceShell";

/**
 * Sidebar skeleton shown as part of the PPR static shell
 */
function SidebarSkeleton() {
  return (
    <div className="hidden md:flex w-[15rem] border-r bg-sidebar flex-col">
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>
      <div className="flex-1 p-4 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Header skeleton shown as part of the PPR static shell
 */
function HeaderSkeleton() {
  return (
    <header className="h-14 border-b flex items-center px-4 gap-4">
      <Skeleton className="h-8 w-8 md:hidden" />
      <Skeleton className="h-6 w-32" />
      <div className="flex-1" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </header>
  );
}

/**
 * Content skeleton for initial page load
 */
function ContentSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/**
 * Full workspace skeleton - used as PPR static shell / Suspense fallback
 */
function WorkspaceSkeleton() {
  return (
    <div className="flex min-h-screen">
      <SidebarSkeleton />
      <div className="flex flex-1 flex-col">
        <HeaderSkeleton />
        <main className="flex flex-1 flex-col">
          <ContentSkeleton />
        </main>
      </div>
    </div>
  );
}

/**
 * Server-side auth gate.
 *
 * auth() is a dynamic API that reads request data (cookies/headers).
 * It MUST be inside <Suspense> for PPR compatibility.
 *
 * The proxy.ts already handles redirects for unauthenticated users at the
 * middleware level. This AuthGate is defense-in-depth for edge cases
 * (e.g., expired session during client-side navigation).
 */
async function AuthGate({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}

/**
 * Workspace Layout (Server Component)
 *
 * Layout for all authenticated workspace routes.
 * Includes sidebar, header, and lens context for role-based views.
 *
 * PPR Strategy:
 * - WorkspaceSkeleton is the static shell (sidebar, header, content placeholders)
 * - AuthGate checks auth server-side (dynamic, deferred via Suspense)
 * - ClerkProvider dynamic provides runtime auth context to client components
 *   (useAuth, useUser hooks in sidebar, header, LensInitializer)
 * - WorkspaceShell handles client-side providers and interactive layout
 *
 * @see https://clerk.com/docs/guides/development/rendering-modes
 */
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <AuthGate>
        <ClerkProvider dynamic>
          <WorkspaceShell>
            {children}
          </WorkspaceShell>
        </ClerkProvider>
      </AuthGate>
    </Suspense>
  );
}
