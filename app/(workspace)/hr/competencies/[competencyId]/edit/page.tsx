'use client';

import { competenciesApi } from "@/services/api";
import { CompetencyForm } from "../../components/CompetencyForm";
import { notFound, useParams } from "next/navigation";
import CompetencyPreview from "../../components/CompetencyPreview";
import { Competency } from "@/app/interfaces/domain-interfaces";
import { useEffect, useState } from "react";
import { EditCompetencyPageSkeleton } from "../../components/EditCompetencyPageSkeleton";
import PageHeader from "@/components/PageHeader";
import { CompetencyCategory, ApprovalStatus, ProficiencyLevel } from "@/app/enums/domain_enums";
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
    <div className="min-h-screen bg-muted/30">
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4">
          <PageHeader
            className="py-4 border-0"
            title="Edit Competency"
          />
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="details" className="space-y-6">
          <div className="flex items-center space-x-1 rounded-lg bg-muted p-1">
            <TabsList className="bg-transparent">
              <TabsTrigger value="details" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Details
              </TabsTrigger>
              <TabsTrigger value="indicators" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Behavioral Indicators
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="details" className="space-y-0">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <div className="xl:col-span-3">
                <CompetencyForm competency={competency} onUpdatePreview={handleUpdatePreview} />
              </div>
              <div className="xl:col-span-2">
                <div className="sticky top-6">
                  {previewCompetency && <CompetencyPreview competency={previewCompetency} />}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="indicators" className="space-y-0">
            <CompetencyIndicatorsManager competency={competency} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}