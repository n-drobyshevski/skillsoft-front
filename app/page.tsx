import { Suspense } from "react";
import { Metadata } from "next";
import { AuthHandlerClient } from "@/components/auth/auth-handler-client";
import { LandingPageContent } from "./_components/landing-page-content";

// Enhanced metadata for SEO with metadataBase
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://skillsoft.com'),
  title: "SkillSoft - Professional Development & Competency Management Platform",
  description: "Transform your career with SkillSoft's intelligent competency platform. Track skills, master competencies, and accelerate professional growth with precision analytics and personalized development paths.",
  keywords: [
    "professional development", 
    "competency management", 
    "skill tracking", 
    "career growth", 
    "employee development", 
    "performance management",
    "learning platform",
    "talent development",
    "skills assessment",
    "enterprise training"
  ],
  authors: [{ name: "SkillSoft Team" }],
  creator: "SkillSoft",
  publisher: "SkillSoft",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "SkillSoft - Transform Your Professional Journey",
    description: "Accelerate your career with intelligent competency management, skill tracking, and personalized development paths.",
    url: "/",
    siteName: "SkillSoft",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SkillSoft - Professional Development Platform",
        type: "image/png",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillSoft - Professional Development Platform",
    description: "Transform your career with intelligent competency management and skill tracking.",
    images: ["/twitter-image.png"],
    creator: "@SkillSoft",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-verification-token", // Replace with actual token
    yandex: "yandex-verification-token", // Replace with actual token
  },
  alternates: {
    canonical: "/",
    languages: {
      'en-US': '/en-US',
      'en-GB': '/en-GB',
    },
  },
  category: "technology",
};

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden">
      {/* Client-side authentication handler */}
      <Suspense fallback={null}>
        <AuthHandlerClient />
      </Suspense>
      
      {/* Server-rendered landing page content */}
      <LandingPageContent />
    </div>
  );
}
