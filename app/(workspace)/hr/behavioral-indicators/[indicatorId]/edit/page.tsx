'use client';

import { behavioralIndicatorsApi, ApiError } from "@/services/api";
import { IndicatorForm } from "../../_components/IndicatorForm";
import { notFound, useParams } from "next/navigation";
import IndicatorPreview from "../../_components/IndicatorPreview";
import { BehavioralIndicator } from "@/types/domain";
import { useEffect, useState, useCallback } from "react";
import { EditIndicatorPageSkeleton } from "../../_components/EditIndicatorPageSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndicatorQuestionsManager } from "../../_components/IndicatorQuestionsManager";
import PageHeader from "@/components/common/PageHeader";
import { type IndicatorFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, ArrowLeft, WifiOff } from "lucide-react";
import Link from "next/link";

type LoadingState = 'loading' | 'success' | 'error' | 'not-found';

interface ErrorState {
  message: string;
  code?: string;
  isCorsError: boolean;
  isNetworkError: boolean;
}

export default function EditIndicatorPage() {
  const params = useParams();
  const indicatorId = params.indicatorId as string;

  const [indicator, setIndicator] = useState<BehavioralIndicator | null>(null);
  const [previewIndicator, setPreviewIndicator] = useState<BehavioralIndicator | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<ErrorState | null>(null);

  const fetchIndicator = useCallback(async () => {
    if (!indicatorId) return;
    
    setLoadingState('loading');
    setError(null);
    
    try {
      const fetchedIndicator = await behavioralIndicatorsApi.getIndicatorById(indicatorId);
      if (!fetchedIndicator) {
        setLoadingState('not-found');
        return;
      }
      setIndicator(fetchedIndicator);
      setPreviewIndicator(fetchedIndicator);
      setLoadingState('success');
    } catch (err) {
      console.error('Error fetching indicator:', err);
      
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to load indicator';
      const errorCode = apiError.code;
      
      const isCorsError = errorCode === 'CORS_ERROR' || 
        errorMessage.includes('CORS') || 
        errorMessage.includes('NetworkError');
      
      const isNetworkError = errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('Network');
      
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
  }, [indicatorId]);

  useEffect(() => {
    fetchIndicator();
  }, [fetchIndicator]);

  const handleUpdatePreview = (data: IndicatorFormValues) => {
    if (previewIndicator) {
      setPreviewIndicator({ ...previewIndicator, ...data });
    }
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
               'Failed to Load Indicator'}
            </CardTitle>
            <CardDescription>
              {error.isCorsError ? (
                'Unable to connect to the server. This may be a temporary issue with the API.'
              ) : error.isNetworkError ? (
                'Unable to reach the server. Please check your internet connection.'
              ) : (
                'An error occurred while loading the indicator details.'
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
              <Button onClick={fetchIndicator} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/hr/behavioral-indicators">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Indicators
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle loading state
  if (loadingState === 'loading' || !indicator) {
    return <EditIndicatorPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4">
          <PageHeader
            className="py-4 border-0"
            title={`Edit Behavioral Indicator`}
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
              <TabsTrigger value="questions" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Questions
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="details" className="space-y-0">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <div className="xl:col-span-3">
                <IndicatorForm indicator={indicator} onUpdatePreview={handleUpdatePreview} />
              </div>
              <div className="xl:col-span-2">
                <div className="sticky top-6">
                  {previewIndicator && <IndicatorPreview indicator={previewIndicator} />}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="questions" className="space-y-0">
            <IndicatorQuestionsManager indicator={indicator} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
