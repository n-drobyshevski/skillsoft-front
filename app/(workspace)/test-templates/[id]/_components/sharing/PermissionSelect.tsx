'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Settings2 } from 'lucide-react';
import { SharePermission, getPermissionDisplayText } from '@/types/domain';
import { cn } from '@/lib/utils';

interface PermissionSelectProps {
  value: SharePermission;
  onChange: (value: SharePermission) => void;
  disabled?: boolean;
  maxPermission?: SharePermission;
  className?: string;
  size?: 'sm' | 'default';
}

const permissionConfig: Record<
  SharePermission,
  { icon: typeof Eye; color: string; bgColor: string }
> = {
  [SharePermission.VIEW]: {
    icon: Eye,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-950/50',
  },
  [SharePermission.EDIT]: {
    icon: Edit,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-950/50',
  },
  [SharePermission.MANAGE]: {
    icon: Settings2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-950/50',
  },
};

const permissionOrder: SharePermission[] = [
  SharePermission.VIEW,
  SharePermission.EDIT,
  SharePermission.MANAGE,
];

/**
 * PermissionSelect - Dropdown for selecting share permissions
 *
 * Features:
 * - Visual icons for each permission level
 * - Color-coded badges
 * - Optional max permission filtering
 * - Compact and default sizes
 */
export function PermissionSelect({
  value,
  onChange,
  disabled = false,
  maxPermission,
  className,
  size = 'default',
}: PermissionSelectProps) {
  const config = permissionConfig[value];
  const Icon = config.icon;

  // Filter available permissions based on maxPermission
  const availablePermissions = maxPermission
    ? permissionOrder.slice(0, permissionOrder.indexOf(maxPermission) + 1)
    : permissionOrder;

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          'gap-2',
          size === 'sm' ? 'h-8 text-xs' : 'h-10',
          className
        )}
      >
        <SelectValue>
          <div className="flex items-center gap-2">
            <Icon className={cn('h-3.5 w-3.5', config.color)} />
            <span>{getPermissionDisplayText(value)}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availablePermissions.map((permission) => {
          const permConfig = permissionConfig[permission];
          const PermIcon = permConfig.icon;
          return (
            <SelectItem
              key={permission}
              value={permission}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <PermIcon className={cn('h-3.5 w-3.5', permConfig.color)} />
                <span>{getPermissionDisplayText(permission)}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

interface PermissionBadgeProps {
  permission: SharePermission;
  className?: string;
  size?: 'sm' | 'default';
}

/**
 * PermissionBadge - Read-only display of permission level
 */
export function PermissionBadge({
  permission,
  className,
  size = 'default',
}: PermissionBadgeProps) {
  const config = permissionConfig[permission];
  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1.5 font-normal',
        config.bgColor,
        size === 'sm' ? 'text-xs px-1.5 py-0' : '',
        className
      )}
    >
      <Icon className={cn('h-3 w-3', config.color)} />
      <span className={config.color}>{getPermissionDisplayText(permission)}</span>
    </Badge>
  );
}
