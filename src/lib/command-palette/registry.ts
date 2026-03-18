import type { LucideIcon } from 'lucide-react';
import {
  Home,
  FileText,
  ClipboardCheck,
  Target,
  Lightbulb,
  FileQuestion,
  Network,
  Activity,
  BarChart3,
  UsersRound,
  Settings,
  PlusCircle,
  User,
  History,
  AlertTriangle,
  Brain,
  Users,
} from 'lucide-react';
import type { LensType } from '@/store/lens-store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PaletteActionType = 'navigation' | 'quick-action';

export interface PaletteAction {
  id: string;
  type: PaletteActionType;
  labelKey: string;
  path: string;
  icon: LucideIcon;
  lenses: LensType[];
  keywords: string[];
  shortcut?: string;
}

// ---------------------------------------------------------------------------
// Navigation entries
// ---------------------------------------------------------------------------

export const NAVIGATION_ENTRIES: PaletteAction[] = [
  {
    id: 'nav-dashboard',
    type: 'navigation',
    labelKey: 'dashboard',
    path: '/dashboard',
    icon: Home,
    lenses: ['user', 'editor', 'admin'],
    keywords: ['home', 'overview', 'main'],
    shortcut: 'G D',
  },
  {
    id: 'nav-templates',
    type: 'navigation',
    labelKey: 'testTemplates',
    path: '/test-templates',
    icon: FileText,
    lenses: ['user', 'editor', 'admin'],
    keywords: ['tests', 'studio', 'catalog'],
    shortcut: 'G T',
  },
  {
    id: 'nav-my-tests',
    type: 'navigation',
    labelKey: 'myTests',
    path: '/my-tests',
    icon: ClipboardCheck,
    lenses: ['user'],
    keywords: ['activity', 'progress', 'assigned'],
  },
  {
    id: 'nav-competencies',
    type: 'navigation',
    labelKey: 'competencies',
    path: '/hr/competencies',
    icon: Target,
    lenses: ['editor', 'admin'],
    keywords: ['skills', 'hr', 'library'],
  },
  {
    id: 'nav-indicators',
    type: 'navigation',
    labelKey: 'indicators',
    path: '/hr/behavioral-indicators',
    icon: Lightbulb,
    lenses: ['editor', 'admin'],
    keywords: ['behavioral', 'hr', 'library'],
  },
  {
    id: 'nav-questions',
    type: 'navigation',
    labelKey: 'questions',
    path: '/hr/assessment-questions',
    icon: FileQuestion,
    lenses: ['editor', 'admin'],
    keywords: ['assessment', 'bank', 'hr', 'library'],
  },
  {
    id: 'nav-skill-mapper',
    type: 'navigation',
    labelKey: 'commandPalette.skillMapper',
    path: '/skill-mapper',
    icon: Network,
    lenses: ['editor', 'admin'],
    keywords: ['mapping', 'onet', 'esco', 'links'],
  },
  {
    id: 'nav-psychometrics',
    type: 'navigation',
    labelKey: 'commandPalette.psychometrics',
    path: '/psychometrics',
    icon: Activity,
    lenses: ['admin'],
    keywords: ['statistics', 'analysis', 'items'],
  },
  {
    id: 'nav-psych-flagged',
    type: 'navigation',
    labelKey: 'flagged',
    path: '/psychometrics/flagged',
    icon: AlertTriangle,
    lenses: ['admin'],
    keywords: ['attention', 'review', 'problems'],
  },
  {
    id: 'nav-psych-big-five',
    type: 'navigation',
    labelKey: 'commandPalette.bigFive',
    path: '/psychometrics/big-five',
    icon: Brain,
    lenses: ['admin'],
    keywords: ['personality', 'ocean', 'traits'],
  },
  {
    id: 'nav-results',
    type: 'navigation',
    labelKey: 'results',
    path: '/test-results',
    icon: BarChart3,
    lenses: ['user', 'editor', 'admin'],
    keywords: ['scores', 'reports', 'outcomes'],
  },
  {
    id: 'nav-users',
    type: 'navigation',
    labelKey: 'users',
    path: '/admin/users',
    icon: UsersRound,
    lenses: ['admin'],
    keywords: ['people', 'accounts', 'manage'],
  },
  {
    id: 'nav-teams',
    type: 'navigation',
    labelKey: 'teams',
    path: '/admin/teams',
    icon: Users,
    lenses: ['admin'],
    keywords: ['groups', 'departments'],
  },
  {
    id: 'nav-settings',
    type: 'navigation',
    labelKey: 'settings',
    path: '/settings',
    icon: Settings,
    lenses: ['admin'],
    keywords: ['preferences', 'config', 'system'],
  },
  {
    id: 'nav-profile',
    type: 'navigation',
    labelKey: 'profile',
    path: '/profile',
    icon: User,
    lenses: ['user', 'editor', 'admin'],
    keywords: ['account', 'me', 'personal'],
  },
  {
    id: 'nav-template-history',
    type: 'navigation',
    labelKey: 'history',
    path: '/test-templates/history',
    icon: History,
    lenses: ['editor', 'admin'],
    keywords: ['sessions', 'past', 'previous'],
  },
];

// ---------------------------------------------------------------------------
// Quick actions
// ---------------------------------------------------------------------------

export const QUICK_ACTIONS: PaletteAction[] = [
  {
    id: 'action-create-template',
    type: 'quick-action',
    labelKey: 'commandPalette.createNewTemplate',
    path: '/test-templates/new',
    icon: PlusCircle,
    lenses: ['editor', 'admin'],
    keywords: ['new', 'test', 'add'],
  },
  {
    id: 'action-create-competency',
    type: 'quick-action',
    labelKey: 'commandPalette.createCompetency',
    path: '/hr/competencies/new',
    icon: PlusCircle,
    lenses: ['editor', 'admin'],
    keywords: ['new', 'skill', 'add'],
  },
  {
    id: 'action-create-question',
    type: 'quick-action',
    labelKey: 'commandPalette.createQuestion',
    path: '/hr/assessment-questions/new',
    icon: PlusCircle,
    lenses: ['editor', 'admin'],
    keywords: ['new', 'assessment', 'add'],
  },
  {
    id: 'action-create-indicator',
    type: 'quick-action',
    labelKey: 'commandPalette.createIndicator',
    path: '/hr/behavioral-indicators/new',
    icon: PlusCircle,
    lenses: ['editor', 'admin'],
    keywords: ['new', 'behavioral', 'add'],
  },
  {
    id: 'action-create-team',
    type: 'quick-action',
    labelKey: 'commandPalette.createTeam',
    path: '/admin/teams/new',
    icon: PlusCircle,
    lenses: ['admin'],
    keywords: ['new', 'group', 'add'],
  },
  {
    id: 'action-create-user',
    type: 'quick-action',
    labelKey: 'commandPalette.createUser',
    path: '/admin/users/new',
    icon: PlusCircle,
    lenses: ['admin'],
    keywords: ['new', 'account', 'add', 'invite'],
  },
];
