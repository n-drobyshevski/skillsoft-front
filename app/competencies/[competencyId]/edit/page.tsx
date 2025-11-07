'use client';

import { competenciesApi } from "@/services/api";
import { CompetencyForm } from "../../components/CompetencyForm";
import { notFound, useParams } from "next/navigation";
import CompetencyPreview from "../../components/CompetencyPreview";
import { Competency } from "../../../interfaces/domain-interfaces";
import { useEffect, useState } from "react";
import { EditCompetencyPageSkeleton } from "../../components/EditCompetencyPageSkeleton";
import PageHeader from "@/components/PageHeader";
import { CompetencyCategory, ApprovalStatus, ProficiencyLevel } from "../../../enums/domain_enums";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetencyIndicatorsManager } from "../../components/CompetencyIndicatorsManager";


type CompetencyFormData = {
  name: string;
  category: string; // It's a string here, not CompetencyCategory
  level: string;
  isActive: boolean;
  approvalStatus: string;
  description?: string;
};

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

  const handleUpdatePreview = (data: CompetencyFormData) => {
       setPreviewCompetency(prev => ({
      ...prev,
      ...data,
      // Explicitly cast the properties that have mismatched types.
      category: data.category as CompetencyCategory, 
      level: data.level as ProficiencyLevel,
      // Assuming approvalStatus also needs casting
      approvalStatus: data.approvalStatus as ApprovalStatus,
    } as Competency));
    
  };

  if (!competency) {
    return <EditCompetencyPageSkeleton />;
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        className="pl-0! py-4"
        title={`Edit Competency: ${competency.name}`}
      />
      <Tabs defaultValue="details" className="mt-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="indicators">Behavioral Indicators</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
            <div className="lg:col-span-2">
              <CompetencyForm competency={competency} onUpdatePreview={handleUpdatePreview} />
            </div>
            <div className="hidden lg:block">
              {previewCompetency && <CompetencyPreview competency={previewCompetency} />}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="indicators">
          <CompetencyIndicatorsManager competency={competency} />
        </TabsContent>
      </Tabs>
    </div>
  );
}