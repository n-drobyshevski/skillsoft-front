import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { BarChart3, Users, Target, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard - SkillSoft",
  description: "Your SkillSoft dashboard - manage competencies, track progress, and develop skills.",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-4">
            <h1 className="font-semibold">SkillSoft Dashboard</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Welcome back!
            </h2>
            <p className="text-muted-foreground">
              Here's an overview of your competency management platform.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Competencies
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  Active competencies
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Indicators
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">
                  Behavioral indicators
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Questions
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">
                  Assessment questions
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Progress
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">
                  Overall completion
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <a 
                href="/competencies" 
                className="group rounded-lg border border-border p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium group-hover:text-primary transition-colors">
                      Manage Competencies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Create and edit competencies
                    </p>
                  </div>
                </div>
              </a>

              <a 
                href="/behavioral-indicators" 
                className="group rounded-lg border border-border p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium group-hover:text-primary transition-colors">
                      Behavioral Indicators
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Define behavior metrics
                    </p>
                  </div>
                </div>
              </a>

              <a 
                href="/assessment-questions" 
                className="group rounded-lg border border-border p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium group-hover:text-primary transition-colors">
                      Assessment Questions
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Create evaluation criteria
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}