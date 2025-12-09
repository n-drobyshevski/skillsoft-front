'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Save, Loader2, Archive, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { updateTemplateMetadata, archiveTemplate, deleteTemplate } from '../../actions';

interface SettingsFormProps {
  templateId: string;
  name: string;
  description: string;
  status: string;
}

export function SettingsForm({ templateId, name, description, status }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name,
    description,
  });

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateTemplateMetadata(templateId, formData);
      if (result.success) {
        toast.success('Settings saved');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to save');
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      const result = await archiveTemplate(templateId);
      if (result.success) {
        toast.success('Template archived');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to archive');
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTemplate(templateId);
      // Redirect happens in the action
    });
  };

  const isArchived = status === 'ARCHIVED';

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Update template name and description. These can be changed even after publishing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter template name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter template description"
              rows={4}
            />
          </div>

          <Button onClick={handleSave} disabled={isPending} className="gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions. Please be careful.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Archive */}
          {!isArchived && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Archive Template</p>
                <p className="text-sm text-muted-foreground">
                  Hide this template from active use. Can be restored later.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Archive className="h-4 w-4" />
                    Archive
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Archive Template?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will hide the template from active use. Existing test sessions
                      will be preserved. You can restore it later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleArchive} disabled={isPending}>
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Archive
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          <Separator />

          {/* Delete */}
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div>
              <p className="font-medium text-destructive">Delete Template</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this template and all associated data.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Template Permanently?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    template and all associated test sessions and results.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isPending}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Delete Forever
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
