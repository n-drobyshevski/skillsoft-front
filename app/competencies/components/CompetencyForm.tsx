'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { competencySchema } from '../validation';
import { Competency } from '../../interfaces/domain-interfaces';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Provide the name and description for this competency.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Competency name" 
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of the competency"
                      className="resize-none"
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Categorize and define the competency&apos;s properties.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handlePreviewClick();
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
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
                  <FormLabel>Level</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handlePreviewClick();
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a level" />
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
            <FormField
              control={form.control}
              name="approvalStatus"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Approval Status</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handlePreviewClick();
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="sm:max-w-sm">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ApprovalStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardContent>
            <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                        Set whether this competency is currently active and available.
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          handlePreviewClick();
                        }}
                        />
                    </FormControl>
                    </FormItem>
                )}
                />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end sm:space-x-4">
          {onUpdatePreview && (
            <Button type="button" variant="secondary" onClick={handlePreviewClick} disabled={isLoading} className="w-full sm:w-auto">
              Update Preview
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Competency')}
          </Button>
        </div>
      </form>
    </Form>
  );
}