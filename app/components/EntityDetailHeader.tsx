'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { toast } from 'sonner';
import {
  Edit,
  ArrowLeft,
  Trash2,
} from 'lucide-react';

interface EntityDetailHeaderProps {
  title: string;
  subtitle?: string;
  badges: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
    className?: string;
  }>;
  backHref: string;
  editHref: string;
  onDelete?: () => Promise<void>;
  deleteConfig?: {
    title: string;
    description: string;
    entityName: string;
    confirmText?: string;
  };
}

export function EntityDetailHeader({
  title,
  subtitle,
  badges,
  backHref,
  editHref,
  onDelete,
  deleteConfig,
}: EntityDetailHeaderProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
      toast.success(`${deleteConfig?.title || 'Entity'} deleted successfully`);
      router.push(backHref.split('/').slice(0, -1).join('/') || backHref);
    } catch (error) {
      // Check if it's a 404 error (entity not found)
      if (error instanceof Error && error.message.includes('404')) {
        toast.error(`${deleteConfig?.title || 'Entity'} not found. It may have already been deleted.`);
        // Still redirect since the entity doesn't exist
        router.push(backHref.split('/').slice(0, -1).join('/') || backHref);
      } else {
        toast.error(`Failed to delete ${deleteConfig?.title?.toLowerCase() || 'entity'}. Please try again.`);
      }
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
            <Link href={backHref}>
              <ArrowLeft className="w-4 h-4" />
              <span className="sr-only">Go back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {badges.map((badge, index) => (
                <Badge
                  key={index}
                  variant={badge.variant || 'outline'}
                  className={badge.className}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onDelete && deleteConfig && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
          <Link href={editHref} passHref>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {deleteConfig && (
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          title={deleteConfig.title}
          description={deleteConfig.description}
          entityName={deleteConfig.entityName}
          isDeleting={isDeleting}
          confirmButtonText={deleteConfig.confirmText || `Delete ${deleteConfig.title}`}
        />
      )}
    </>
  );
}