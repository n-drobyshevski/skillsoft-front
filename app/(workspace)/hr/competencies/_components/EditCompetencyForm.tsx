'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { competencySchema } from '../validation';
import { Competency } from '@/types/domain';
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
import { CompetencyCategory, ApprovalStatus } from '@/types/domain';
import { updateCompetencyAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { StandardsSearchCombobox } from '@/components/common/standards-search-combobox';
import { loadAllSkills } from '@/lib/skill-data-loader';
import type { UnifiedSkill } from '@/types/skills';
import { Globe2, Layers, FileText, Tag, Settings, Loader2 } from 'lucide-react';

type CompetencyFormValues = z.infer<typeof competencySchema>;

export function EditCompetencyForm({ competency }: { competency: Competency }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<UnifiedSkill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);

  // Load skills on mount
  useEffect(() => {
    const loadSkills = async () => {
      setIsLoadingSkills(true);
      try {
        const allSkills = await loadAllSkills();
        setSkills(allSkills);
      } catch {
        // Silently handle - combobox will show "no skills" state
      } finally {
        setIsLoadingSkills(false);
      }
    };
    loadSkills();
  }, []);

  const form = useForm<CompetencyFormValues>({
    resolver: zodResolver(competencySchema),
    defaultValues: {
      name: competency.name,
      description: competency.description || '',
      category: competency.category,
      isActive: competency.isActive,
      approvalStatus: competency.approvalStatus,
      standardCodes: competency.standardCodes || undefined,
    },
  });

  async function onSubmit(data: CompetencyFormValues) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updateCompetencyAction(competency.id, data);
      if (result.success) {
        toast.success('Competency updated successfully');
        router.push(`/hr/competencies/${competency.id}`);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'An error occurred.';
      setError(message);
      toast.error('Failed to update competency');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-muted/40 border-b">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Basic Information</h3>
              <p className="text-sm text-muted-foreground">Name and description of the competency</p>
            </div>
          </div>
          <div className="p-5 space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Competency name" {...field} />
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
                  <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="A detailed description of the competency and what it measures..." 
                      className="min-h-24 resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Classification Section */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-muted/40 border-b">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Classification</h3>
              <p className="text-sm text-muted-foreground">Category and status</p>
            </div>
          </div>
          <div className="p-5 grid md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              name="approvalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approval Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
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
          </div>
        </div>

        {/* Standard Mapping Section */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-muted/40 border-b">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Standard Mapping</h3>
              <p className="text-sm text-muted-foreground">Link to O*NET, ESCO, or Big Five personality</p>
            </div>
          </div>
          <div className="p-5">
            <FormField
              control={form.control}
              name="standardCodes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Layers className="h-4 w-4 mr-1" />
                    Standards Reference
                  </FormLabel>
                  <FormControl>
                    <StandardsSearchCombobox
                      skills={skills}
                      isLoading={isLoadingSkills}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Map this competency to established frameworks for standardized assessment alignment.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Active Status Section */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-muted/40 border-b">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Settings</h3>
              <p className="text-sm text-muted-foreground">Availability and visibility</p>
            </div>
          </div>
          <div className="p-5">
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
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
