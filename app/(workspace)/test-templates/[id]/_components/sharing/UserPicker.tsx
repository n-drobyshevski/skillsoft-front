'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Search, User as UserIcon, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usersApi } from '@/services/api';
import type { User } from '@/types/user';

interface UserPickerProps {
  /** Currently selected user email (for display) */
  value?: string;
  /** Callback when user is selected */
  onSelect: (user: User) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional className */
  className?: string;
  /** Users to exclude from search (e.g., already shared) */
  excludeEmails?: string[];
}

/**
 * UserPicker - Responsive searchable user selector
 *
 * Features:
 * - Desktop: Popover with Command search
 * - Mobile: Drawer (bottom sheet) with Command search
 * - Debounced search query
 * - Avatar display with fallback initials
 * - 44px touch targets on mobile
 *
 * @example
 * ```tsx
 * <UserPicker
 *   value={selectedEmail}
 *   onSelect={(user) => handleShare(user)}
 *   excludeEmails={alreadySharedEmails}
 * />
 * ```
 */
export function UserPicker({
  value,
  onSelect,
  placeholder = 'Search users...',
  disabled = false,
  className,
  excludeEmails = [],
}: UserPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { isMobileOrTablet, isHydrated } = useBreakpoint();

  // Search users query
  const {
    data: users = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: () => usersApi.searchUsers(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000, // 30 seconds
  });

  // Filter out excluded emails
  const filteredUsers = React.useMemo(() => {
    const excludeSet = new Set(excludeEmails.map((e) => e.toLowerCase()));
    return users.filter(
      (user) => user.email && !excludeSet.has(user.email.toLowerCase())
    );
  }, [users, excludeEmails]);

  const handleSelect = (user: User) => {
    onSelect(user);
    setOpen(false);
    setSearchQuery('');
  };

  // Get display name for user
  const getDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email || user.username || 'Unknown User';
  };

  // Get initials for avatar
  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Shared command content
  const commandContent = (
    <Command shouldFilter={false} className="w-full">
      <CommandInput
        placeholder={placeholder}
        value={searchQuery}
        onValueChange={setSearchQuery}
        className={cn(
          // Mobile: larger input, prevent iOS zoom
          isMobileOrTablet && 'h-12 text-base'
        )}
      />
      <CommandList className={cn(isMobileOrTablet && 'max-h-[50vh]')}>
        {isLoading || isFetching ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : searchQuery.length < 2 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Type at least 2 characters to search
          </div>
        ) : filteredUsers.length === 0 ? (
          <CommandEmpty>No users found</CommandEmpty>
        ) : (
          <CommandGroup>
            {filteredUsers.map((user) => (
              <CommandItem
                key={user.id}
                value={user.email || user.id}
                onSelect={() => handleSelect(user)}
                className={cn(
                  'flex items-center gap-3 cursor-pointer',
                  // Mobile: larger touch target
                  isMobileOrTablet && 'min-h-[48px] py-3'
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.imageUrl} alt={getDisplayName(user)} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {getDisplayName(user)}
                  </div>
                  {user.email && (
                    <div className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </div>
                  )}
                </div>
                {value === user.email && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );

  // Trigger button
  const triggerButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      disabled={disabled}
      className={cn(
        'w-full justify-between',
        // Mobile: larger touch target
        isMobileOrTablet && 'h-12 text-base',
        className
      )}
    >
      <span className="flex items-center gap-2 truncate">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground truncate">
          {value || placeholder}
        </span>
      </span>
      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  // SSR: Default to desktop Popover
  if (!isHydrated) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start">
          {commandContent}
        </PopoverContent>
      </Popover>
    );
  }

  // Desktop: Popover
  if (!isMobileOrTablet) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start">
          {commandContent}
        </PopoverContent>
      </Popover>
    );
  }

  // Mobile/Tablet: Drawer (bottom sheet)
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left pb-0">
          <DrawerTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Find User
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 pt-2">{commandContent}</div>
      </DrawerContent>
    </Drawer>
  );
}

/**
 * Compact user picker for inline forms
 * Just the input with search - no dropdown trigger
 */
interface UserSearchInputProps {
  /** Callback when user is selected */
  onSelect: (user: User) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional className */
  className?: string;
  /** Users to exclude */
  excludeEmails?: string[];
  /** Mobile variant for larger touch targets */
  isMobile?: boolean;
}

export function UserSearchInput({
  onSelect,
  placeholder = 'Enter email address',
  disabled = false,
  className,
  excludeEmails = [],
  isMobile = false,
}: UserSearchInputProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showResults, setShowResults] = React.useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const {
    data: users = [],
    isLoading,
  } = useQuery({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: () => usersApi.searchUsers(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  // Filter out excluded emails
  const filteredUsers = React.useMemo(() => {
    const excludeSet = new Set(excludeEmails.map((e) => e.toLowerCase()));
    return users.filter(
      (user) => user.email && !excludeSet.has(user.email.toLowerCase())
    );
  }, [users, excludeEmails]);

  const handleSelect = (user: User) => {
    onSelect(user);
    setSearchQuery('');
    setShowResults(false);
  };

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Command shouldFilter={false} className="rounded-lg border">
        <CommandInput
          placeholder={placeholder}
          value={searchQuery}
          onValueChange={(value) => {
            setSearchQuery(value);
            setShowResults(value.length >= 2);
          }}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          disabled={disabled}
          className={cn(
            'border-0',
            isMobile && 'h-12 text-base'
          )}
        />
      </Command>

      {/* Results dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="max-h-[200px] overflow-auto py-1">
              {filteredUsers.slice(0, 5).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user)}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2 text-left',
                    'hover:bg-accent cursor-pointer',
                    isMobile && 'min-h-[48px]'
                  )}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.imageUrl} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                      {user.firstName?.[0] || user.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.email}
                    </div>
                    {user.firstName && user.email && (
                      <div className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
