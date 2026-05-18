'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import { BehavioralIndicator, Competency } from '@/types/domain';
import { behavioralIndicatorsApi, competenciesApi } from '@/services/api';
import { toast } from 'sonner';
import { useEnumTranslation } from '@/hooks/useEnumTranslation';
import type { ObservabilityLevel, IndicatorMeasurementType } from '@/types/domain';

interface IndicatorSelectorProps {
  preselectedIndicatorId?: string;
  onIndicatorSelected: (competencyId: string, indicatorId: string) => void;
}

interface EnrichedIndicator extends BehavioralIndicator {
  competencyName: string;
}

export default function IndicatorSelector({
  preselectedIndicatorId,
  onIndicatorSelected
}: IndicatorSelectorProps) {
  const t = useTranslations('forms.question.indicatorSelector');
  const tForms = useTranslations('forms');
  const { translate: translateObservability } = useEnumTranslation<ObservabilityLevel>('observabilityLevel');
  const { translate: translateMeasurement } = useEnumTranslation<IndicatorMeasurementType>('measurementType');
  const [indicators, setIndicators] = useState<EnrichedIndicator[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [filteredIndicators, setFilteredIndicators] = useState<EnrichedIndicator[]>([]);
  const [selectedCompetency, setSelectedCompetency] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndicator, setSelectedIndicator] = useState<string>(preselectedIndicatorId || '');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [indicatorsData, competenciesData] = await Promise.all([
          behavioralIndicatorsApi.getAllIndicators(),
          competenciesApi.getAllCompetencies(),
        ]);

        setCompetencies(competenciesData || []);
        
        // Create competency name map
        const competencyMap = (competenciesData || []).reduce((acc, comp) => {
          acc[comp.id] = comp.name;
          return acc;
        }, {} as Record<string, string>);

        // Enrich indicators with competency names
        const enrichedIndicators = (indicatorsData || []).map(indicator => ({
          ...indicator,
          competencyName: competencyMap[indicator.competencyId] || 'Unknown',
        }));

        setIndicators(enrichedIndicators);
        setFilteredIndicators(enrichedIndicators);
      } catch {
        toast.error(t('toasts.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let filtered = indicators;

    // Filter by competency
    if (selectedCompetency !== 'all') {
      filtered = filtered.filter(indicator => indicator.competencyId === selectedCompetency);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(indicator => 
        indicator.title.toLowerCase().includes(query) ||
        (indicator.description && indicator.description.toLowerCase().includes(query)) ||
        indicator.competencyName.toLowerCase().includes(query)
      );
    }

    setFilteredIndicators(filtered);
  }, [indicators, selectedCompetency, searchQuery]);

  const handleContinue = () => {
    if (!selectedIndicator) {
      toast.error(t('toasts.selectFirst'));
      return;
    }

    const indicator = indicators.find(ind => ind.id === selectedIndicator);
    if (indicator) {
      onIndicatorSelected(indicator.competencyId, indicator.id);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('loading')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="competency-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('filters.competencyLabel')}
            </label>
            <Select value={selectedCompetency} onValueChange={setSelectedCompetency}>
              <SelectTrigger>
                <SelectValue placeholder={t('filters.competencyAllPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.competencyAllItem')}</SelectItem>
                {competencies.map(competency => (
                  <SelectItem key={competency.id} value={competency.id}>
                    {competency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('filters.searchLabel')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder={t('filters.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Indicators List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredIndicators.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('empty.title')}</p>
              <p className="text-sm mt-1">{t('empty.hint')}</p>
            </div>
          ) : (
            filteredIndicators.map(indicator => (
              <div
                key={indicator.id}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all duration-200
                  ${selectedIndicator === indicator.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
                onClick={() => setSelectedIndicator(indicator.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{indicator.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {indicator.competencyName}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {indicator.description || t('card.noDescription')}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{t('card.level', { level: translateObservability(indicator.observabilityLevel as ObservabilityLevel) })}</span>
                      <span>•</span>
                      <span>{t('card.type', { type: translateMeasurement(indicator.measurementType as IndicatorMeasurementType) })}</span>
                      {indicator.weight && (
                        <>
                          <span>•</span>
                          <span>{t('card.weight', { weight: indicator.weight })}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {selectedIndicator === indicator.id && (
                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end sm:space-x-3">
          <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
            {tForms('cancel')}
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedIndicator}
            className="w-full sm:w-auto"
          >
            {t('buttons.continue')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}