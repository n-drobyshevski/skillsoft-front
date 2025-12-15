'use client';

import { competenciesApi, ApiError } from "@/services/api";
import { CompetencyForm } from "../../_components/CompetencyForm";
import { notFound, useParams } from "next/navigation";
import CompetencyPreview from "../../_components/CompetencyPreview";
import { Competency } from "@/types/domain";
import { useEffect, useState, useCallback } from "react";
import { EditCompetencyPageSkeleton } from "../../_components/EditCompetencyPageSkeleton";
import PageHeader from "@/components/common/PageHeader";
import { CompetencyCategory, ApprovalStatus, StandardCodesDto } from "@/types/domain";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetencyIndicatorsManager } from "../../_components/CompetencyIndicatorsManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, ArrowLeft, WifiOff } from "lucide-react";
import Link from "next/link";


type CompetencyFormData = {
  name: string;
  category: string; // It's a string here, not CompetencyCategory
  isActive: boolean;
  approvalStatus: string;
  description?: string;
  standardCodes?: StandardCodesDto;
};

type LoadingState = 'loading' | 'success' | 'error' | 'not-found';

interface ErrorState {
  message: string;
  code?: string;
  isCorsError: boolean;
  isNetworkError: boolean;
}

export default function EditCompetencyPage() {
  const params = useParams();
  const competencyId = params.competencyId as string;
  const [competency, setCompetency] = useState<Competency | null>(null);
  const [previewCompetency, setPreviewCompetency] = useState<Competency | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<ErrorState | null>(null);

  const fetchCompetency = useCallback(async () => {
    if (!competencyId) return;
    
    setLoadingState('loading');
    setError(null);
    
    try {
      const fetchedCompetency = await competenciesApi.getCompetencyById(competencyId);
      if (!fetchedCompetency) {
        setLoadingState('not-found');
        return;
      }
      setCompetency(fetchedCompetency);
      setPreviewCompetency(fetchedCompetency);
      setLoadingState('success');
    } catch (err) {
      console.error('Error fetching competency:', err);
      
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to load competency';
      const errorCode = apiError.code;
      
      // Check if it's a CORS error
      const isCorsError = errorCode === 'CORS_ERROR' || 
        errorMessage.includes('CORS') || 
        errorMessage.includes('NetworkError');
      
      // Check if it's a network error
      const isNetworkError = errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('Network');
      
      // Check for 404
      if (apiError.status === 404) {
        setLoadingState('not-found');
        return;
      }
      
      setError({
        message: errorMessage,
        code: errorCode,
        isCorsError,
        isNetworkError,
      });
      setLoadingState('error');
    }
  }, [competencyId]);

  useEffect(() => {
    fetchCompetency();
  }, [fetchCompetency]);

  const handleUpdatePreview = (data: CompetencyFormData) => {
       setPreviewCompetency(prev => ({
      ...prev,
      ...data,
      // Explicitly cast the properties that have mismatched types.
      category: data.category as CompetencyCategory,
      // Assuming approvalStatus also needs casting
      approvalStatus: data.approvalStatus as ApprovalStatus,
      // Include standard codes for live preview
      standardCodes: data.standardCodes,
    } as Competency));

  };

  // Handle not found state
  if (loadingState === 'not-found') {
    notFound();
  }

  // Handle error state with user-friendly UI
  if (loadingState === 'error' && error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              {error.isCorsError || error.isNetworkError ? (
                <WifiOff className="h-6 w-6 text-destructive" />
              ) : (
                <AlertCircle className="h-6 w-6 text-destructive" />
              )}
            </div>
            <CardTitle className="text-destructive">
              {error.isCorsError ? 'Connection Issue' : 
               error.isNetworkError ? 'Network Error' : 
               'Failed to Load Competency'}
            </CardTitle>
            <CardDescription>
              {error.isCorsError ? (
                'Unable to connect to the server. This may be a temporary issue with the API.'
              ) : error.isNetworkError ? (
                'Unable to reach the server. Please check your internet connection.'
              ) : (
                'An error occurred while loading the competency details.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(error.code || error.message) && (
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md font-mono break-all">
                {error.code && <div>Code: {error.code}</div>}
                <div className="mt-1 truncate" title={error.message}>
                  {error.message.length > 100 ? error.message.slice(0, 100) + '...' : error.message}
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Button onClick={fetchCompetency} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/hr/competencies">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Competencies
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle loading state
  if (loadingState === 'loading' || !competency) {
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