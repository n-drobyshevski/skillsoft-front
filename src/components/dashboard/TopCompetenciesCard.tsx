"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Competency } from "@/app/interfaces/domain-interfaces";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { competencyCategoryToIcon, levelToColor } from "@/app/utils";

interface TopCompetenciesCardProps {
  competencies: Competency[];
}

export default function TopCompetenciesCard({ competencies }: TopCompetenciesCardProps) {
  const topCompetencies = competencies
    .sort((a, b) => (b.behavioralIndicators?.length || 0) - (a.behavioralIndicators?.length || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {topCompetencies.map((competency, index) => (
        <div key={competency.id} className="flex items-center space-x-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-sm bg-primary/10 text-primary">
              {React.cloneElement(competencyCategoryToIcon(competency.category), {
                className: "h-4 w-4",
              })}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1 min-w-0">
            <Link 
              href={`/competencies/${competency.id}`}
              className="text-sm font-medium leading-none hover:underline block truncate"
            >
              {competency.name}
            </Link>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`text-xs ${levelToColor(competency.level)}`}
              >
                {competency.level}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {competency.behavioralIndicators?.length || 0} indicators
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {competency.category.replace('_', ' ')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">#{index + 1}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
