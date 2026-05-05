import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { SKILL_MAPPER_NAMESPACES, pickMessages } from '@/i18n/namespaces';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skill Mapper - SkillSoft",
  description: "Client-side fuzzy search engine for mapping skills from ESCO and O*NET databases. Search across thousands of skills with zero-latency.",
  openGraph: {
    title: "Skill Mapper - SkillSoft",
    description: "Search and map skills from ESCO and O*NET databases with instant fuzzy search.",
  },
};

export default async function SkillMapperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const scopedMessages = pickMessages(
    messages as Record<string, unknown>,
    SKILL_MAPPER_NAMESPACES,
  );

  return (
    <NextIntlClientProvider messages={scopedMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
