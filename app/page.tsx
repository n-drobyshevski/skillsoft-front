import { Suspense } from 'react';
import { Metadata } from 'next';
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

// Enhanced metadata for SEO - Scientific Assessment Focus (Russian)
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://skillsoft.app'),
  title: 'SkillSoft - Платформа научной оценки гибких навыков',
  description:
    'Оценивайте гибкие навыки с помощью психометрически валидированных тестов. ' +
    'Анализ соответствия должности, оценка командной совместимости и картирование компетенций ' +
    'на основе стандартов ESCO, O*NET и модели Big Five.',
  keywords: [
    'оценка гибких навыков',
    'психометрическое тестирование',
    'оценка компетенций',
    'анализ соответствия должности',
    'командная совместимость',
    'компетенции ESCO',
    'навыки O*NET',
    'личность Big Five',
    'HR инструменты оценки',
    'развитие сотрудников',
    'оценка талантов',
    'управление компетенциями',
    'поведенческая оценка',
    'валидация навыков',
    'оценка при найме',
  ],
  authors: [{ name: 'SkillSoft' }],
  creator: 'SkillSoft',
  publisher: 'SkillSoft',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'SkillSoft - Научная оценка гибких навыков',
    description:
      'Психометрически валидированные тесты для оценки соответствия должности, командной совместимости и развития компетенций.',
    url: '/',
    siteName: 'SkillSoft',
    type: 'website',
    images: [
      {
        url: '/og-landing.png',
        width: 1200,
        height: 630,
        alt: 'Платформа оценки SkillSoft',
        type: 'image/png',
      },
    ],
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillSoft - Научная оценка гибких навыков',
    description: 'Анализ соответствия должности и командной совместимости на основе психометрической науки.',
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

// JSON-LD Structured Data (Russian)
function StructuredData() {
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
        name: 'Платформа оценки SkillSoft',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'RUB',
          description: '30-дневный бесплатный пробный период',
        },
        featureList: [
          'Психометрическая валидация тестов',
          'Анализ соответствия должности с интеграцией O*NET',
          'Оценка командной совместимости',
          'Картирование личности по Big Five',
          'Управление моделью компетенций',
        ],
      },
      {
        '@type': 'WebPage',
        '@id': 'https://skillsoft.app/#webpage',
        url: 'https://skillsoft.app',
        name: 'SkillSoft - Платформа научной оценки гибких навыков',
        isPartOf: { '@id': 'https://skillsoft.app/#website' },
        about: { '@id': 'https://skillsoft.app/#organization' },
        description:
          'Психометрически валидированные тесты гибких навыков для найма и развития персонала.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Что такое психометрическая валидация?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Психометрическая валидация обеспечивает надёжное измерение компетенций через статистический анализ сложности, дискриминативности и внутренней согласованности вопросов.',
            },
          },
          {
            '@type': 'Question',
            name: 'Как работает анализ соответствия должности?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Анализ соответствия должности сравнивает баллы компетенций кандидата с эталонами профессий O*NET для выявления пробелов в навыках и оценки пригодности к роли.',
            },
          },
        ],
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
