'use client';

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Competency } from "@/types/domain";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CompetencyPreview({ competency }: { competency: Competency }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {competency.name}
        </CardTitle>
        <CardDescription className="text-base">
          Live preview of the competency.
        </CardDescription>
        <div className="flex items-center justify-start gap-2 pt-4">
          <Badge variant={competency.isActive ? "default" : "secondary"}>
            {competency.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge
            variant="outline"
          >
            {competency.level}
          </Badge>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium">Description</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {competency.description}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Category</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {competency.category}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
