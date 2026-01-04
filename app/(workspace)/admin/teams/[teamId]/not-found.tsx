"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ArrowLeft, Search } from "lucide-react";

export default function TeamNotFound() {
  const t = useTranslations('teams.notFound');

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-6 pb-8 space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {t('title')}
            </h1>
            <p className="text-muted-foreground">
              {t('description')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default">
              <Link href="/admin/teams">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToList')}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/teams?search=">
                <Search className="h-4 w-4 mr-2" />
                {t('searchTeams')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
