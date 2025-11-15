'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { competencySchema } from '../validation';
import { Competency } from '../../interfaces/domain-interfaces';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CompetencyCategory, ProficiencyLevel, ApprovalStatus } from '../../enums/domain_enums';
import { competenciesApi } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from "sonner";

type CompetencyFormValues = z.infer<typeof competencySchema>;

export function CompetencyForm({ 
  competency, 
  onUpdatePreview,
  onCompetencyCreated 
}: { 
  competency?: Competency, 
  onUpdatePreview?: (data: CompetencyFormValues) => void,
  onCompetencyCreated?: (competency: Competency) => void
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!competency;

  const form = useForm<CompetencyFormValues>({
    resolver: zodResolver(competencySchema),
    defaultValues: {
      name: competency?.name || '',
      description: competency?.description || '',
      category: competency?.category || CompetencyCategory.LEADERSHIP,
      level: competency?.level || ProficiencyLevel.NOVICE,
      isActive: competency?.isActive || true,
      approvalStatus: competency?.approvalStatus || ApprovalStatus.DRAFT,
    },
  });

  async function onSubmit(data: CompetencyFormValues) {
    setIsLoading(true);
    try {
      if (isEditMode) {
        await competenciesApi.updateCompetency(competency.id, data);
        toast.success("Competency updated successfully!");
        router.push(`/competencies/${competency.id}`);
      } else {
        const newCompetency = await competenciesApi.createCompetency(data);
        toast.success("Competency created successfully!");
        
        // Call the callback if provided (for new competency page)
        if (onCompetencyCreated) {
          onCompetencyCreated(newCompetency);
        } else {
          // Default behavior - navigate to the competency page
          router.push(`/competencies/${newCompetency.id}`);
        }
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An error occurred.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePreviewClick = () => {
    if (onUpdatePreview) {
      onUpdatePreview(form.getValues());
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 pb-3">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Basic Information</h3>
              <p className="text-sm text-muted-foreground mt-1">Provide the name and description for this competency</p>
            </div>
            <div className="px-4 pb-4 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Strategic Leadership" 
                        className="h-9"
                        {...field}
                        onBlur={() => {
                          field.onBlur();
                          handlePreviewClick();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Description <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A detailed description of the competency"
                        className="min-h-20 resize-none"
                        {...field}
                        onBlur={() => {
                          field.onBlur();
                          handlePreviewClick();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Classification Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 pb-3">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Classification</h3>
              <p className="text-sm text-muted-foreground mt-1">Categorize and define the competency&apos;s properties</p>
            </div>
            <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Category</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handlePreviewClick();
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CompetencyCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Level</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handlePreviewClick();
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ProficiencyLevel).map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Status Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 pb-3">
              <h3 className="text-lg font-semibold leading-none tracking-tight">Status</h3>
            </div>
            <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="approvalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Approval Status</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handlePreviewClick();
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ApprovalStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <FormLabel className="text-sm font-medium">Active</FormLabel>
                    <div className="flex items-center space-x-2 h-9">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handlePreviewClick();
                          }}
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">
                        {field.value ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()} 
              disabled={isLoading}
              className="h-9"
            >
              Cancel
            </Button>
            {onUpdatePreview && (
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handlePreviewClick} 
                disabled={isLoading}
                className="h-9"
              >
                Update Preview
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-9"
            >
              {isLoading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Competency')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}