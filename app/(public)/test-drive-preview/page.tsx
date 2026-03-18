import Link from "next/link";
import {
  Layers,
  LayoutPanelLeft,
  LayoutDashboard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Direction {
  number: number;
  slug: string;
  name: string;
  description: string;
  tag: string;
  color: string;
  badgeColor: string;
  circleColor: string;
  icon: React.ElementType;
}

const DIRECTIONS: Direction[] = [
  {
    number: 1,
    slug: "inline-annotations",
    name: "Inline Annotations",
    description:
      "Insights woven directly into the question card. Correct answers highlighted, difficulty badges, expandable insight strips.",
    tag: "Contextual",
    color: "emerald",
    badgeColor: "bg-emerald-950 text-emerald-300",
    circleColor: "bg-emerald-500",
    icon: Layers,
  },
  {
    number: 2,
    slug: "split-screen",
    name: "Split-Screen Command Center",
    description:
      "Persistent 50/50 split with live analytics panel. Dense metrics, mini charts, color-coded quality indicators.",
    tag: "Analytical",
    color: "blue",
    badgeColor: "bg-blue-950 text-blue-300",
    circleColor: "bg-blue-500",
    icon: LayoutPanelLeft,
  },
  {
    number: 3,
    slug: "dashboard",
    name: "Insights Dashboard",
    description:
      "Full-page analytics cockpit. Quality score rings, red flags, difficulty distribution, question as embedded widget.",
    tag: "Comprehensive",
    color: "rose",
    badgeColor: "bg-rose-950 text-rose-300",
    circleColor: "bg-rose-500",
    icon: LayoutDashboard,
  },
];

export default function TestDrivePreviewHubPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-3">
          Test Drive Insights — Design Exploration
        </h1>
        <p className="text-neutral-400 text-base max-w-2xl">
          3 different approaches to surfacing psychometric, scoring, and mapping
          data during test preview. Click to explore each direction.
        </p>
      </div>

      {/* Direction cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DIRECTIONS.map((direction) => {
          const Icon = direction.icon;
          return (
            <Link
              key={direction.slug}
              href={`/test-drive-preview/${direction.slug}`}
              className="group block"
            >
              <Card className="h-full cursor-pointer border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:shadow-lg hover:shadow-neutral-900/50 transition-all duration-200">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    {/* Numbered circle badge */}
                    <div
                      className={`flex items-center justify-center size-8 rounded-full ${direction.circleColor} text-white text-sm font-bold shrink-0`}
                    >
                      {direction.number}
                    </div>
                    {/* Direction icon */}
                    <Icon className="size-5 text-neutral-400 mt-0.5 shrink-0" />
                  </div>
                  <CardTitle className="text-base group-hover:text-amber-400 transition-colors">
                    {direction.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {direction.description}
                  </p>
                  {/* Philosophy tag */}
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium w-fit border-0 ${direction.badgeColor}`}
                  >
                    {direction.tag}
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
