'use client';

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3, 
  Shield, 
  Globe,
  ArrowRight,
  Sparkles,
  Award,
  LineChart,
  Rocket
} from "lucide-react";

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (isLoaded && user) {
      router.push("/dashboard");
    }
  }, [user, isLoaded, router]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Modern Header with Glass Morphism */}
  <header className="fixed top-0 w-full z-50 border-b border-border bg-card/80 backdrop-blur-xl supports-backdrop-filter:bg-card/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-9 h-9 bg-foreground text-background rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-foreground">
                SkillSoft
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <SignInButton>
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Modern Typography */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
  <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-size-[75px_75px]"></div>
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-foreground/6 to-transparent blur-3xl"></div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                <Badge variant="secondary" className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground border-border">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Professional Development Platform</span>
                </Badge>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
                  <span className="block text-slate-900 dark:text-white">Elevate Your</span>
                  <span className="block text-foreground/80">
                    Skills Journey
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Transform your professional development with our intelligent competency platform. 
                  Track progress, master skills, and accelerate your career growth with precision.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <SignUpButton>
                  <Button 
                    size="lg" 
                    className="bg-foreground text-background shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 px-8 py-6 text-lg"
                  >
                    Start Free Trial
                    <Rocket className="ml-2 w-5 h-5" />
                  </Button>
                </SignUpButton>
                <SignInButton>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-border text-foreground hover:bg-muted/40 px-8 py-6 text-lg"
                  >
                    View Demo
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </SignInButton>
              </div>

              {/* Enhanced Social Proof */}
              <div className="flex items-center justify-center lg:justify-start gap-8 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-foreground/70" />
                    <span className="font-medium">2,500+ professionals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-foreground/70" />
                    <span className="font-medium">Enterprise secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-foreground/70" />
                    <span className="font-medium">ISO certified</span>
                  </div>
              </div>
            </div>

            {/* Modern Dashboard Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-ultra-soft rounded-3xl blur-2xl transform rotate-6"></div>
              <Card className="relative p-8 border-0 bg-card/80 backdrop-blur-xl shadow-2xl rounded-3xl">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Skills Dashboard</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Real-time analytics</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Live Preview
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-2xl flex items-center justify-center">
                          <Target className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Skills Mastered</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">24</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-2xl flex items-center justify-center">
                          <LineChart className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Progress Rate</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">94%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="h-20 bg-ultra-soft rounded-2xl flex items-center justify-center relative overflow-hidden">
                    <BarChart3 className="w-10 h-10 text-muted-foreground relative z-10" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Features Section */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 bg-ultra-soft"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-20">
            <Badge className="bg-muted text-muted-foreground px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Core Features
            </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Everything you need to{" "}
              <span className="text-foreground/80">excel</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Comprehensive tools designed for modern professional development, 
              backed by intelligent analytics and seamless user experience.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="group relative p-8 border-0 bg-card/60 backdrop-blur-sm hover:bg-card/80 shadow-lg hover:shadow-xl transition-all duration-500 rounded-3xl">
              <div className="absolute inset-0 bg-ultra-soft rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="p-0 space-y-6">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center shadow group-hover:scale-105 transition-transform duration-300">
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                    Smart Competency Framework
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                    Define, organize, and track competencies with AI-powered behavioral indicators 
                    and dynamic assessment criteria.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="group relative p-8 border-0 bg-card/60 backdrop-blur-sm hover:bg-card/80 shadow-lg hover:shadow-xl transition-all duration-500 rounded-3xl">
              <div className="absolute inset-0 bg-ultra-soft rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="p-0 space-y-6">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center shadow group-hover:scale-105 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                    Advanced Analytics
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                    Gain deep insights with real-time analytics, predictive modeling, 
                    and personalized skill development recommendations.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="group relative p-8 border-0 bg-card/60 backdrop-blur-sm hover:bg-card/80 shadow-lg hover:shadow-xl transition-all duration-500 rounded-3xl md:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-ultra-soft rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="p-0 space-y-6">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center shadow group-hover:scale-105 transition-transform duration-300">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                    Interactive Assessments
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                    Create engaging assessments with multimedia content, 
                    adaptive questioning, and instant feedback mechanisms.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-radial from-white/20 via-transparent to-transparent blur-3xl"></div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
              <Rocket className="w-4 h-4 mr-2" />
              Ready to Transform?
            </Badge>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white">
              Start Your Growth
              <span className="block">Journey Today</span>
            </h2>
            
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Join over 2,500 professionals who are already transforming their careers 
              with our intelligent competency platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <SignUpButton>
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-6 text-lg font-semibold"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </SignUpButton>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg"
              >
                Schedule Demo
                <Target className="ml-2 w-5 h-5" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-12 flex items-center justify-center gap-8 text-blue-100/80">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>30-day free trial</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-5 h-5 text-blue-300" />
                <span>Enterprise security</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-5 h-5 text-purple-300" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="relative border-t border-slate-200/60 dark:border-slate-800 bg-white/80 backdrop-blur-xl dark:bg-slate-950/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
                SkillSoft
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>© 2025 SkillSoft. All rights reserved.</span>
              </div>
              <div className="flex gap-6">
                <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}