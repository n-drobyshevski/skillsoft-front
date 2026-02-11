import { Suspense } from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AuthHandlerClient } from '@/components/auth/auth-handler-client';
import {
  LandingHeader,
  HeroSection,
  PsychometricsShowcase,
  AssessmentTypesSection,
  StandardsSection,
  HowItWorksSection,
  StatsSection,
  CTASection,
  FooterSection,
  MobileStickyCTA,
} from './_components/landing';

// Dynamic metadata for SEO with i18n support
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing.metadata');

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://skillsoft.app'),
    title: t('title'),
    description: t('description'),
    keywords: t.raw('keywords') as string[],
    authors: [{ name: 'SkillSoft' }],
    creator: 'SkillSoft',
    publisher: 'SkillSoft',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: '/',
      siteName: 'SkillSoft',
      type: 'website',
      images: [
        {
          url: '/og-landing.png',
          width: 1200,
          height: 630,
          alt: t('ogImageAlt'),
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitterTitle'),
      description: t('twitterDescription'),
      images: ['/twitter-landing.png'],
      creator: '@SkillSoftApp',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: '/',
      languages: {
        'ru-RU': '/',
        'en-US': '/en',
      },
    },
    category: 'technology',
  };
}

// JSON-LD Structured Data with i18n
async function StructuredData() {
  const t = await getTranslations('landing.metadata.jsonLd');
  const faq = t.raw('faq') as Array<{ question: string; answer: string }>;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://skillsoft.app/#organization',
        name: 'SkillSoft',
        url: 'https://skillsoft.app',
        logo: {
          '@type': 'ImageObject',
          url: 'https://skillsoft.app/logo.png',
          width: 512,
          height: 512,
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://skillsoft.app/#software',
        name: t('softwareName'),
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: t('offerDescription'),
        },
        featureList: t.raw('features') as string[],
      },
      {
        '@type': 'WebPage',
        '@id': 'https://skillsoft.app/#webpage',
        url: 'https://skillsoft.app',
        name: t('webPageName'),
        isPartOf: { '@id': 'https://skillsoft.app/#website' },
        about: { '@id': 'https://skillsoft.app/#organization' },
        description: t('webPageDescription'),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden">
      {/* Structured Data for SEO */}
      <StructuredData />

      {/* Client-side authentication handler */}
      <Suspense fallback={null}>
        <AuthHandlerClient />
      </Suspense>

      {/* Client Component - Interactive Header */}
      <LandingHeader />

      {/* Server-rendered landing page sections */}
      <main>
        {/* Hero with interactive demo - above the fold, critical path */}
        <HeroSection />

        {/* Psychometrics showcase with reliability gauges */}
        <PsychometricsShowcase />

        {/* Assessment types (Likert, SJT, MCQ) */}
        <AssessmentTypesSection />

        {/* International standards (ESCO, O*NET, Big Five) */}
        <StandardsSection />

        {/* How it works - 3 step process */}
        <HowItWorksSection />

        {/* Stats section with animated counters */}
        <StatsSection />

        {/* Final CTA */}
        <CTASection />
      </main>

      {/* Footer */}
      <FooterSection />

      {/* Mobile sticky CTA */}
      <MobileStickyCTA />
    </div>
  );
}
