'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmationDialog } from '@/components/feedback/DeleteConfirmationDialog';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Left section: Back button, title, badges */}
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 mt-0.5" asChild>
            <Link href={backHref}>
              <ArrowLeft className="w-4 h-4" />
              <span className="sr-only">Go back</span>
            </Link>
          </Button>
          <div className="min-w-0">
            {/* Title and badges inline on larger screens */}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight truncate">
                {title}
              </h1>
              <div className="hidden sm:flex items-center gap-1.5">
                {badges.slice(0, 3).map((badge, index) => (
                  <Badge
                    key={index}
                    variant={badge.variant || 'outline'}
                    className={`text-xs px-2 py-0.5 ${badge.className || ''}`}
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            )}
            {/* Mobile: Show all badges below */}
            <div className="flex sm:hidden items-center gap-1.5 mt-2 flex-wrap">
              {badges.map((badge, index) => (
                <Badge
                  key={index}
                  variant={badge.variant || 'outline'}
                  className={`text-xs px-2 py-0.5 ${badge.className || ''}`}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
            {/* Desktop: Show remaining badges if more than 3 */}
            {badges.length > 3 && (
              <div className="hidden sm:flex items-center gap-1.5 mt-1.5">
                {badges.slice(3).map((badge, index) => (
                  <Badge
                    key={index + 3}
                    variant={badge.variant || 'outline'}
                    className={`text-xs px-2 py-0.5 ${badge.className || ''}`}
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right section: Actions */}
        <div className="flex items-center gap-2 sm:shrink-0">
          {onDelete && deleteConfig && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="h-10 sm:h-8 min-w-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1.5">Delete</span>
            </Button>
          )}
          <Button size="sm" className="h-10 sm:h-8 min-w-11" asChild>
            <Link href={editHref}>
              <Edit className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1.5">Edit</span>
            </Link>
          </Button>
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