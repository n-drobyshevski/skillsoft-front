'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmationDialog } from '@/app/components/DeleteConfirmationDialog';
import { competenciesApi } from '@/services/api';
import { toast } from 'sonner';
import {
  Edit,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import { levelToColor, approvalStatusToColor } from '../../../utils';
import type { Competency } from '../../../interfaces/domain-interfaces';

interface CompetencyHeaderProps {
  competency: Competency;
}

export function CompetencyHeader({ competency }: CompetencyHeaderProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await competenciesApi.deleteCompetency(competency.id);
      toast.success('Competency deleted successfully');
      router.push('/competencies');
    } catch {
      toast.error('Failed to delete competency. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/competencies">
              <ArrowLeft className="w-4 h-4" />
              <span className="sr-only">Go back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {competency.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className={levelToColor(competency.level)}
              >
                {competency.level}
              </Badge>
              <Badge variant={competency.isActive ? "default" : "secondary"}>
                {competency.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge
                variant="outline"
                className={approvalStatusToColor(competency.approvalStatus)}
              >
                {competency.approvalStatus.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Link href={`/competencies/${competency.id}/edit`} passHref>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Competency"
        description="Are you sure you want to delete this competency? This will also delete all associated behavioral indicators and assessment questions."
        entityName={competency.name}
        isDeleting={isDeleting}
        confirmButtonText="Delete Competency"
      />
    </>
  );
}