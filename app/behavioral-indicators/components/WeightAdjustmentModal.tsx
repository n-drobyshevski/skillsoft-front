import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Scale, Zap, RotateCcw, CheckCircle2, Calculator } from 'lucide-react';
import { BehavioralIndicator } from '../../interfaces/domain-interfaces';
import { behavioralIndicatorsApi } from '@/services/api';
import { updateIndicatorAction, type IndicatorFormData } from '@/app/actions';
import { toast } from 'sonner';

interface WeightAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWeightsUpdated: () => void;
  competencyId: string;
  newIndicatorWeight: number;
  onWeightDistributionComplete?: (adjustedWeights: Array<{ id: string; weight: number }>) => void;
}

interface IndicatorWeight {
  id: string;
  title: string;
  currentWeight: number;
  newWeight: number;
  inputValue: string; // Separate state for input display
  isInputValid: boolean; // Track input validation state
}

const MAX_WEIGHT_TOTAL = 1.0;
const WEIGHT_TOLERANCE = 0.001;

export function WeightAdjustmentModal({ 
  isOpen, 
  onClose, 
  onWeightsUpdated,
  competencyId,
  newIndicatorWeight,
  onWeightDistributionComplete
}: WeightAdjustmentModalProps) {
  const [indicators, setIndicators] = useState<IndicatorWeight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadIndicators = useCallback(async () => {
    setIsLoading(true);
    try {
      const behavioralIndicators = await behavioralIndicatorsApi.getIndicators(competencyId);
      if (behavioralIndicators) {
        const indicatorWeights = behavioralIndicators.map((indicator: BehavioralIndicator) => ({
          id: indicator.id,
          title: indicator.title,
          currentWeight: indicator.weight,
          newWeight: indicator.weight,
          inputValue: indicator.weight.toFixed(3),
          isInputValid: true,
        }));
        setIndicators(indicatorWeights);
      } else {
        setIndicators([]);
      }
    } catch {
      toast.error('Failed to load existing indicators');
      setIndicators([]);
    } finally {
      setIsLoading(false);
    }
  }, [competencyId]);

  useEffect(() => {
    if (isOpen && competencyId) {
      loadIndicators();
    }
  }, [isOpen, competencyId, loadIndicators]);

  const updateIndicatorInputValue = (id: string, inputValue: string) => {
    const numericValue = parseFloat(inputValue);
    const isValid = !isNaN(numericValue) && numericValue > 0 && numericValue <= 1.0;
    
    setIndicators(prev => prev.map(indicator => 
      indicator.id === id ? { 
        ...indicator, 
        inputValue,
        isInputValid: inputValue === '' || isValid // Allow empty for clearing
      } : indicator
    ));
  };

  const handleInputBlur = (id: string, inputValue: string) => {
    const numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      const clampedValue = Math.max(0.001, Math.min(1.0, numericValue));
      setIndicators(prev => prev.map(indicator => 
        indicator.id === id ? { 
          ...indicator, 
          newWeight: clampedValue,
          inputValue: clampedValue.toFixed(3),
          isInputValid: true
        } : indicator
      ));
      
      // Show toast if value was clamped
      if (clampedValue !== numericValue) {
        toast.info(`Weight adjusted to ${clampedValue.toFixed(3)} (valid range: 0.001 - 1.000)`);
      }
    } else {
      // Reset to current weight if invalid input
      setIndicators(prev => prev.map(indicator => 
        indicator.id === id ? { 
          ...indicator, 
          inputValue: indicator.newWeight.toFixed(3),
          isInputValid: true
        } : indicator
      ));
      
      if (inputValue.trim() && isNaN(numericValue)) {
        toast.error('Please enter a valid number');
      }
    }
  };

  const getCurrentTotal = () => {
    return indicators.reduce((sum, indicator) => sum + indicator.newWeight, 0);
  };

  const getNewTotal = () => {
    return getCurrentTotal() + newIndicatorWeight;
  };

  const isValidDistribution = () => {
    const newTotal = getNewTotal();
    
    // If we're adding a new indicator (newIndicatorWeight > 0), require exact total of 1.0
    if (newIndicatorWeight > 0) {
      return newTotal <= (MAX_WEIGHT_TOTAL + WEIGHT_TOLERANCE) && newTotal >= (MAX_WEIGHT_TOTAL - WEIGHT_TOLERANCE);
    }
    
    // If we're just adjusting existing weights, allow any total that doesn't exceed 1.0
    return newTotal <= (MAX_WEIGHT_TOTAL + WEIGHT_TOLERANCE);
  };

  const suggestEqualDistribution = () => {
    const availableWeight = MAX_WEIGHT_TOTAL - newIndicatorWeight;
    const weightPerIndicator = availableWeight / indicators.length;
    
    setIndicators(prev => prev.map(indicator => {
      const newWeight = Math.round(weightPerIndicator * 1000) / 1000;
      return {
        ...indicator,
        newWeight,
        inputValue: newWeight.toFixed(3),
        isInputValid: true
      };
    }));
  };

  const resetWeights = () => {
    setIndicators(prev => prev.map(indicator => ({
      ...indicator,
      newWeight: indicator.currentWeight,
      inputValue: indicator.currentWeight.toFixed(3),
      isInputValid: true
    })));
  };

  const saveWeightChanges = async () => {
    if (!isValidDistribution()) {
      const message = newIndicatorWeight > 0 
        ? 'Weight distribution is not valid. Total must equal 1.0' 
        : 'Weight distribution exceeds limit. Total cannot exceed 1.0';
      toast.error(message);
      return;
    }

    setIsSaving(true);
    try {
      // Update each indicator's weight using server actions
      const updatePromises = indicators
        .filter(indicator => Math.abs(indicator.newWeight - indicator.currentWeight) > WEIGHT_TOLERANCE)
        .map(async (indicator) => {
          // First fetch the current indicator to get all required fields
          const currentIndicator = await behavioralIndicatorsApi.getIndicatorById(indicator.id);
          
          if (!currentIndicator) {
            throw new Error(`Indicator ${indicator.id} not found`);
          }
          
          // Create update payload using IndicatorFormData format
          const updateData: IndicatorFormData = {
            title: currentIndicator.title,
            description: currentIndicator.description || '',
            weight: indicator.newWeight, // Only this field changes
            orderIndex: currentIndicator.orderIndex || 1,
            observabilityLevel: currentIndicator.observabilityLevel,
            measurementType: currentIndicator.measurementType,
            examples: currentIndicator.examples || '',
            counterExamples: currentIndicator.counterExamples || '',
            isActive: currentIndicator.isActive,
            approvalStatus: currentIndicator.approvalStatus,
          };
          
          const result = await updateIndicatorAction(indicator.id, updateData);
          
          if (!result.success) {
            throw new Error(result.message);
          }
          
          return result;
        });

      await Promise.all(updatePromises);
      
      toast.success('Weights updated successfully');
      
      // Pass adjusted weights to parent if callback provided
      if (onWeightDistributionComplete) {
        onWeightDistributionComplete(
          indicators.map(indicator => ({
            id: indicator.id,
            weight: indicator.newWeight
          }))
        );
      } else {
        // Only call onWeightsUpdated if onWeightDistributionComplete is not provided
        // to avoid race condition between API refresh and local state update
        onWeightsUpdated();
      }
      
      onClose();
    } catch {
      toast.error('Failed to update weights. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentTotal = getCurrentTotal();
  const newTotal = getNewTotal();
  const isValid = isValidDistribution();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[800px] lg:w-[500px] xl:w-[700px] max-w-900! overflow-hidden flex flex-col p-4">
        <SheetHeader className="space-y-4 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <SheetTitle className="text-xl">Weight Distribution</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {newIndicatorWeight > 0 
                  ? 'Redistribute weights to accommodate the new indicator'
                  : 'Adjust the weight distribution for existing indicators'
                }
              </SheetDescription>
            </div>
          </div>
          
          {/* Weight Summary Card */}
          <Card className={`border-2 ${isValid 
            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20' 
            : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <h4 className={`font-semibold ${isValid 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
                }`}>
                  {isValid 
                    ? (newIndicatorWeight > 0 ? 'Valid Distribution' : 'Weight Distribution OK') 
                    : (newIndicatorWeight > 0 ? 'Weight Limit Exceeded' : 'Weight Limit Exceeded')
                  }
                </h4>
              </div>
              
              <div className={`grid gap-4 mb-3 ${newIndicatorWeight > 0 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Current Total</div>
                  <Badge variant="outline" className="font-mono">
                    {currentTotal.toFixed(3)}
                  </Badge>
                </div>
                {newIndicatorWeight > 0 && (
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">New Indicator</div>
                    <Badge variant="outline" className="font-mono">
                      +{newIndicatorWeight.toFixed(3)}
                    </Badge>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">
                    {newIndicatorWeight > 0 ? 'Final Total' : 'Total Weight'}
                  </div>
                  <Badge 
                    variant={isValid ? "default" : "destructive"}
                    className="font-mono"
                  >
                    {newTotal.toFixed(3)}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Weight Usage</span>
                  <span>{Math.min(100, (newTotal / MAX_WEIGHT_TOTAL) * 100).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={Math.min(100, (newTotal / MAX_WEIGHT_TOTAL) * 100)} 
                  className={`h-2 ${newTotal > MAX_WEIGHT_TOTAL ? '[&>div]:bg-red-500' : '[&>div]:bg-green-500'}`}
                />
              </div>
            </CardContent>
          </Card>
        </SheetHeader>

        <div className="flex-1 overflow-auto py-6 space-y-6 px-6">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Actions
            </h4>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={suggestEqualDistribution}
                disabled={indicators.length === 0}
                className="flex items-center gap-2 min-w-[140px]"
              >
                <Calculator className="h-3 w-3" />
                Equal Distribution
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetWeights}
                className="flex items-center gap-2 min-w-[120px]"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Changes
              </Button>
            </div>
          </div>

          <Separator />

          {/* Indicator Weight Controls */}
          <div className="space-y-4 px-4">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Existing Indicators ({indicators.length})
            </h4>
            
            {isLoading ? (
              <div className="grid grid-cols-1  gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : indicators.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Scale className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No existing indicators found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1  gap-3">
                {indicators.map((indicator) => {
                  const hasChanged = Math.abs(indicator.newWeight - indicator.currentWeight) > WEIGHT_TOLERANCE;
                  
                  return (
                    <Card key={indicator.id} className={`py-2! transition-all ${hasChanged ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-start">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium text-sm truncate">{indicator.title}</div>
                              {hasChanged && (
                                <Badge variant="secondary" className="text-xs">Modified</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Original: <span className="font-mono">{indicator.currentWeight.toFixed(3)}</span></div>
                              {hasChanged && (
                                <div className={`font-medium ${
                                  indicator.newWeight > indicator.currentWeight 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-orange-600 dark:text-orange-400'
                                }`}>
                                  Change: {indicator.newWeight > indicator.currentWeight ? '+' : ''}
                                  {(indicator.newWeight - indicator.currentWeight).toFixed(3)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 min-w-0">
                            <Label htmlFor={`weight-${indicator.id}`} className="text-xs whitespace-nowrap">
                              Weight:
                            </Label>
                            <div className="space-y-1">
                              <Input
                                id={`weight-${indicator.id}`}
                                type="number"
                                min="0.001"
                                max="1.000"
                                step="0.001"
                                value={indicator.inputValue}
                                onChange={(e) => updateIndicatorInputValue(indicator.id, e.target.value)}
                                onBlur={(e) => handleInputBlur(indicator.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleInputBlur(indicator.id, e.currentTarget.value);
                                    e.currentTarget.blur();
                                  }
                                }}
                                className={`w-24 text-xs font-mono text-right transition-colors ${
                                  !indicator.isInputValid 
                                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200 dark:border-red-700 dark:bg-red-950/20' 
                                    : ''
                                }`}
                                placeholder="0.001"
                              />
                              {!indicator.isInputValid && indicator.inputValue && (
                                <div className="text-xs text-red-500 dark:text-red-400">
                                  Range: 0.001-1.000
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <Separator />

        <SheetFooter className="pt-6 px-6">
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="w-full sm:w-auto min-w-[120px]"
            >
              Cancel
            </Button>
            <Button
              onClick={saveWeightChanges}
              disabled={!isValid || isSaving || indicators.length === 0}
              className="w-full sm:w-auto min-w-[180px]"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Weight Distribution
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}