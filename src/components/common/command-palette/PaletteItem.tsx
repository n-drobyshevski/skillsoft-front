import type { LucideIcon } from 'lucide-react';
import { CommandItem, CommandShortcut } from '@/components/ui/command';

interface PaletteItemProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  shortcut?: string;
  onSelect: () => void;
  value: string;
}

export function PaletteItem({
  icon: Icon,
  label,
  description,
  shortcut,
  onSelect,
  value,
}: PaletteItemProps) {
  return (
    <CommandItem
      value={value}
      onSelect={onSelect}
      className="min-h-[44px] sm:min-h-0"
    >
      <Icon className="mr-2 h-4 w-4 shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="truncate">{label}</span>
        {description && (
          <span className="truncate text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </div>
      {shortcut && <CommandShortcut>{shortcut}</CommandShortcut>}
    </CommandItem>
  );
}
