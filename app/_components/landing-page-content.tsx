import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight,
  Sparkles,
  Target,
  BarChart3,
  Users,
  Shield,
  CheckCircle,
  Zap,
  TrendingUp,
  Star,
  Globe
} from "lucide-react";
import { DashboardAccessButtons } from "@/components/dashboard/dashboard-access-buttons";

/**
 * Modern minimalistic server-rendered landing page content
 * Features: Clean typography, subtle animations, geometric shapes, premium aesthetic
 */
export function LandingPageContent() {
  return (
    <div className="relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-primary/30 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-primary/25 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-primary/20 rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
      </div>

      {/* Minimalist Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-linear-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">SkillSoft</span>
            </div>
            
            <DashboardAccessButtons />
          </div>
        </div>
      </header>

      {/* Hero Section - Modern Minimalist Design */}
      <section className="pt-32 pb-20 px-6 lg:px-8 relative overflow-hidden">
        {/* Enhanced Geometric Background with Modern Animations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-linear-to-br from-primary/5 to-transparent rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-linear-to-tr from-primary/3 to-transparent rounded-full blur-3xl animate-float"></div>
          
          {/* Additional modern geometric elements */}
          <div className="absolute top-1/3 left-1/4 w-4 h-4 border border-primary/20 rotate-45 animate-spin" style={{ animationDuration: '15s' }}></div>
          <div className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-primary/10 rounded-full animate-pulse shadow-modern"></div>
          <div className="absolute top-2/3 right-1/4 w-8 h-1 bg-linear-to-r from-primary/20 to-transparent animate-fade-in-up"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Zap className="w-3 h-3" />
                  <span>Professional Development Platform</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
                  <span className="bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Transform Your
                  </span>
                  <br />
                  <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Career Journey
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Accelerate professional growth with our intelligent competency platform. 
                  Track skills, measure progress, and unlock your potential with precision analytics.
                </p>
              </div>

              <div className="flex justify-center lg:justify-start">
                <Button size="lg" className="btn-modern bg-primary text-primary-foreground hover:bg-primary/90 shadow-modern-lg hover:shadow-xl transition-all duration-300 group animate-scale-in">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>2,500+ professionals</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Enterprise secure</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>ISO certified</span>
                </div>
              </div>
            </div>

            {/* Enhanced Modern Dashboard Preview */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent rounded-3xl animate-gradient"></div>
              <Card className="card-modern relative p-8 hover-lift shadow-modern-lg transition-all duration-500">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground text-gradient-subtle">Skills Dashboard</h3>
                      <p className="text-sm text-muted-foreground">Real-time insights</p>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary animate-pulse-glow border-gradient">
                      Live
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-background/50 border border-border/50 hover-glow transition-all duration-300 hover:border-primary/30 animate-scale-in" style={{ animationDelay: '0.6s' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-modern animate-float">
                          <Target className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-primary">24</p>
                          <p className="text-xs text-muted-foreground">Skills Mastered</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-background/50 border border-border/50 hover-glow transition-all duration-300 hover:border-green-500/30 animate-scale-in" style={{ animationDelay: '0.8s' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-modern animate-float" style={{ animationDelay: '1s' }}>
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">94%</p>
                          <p className="text-xs text-muted-foreground">Progress Rate</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Mini Chart Visualization */}
                  <div className="h-16 bg-linear-to-r from-primary/10 to-primary/5 rounded-lg flex items-center justify-center relative overflow-hidden animate-scale-in" style={{ animationDelay: '1s' }}>
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/5 to-transparent animate-gradient"></div>
                    <BarChart3 className="w-6 h-6 text-primary relative z-10 animate-pulse-glow" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean Grid */}
      <section id="features" className="py-24 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Core Features
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Everything you need to <span className="text-primary">excel</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive tools designed for modern professional development, 
              backed by intelligent analytics and seamless user experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="group p-8 bg-background/50 backdrop-blur-sm border-border/50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-linear-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Smart Competency Framework
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Define and track competencies with AI-powered behavioral indicators 
                    and dynamic assessment criteria.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="group p-8 bg-background/50 backdrop-blur-sm border-border/50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Advanced Analytics
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Gain insights with real-time analytics, predictive modeling, 
                    and personalized development recommendations.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="group p-8 bg-background/50 backdrop-blur-sm border-border/50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-linear-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Interactive Assessments
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Create engaging assessments with multimedia content 
                    and instant feedback mechanisms.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card className="group p-8 bg-background/50 backdrop-blur-sm border-border/50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Enterprise Security
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Bank-level security with SOC 2 compliance, 
                    SSO integration, and data encryption.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 5 */}
            <Card className="group p-8 bg-background/50 backdrop-blur-sm border-border/50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    AI-Powered Insights
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Leverage machine learning for personalized 
                    skill recommendations and growth paths.
                  </p>
                </div>
              </div>
            </Card>

            {/* Feature 6 */}
            <Card className="group p-8 bg-background/50 backdrop-blur-sm border-border/50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-linear-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Global Scalability
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Multi-language support, regional compliance, 
                    and global deployment capabilities.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground mb-8">Trusted by leading organizations worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {/* Placeholder for company logos */}
            <div className="w-24 h-12 bg-muted/50 rounded flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground">Company A</span>
            </div>
            <div className="w-24 h-12 bg-muted/50 rounded flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground">Company B</span>
            </div>
            <div className="w-24 h-12 bg-muted/50 rounded flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground">Company C</span>
            </div>
            <div className="w-24 h-12 bg-muted/50 rounded flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground">Company D</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Modern Gradient */}
      <section className="py-24 px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-primary/10 to-primary/5"></div>
        <div className="absolute inset-0 bg-grid-foreground/[0.02]"></div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="space-y-6">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <Star className="w-3 h-3 mr-1" />
              Ready to Transform?
            </Badge>
            
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Start Your Growth
              <br />
              <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Journey Today
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join over 2,500 professionals transforming their careers with intelligent competency management.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group">
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="border-2">
                Schedule Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>30-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Enterprise security</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-linear-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">SkillSoft</span>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <span>© 2025 SkillSoft. All rights reserved.</span>
              <div className="flex gap-6">
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}