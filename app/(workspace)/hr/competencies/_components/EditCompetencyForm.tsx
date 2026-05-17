'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { competencySchema } from '../validation';
import { Competency } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { StandardCodesErrors } from './StandardCodesErrors';
import { loadAllSkills } from '@/lib/skill-data-loader';
import type { UnifiedSkill } from '@/types/skills';
import { Loader2 } from 'lucide-react';

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {/* Basic Information Section */}
        <Card className="gap-0 py-0 rounded-lg shadow-none">
          <CardContent>
            <section className="py-6" role="region" aria-label="Basic Information">
              <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Basic Information
              </h2>
              <p className="text-xs text-muted-foreground mt-1 mb-5">Name and description of the competency</p>
              <div className="space-y-5">
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
            </section>
          </CardContent>
        </Card>

        {/* Classification Section */}
        <Card className="gap-0 py-0 rounded-lg shadow-none">
          <CardContent>
            <section className="py-6" role="region" aria-label="Classification">
              <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Classification
              </h2>
              <p className="text-xs text-muted-foreground mt-1 mb-5">Category and status</p>
              <div className="grid md:grid-cols-2 gap-5">
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
            </section>
          </CardContent>
        </Card>

        {/* Standard Mapping Section */}
        <Card className="gap-0 py-0 rounded-lg shadow-none">
          <CardContent>
            <section className="py-6" role="region" aria-label="Standard Mapping">
              <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Standard Mapping
              </h2>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Link to O*NET, ESCO, or Big Five personality</p>
              <FormField
                control={form.control}
                name="standardCodes"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormControl>
                      <StandardsSearchCombobox
                        skills={skills}
                        isLoading={isLoadingSkills}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                    <StandardCodesErrors errors={form.formState.errors.standardCodes} />
                  </FormItem>
                )}
              />
            </section>
          </CardContent>
        </Card>

        {/* Active Status Section */}
        <Card className="gap-0 py-0 rounded-lg shadow-none">
          <CardContent>
            <section className="py-6" role="region" aria-label="Settings">
              <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Settings
              </h2>
              <p className="text-xs text-muted-foreground mt-1 mb-5">Availability and visibility</p>
              <div>
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
            </section>
          </CardContent>
        </Card>

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
