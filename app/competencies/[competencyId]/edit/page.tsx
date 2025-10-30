'use client';

import { competenciesApi } from "@/services/api";
import { CompetencyForm } from "../../components/CompetencyForm";
import { notFound, useParams } from "next/navigation";
import CompetencyPreview from "../../components/CompetencyPreview";
import { Competency } from "../../../interfaces/domain-interfaces";
import { useEffect, useState } from "react";
import { EditCompetencyPageSkeleton } from "../../components/EditCompetencyPageSkeleton";

export default function EditCompetencyPage() {
  const params = useParams();
  const competencyId = params.competencyId as string;
  const [competency, setCompetency] = useState<Competency | null>(null);
  const [previewCompetency, setPreviewCompetency] = useState<Competency | null>(null);

  useEffect(() => {
    async function fetchCompetency() {
      const fetchedCompetency = await competenciesApi.getCompetencyById(competencyId);
      if (!fetchedCompetency) {
        notFound();
      }
      setCompetency(fetchedCompetency);
      setPreviewCompetency(fetchedCompetency);
    }
    if (competencyId) {
        fetchCompetency();
    }
  }, [competencyId]);

  const handleUpdatePreview = (data: Partial<Competency>) => {
    if (previewCompetency) {
      setPreviewCompetency({ ...previewCompetency, ...data });
    }
  };

  if (!competency) {
    return <EditCompetencyPageSkeleton />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CompetencyForm competency={competency} onUpdatePreview={handleUpdatePreview} />
        </div>
        <div className="hidden lg:block">
          {previewCompetency && <CompetencyPreview competency={previewCompetency} />}
        </div>
      </div>
    </div>
  );
}