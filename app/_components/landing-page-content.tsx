'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { Button } from "@/components/ui/button";
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
  Globe,
  Play,
  Layers,
  Award
} from "lucide-react";
import Link from "next/link";

// Animation variants for consistent motion design
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

/**
 * Modern Minimalist Landing Page (2025 Redesign)
 * 
 * Design Principles:
 * - Clean typography with generous white space
 * - Subtle micro-interactions (hover, scroll-triggered)
 * - GPU-accelerated animations (transform, opacity only)
 * - Reduced motion support for accessibility
 * - Single clear CTA per section
 * - Consistent color palette with brand identity
 */
export function LandingPageContent() {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  // Respect user preference for reduced motion
  const motionProps = prefersReducedMotion 
    ? { initial: "visible", animate: "visible" }
    : { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-100px" } };

  return (
    <div className="relative bg-background overflow-hidden">
      
      {/* ===== HEADER ===== */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.div 
                className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <span className="text-lg font-semibold tracking-tight">SkillSoft</span>
            </Link>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
            </nav>
            
            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="sm" className="text-sm">
                    Get Started
                    <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16">
        {/* Subtle Background Gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px]" />
        </div>
        
        <motion.div 
          className="relative max-w-6xl mx-auto px-6 py-24"
          style={{ opacity: prefersReducedMotion ? 1 : heroOpacity, y: prefersReducedMotion ? 0 : heroY }}
        >
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <motion.div {...motionProps} variants={fadeIn}>
              <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Competency Management Platform
              </Badge>
            </motion.div>
            
            {/* Headline */}
            <motion.div {...motionProps} variants={fadeInUp} className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Build Skills That
                <span className="block text-primary">Drive Results</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The intelligent platform for tracking competencies, measuring growth, 
                and accelerating professional development.
              </p>
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div 
              {...motionProps} 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/sign-up">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="h-12 px-8 text-base">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="lg" className="h-12 px-8 text-base group">
                  <Play className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Trust Indicators */}
            <motion.div 
              {...motionProps} 
              variants={fadeIn}
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Free 30-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span>2,500+ Professionals</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center"
          >
            <motion.div 
              className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full mt-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-32 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <motion.div 
            {...motionProps} 
            variants={staggerContainer}
            className="text-center space-y-4 mb-20"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="outline" className="mb-4">Features</Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold tracking-tight">
              Everything you need to{' '}
              <span className="text-primary">succeed</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed for modern professional development,
              backed by intelligent analytics.
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            {...motionProps}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Target,
                title: "Smart Competency Framework",
                description: "Define and track competencies with AI-powered behavioral indicators.",
                color: "bg-primary"
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Real-time insights with predictive modeling and trend analysis.",
                color: "bg-blue-500"
              },
              {
                icon: Users,
                title: "Interactive Assessments",
                description: "Engaging evaluations with instant feedback and multimedia support.",
                color: "bg-green-500"
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "SOC 2 compliance, SSO integration, and end-to-end encryption.",
                color: "bg-purple-500"
              },
              {
                icon: Zap,
                title: "AI-Powered Insights",
                description: "Personalized skill recommendations and growth pathways.",
                color: "bg-orange-500"
              },
              {
                icon: Globe,
                title: "Global Scalability",
                description: "Multi-language support and regional compliance capabilities.",
                color: "bg-pink-500"
              }
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={scaleIn}
                className="group"
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="h-full p-8 rounded-2xl bg-background border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300"
                >
                  <div className="space-y-4">
                    <motion.div 
                      className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section id="how-it-works" className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            {...motionProps}
            variants={staggerContainer}
            className="text-center space-y-4 mb-20"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="outline" className="mb-4">How It Works</Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold tracking-tight">
              Simple steps to{' '}
              <span className="text-primary">growth</span>
            </motion.h2>
          </motion.div>

          <motion.div 
            {...motionProps}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-12"
          >
            {[
              {
                step: "01",
                icon: Layers,
                title: "Define Your Framework",
                description: "Create competency models tailored to your organization's goals and industry standards."
              },
              {
                step: "02",
                icon: TrendingUp,
                title: "Track Progress",
                description: "Monitor skill development with real-time dashboards and detailed analytics."
              },
              {
                step: "03",
                icon: Award,
                title: "Achieve Excellence",
                description: "Celebrate milestones and continuously improve with data-driven insights."
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                variants={fadeInUp}
                className="relative text-center"
              >
                {/* Connector Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
                )}
                
                <div className="space-y-6">
                  <div className="relative inline-flex">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-32 h-32 rounded-full bg-muted/50 flex items-center justify-center"
                    >
                      <div className="w-24 h-24 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center">
                        <item.icon className="w-10 h-10 text-primary" />
                      </div>
                    </motion.div>
                    <span className="absolute -top-2 -right-2 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-24 bg-primary">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            {...motionProps}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: "2,500+", label: "Active Users" },
              { value: "150+", label: "Organizations" },
              { value: "98%", label: "Satisfaction Rate" },
              { value: "45%", label: "Productivity Gain" }
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2"
                >
                  {stat.value}
                </motion.div>
                <div className="text-primary-foreground/80 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section id="pricing" className="py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div 
            {...motionProps}
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeIn}>
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                <Star className="w-3.5 h-3.5 mr-1.5" />
                Ready to Transform?
              </Badge>
            </motion.div>
            
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Start Your Growth
              <span className="block text-primary">Journey Today</span>
            </motion.h2>
            
            <motion.p variants={fadeInUp} className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of professionals transforming their careers 
              with intelligent competency management.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link href="/sign-up">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="h-14 px-10 text-lg">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="lg" className="h-14 px-10 text-lg">
                  Schedule Demo
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground"
            >
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
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border/50 bg-muted/20">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold">SkillSoft</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                The intelligent platform for professional development and competency management.
              </p>
            </div>
            
            {/* Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Product</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <a href="#features" className="block hover:text-foreground transition-colors">Features</a>
                <a href="#pricing" className="block hover:text-foreground transition-colors">Pricing</a>
                <a href="#" className="block hover:text-foreground transition-colors">Integrations</a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Company</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <a href="#" className="block hover:text-foreground transition-colors">About</a>
                <a href="#" className="block hover:text-foreground transition-colors">Blog</a>
                <a href="#" className="block hover:text-foreground transition-colors">Careers</a>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-16 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              © 2025 SkillSoft. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Social Proof Section removed and integrated into main content