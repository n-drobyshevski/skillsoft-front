import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skill Mapper - SkillSoft",
  description: "Client-side fuzzy search engine for mapping skills from ESCO and O*NET databases. Search across thousands of skills with zero-latency.",
  openGraph: {
    title: "Skill Mapper - SkillSoft",
    description: "Search and map skills from ESCO and O*NET databases with instant fuzzy search.",
  },
};

export default function SkillMapperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
