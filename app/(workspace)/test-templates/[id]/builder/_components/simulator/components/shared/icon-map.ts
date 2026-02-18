import {
  LineChart,
  BarChart3,
  SlidersHorizontal,
  HelpCircle,
  Lightbulb,
  Briefcase,
  Users,
  LayoutGrid,
  CheckSquare,
  GitCompareArrows,
  Radar,
  FileCheck,
} from 'lucide-react';
import type React from 'react';

export const ICON_MAP: Record<string, React.ElementType> = {
  LineChart,
  BarChart3,
  SlidersHorizontal,
  HelpCircle,
  Lightbulb,
  Briefcase,
  Users,
  LayoutGrid,
  CheckSquare,
  GitCompareArrows,
  Radar,
  FileCheck,
};

export function getIcon(iconName: string): React.ElementType {
  return ICON_MAP[iconName] ?? HelpCircle;
}
