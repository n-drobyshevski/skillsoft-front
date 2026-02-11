/**
 * Team Management Types
 *
 * Types for team management functionality.
 * Note: These are distinct from the Team/TeamProfile types in domain.ts
 * which are used for test template configuration.
 */

export enum TeamStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum TeamMemberRole {
  LEADER = 'LEADER',
  MEMBER = 'MEMBER',
}

// ============================================
// USER SUMMARY (lightweight for team context)
// ============================================

export interface TeamUserSummary {
  id: string;
  clerkId: string;
  fullName: string;
  email?: string;
  imageUrl?: string;
}

// ============================================
// TEAM MEMBER
// ============================================

export interface ManagedTeamMember {
  userId: string;
  clerkId: string;
  fullName: string;
  email: string;
  imageUrl?: string;
  role: TeamMemberRole;
  joinedAt: string;
  isActive: boolean;
}

// ============================================
// TEAM (Management)
// ============================================

export interface ManagedTeamSummary {
  id: string;
  name: string;
  description?: string;
  status: TeamStatus;
  leader?: TeamUserSummary;
  memberCount: number;
  createdAt: string;
}

export interface ManagedTeam {
  id: string;
  name: string;
  description?: string;
  status: TeamStatus;
  leader?: TeamUserSummary;
  createdBy: TeamUserSummary;
  members: ManagedTeamMember[];
  memberCount: number;
  createdAt: string;
  activatedAt?: string;
  archivedAt?: string;
}

// ============================================
// TEAM PROFILE (for TEAM_FIT assessments)
// ============================================

export interface TeamMemberProfileSummary {
  userId: string;
  name: string;
  role: string;
}

export interface CompetencySaturation {
  competencyId: string;
  saturation: number;
}

export interface SkillGap {
  competencyId: string;
  currentSaturation: number;
}

export interface ManagedTeamProfile {
  teamId: string;
  teamName: string;
  members: TeamMemberProfileSummary[];
  competencySaturation: CompetencySaturation[];
  averagePersonality: Record<string, number>;
  skillGaps: SkillGap[];
}

// ============================================
// REQUEST / RESPONSE TYPES
// ============================================

export interface CreateTeamRequest {
  name: string;
  description?: string;
  memberIds?: string[];
  leaderId?: string;
  activateImmediately?: boolean;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
}

export interface AddMembersRequest {
  userIds: string[];
}

export interface SetLeaderRequest {
  leaderId: string | null;
}

// ============================================
// RESULT TYPES
// ============================================

export interface ActivationResult {
  success: boolean;
  activatedAt?: string;
  errors: string[];
}

export interface MemberAdditionResult {
  addedMembers: string[];
  failures: string[];
  hasErrors: boolean;
}

export interface LeaderChangeResult {
  success: boolean;
  previousLeaderId?: string;
  newLeaderId?: string;
}

export interface FitScoreResult {
  fitScore: number;
}

// ============================================
// TEAM STATISTICS
// ============================================

export interface TeamStats {
  totalTeams: number;
  draftTeams: number;
  activeTeams: number;
  archivedTeams: number;
}

// ============================================
// PAGINATION
// ============================================

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getTeamStatusKey(status: TeamStatus): 'draft' | 'active' | 'archived' {
  switch (status) {
    case TeamStatus.DRAFT:
      return 'draft';
    case TeamStatus.ACTIVE:
      return 'active';
    case TeamStatus.ARCHIVED:
      return 'archived';
  }
}

export function getTeamStatusBadgeVariant(status: TeamStatus): 'default' | 'success' | 'secondary' {
  switch (status) {
    case TeamStatus.DRAFT:
      return 'default';
    case TeamStatus.ACTIVE:
      return 'success';
    case TeamStatus.ARCHIVED:
      return 'secondary';
  }
}

export function getMemberRoleBadgeVariant(role: TeamMemberRole): 'default' | 'outline' {
  switch (role) {
    case TeamMemberRole.LEADER:
      return 'default';
    case TeamMemberRole.MEMBER:
      return 'outline';
  }
}

export function getTeamMemberInitials(member: ManagedTeamMember | TeamMemberProfileSummary): string {
  const name = 'fullName' in member ? member.fullName : member.name;
  if (!name) return '??';

  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function formatSaturation(saturation: number): string {
  return `${Math.round(saturation * 100)}%`;
}

export function getSaturationColor(saturation: number): string {
  if (saturation >= 0.7) return 'text-green-600 dark:text-green-400';
  if (saturation >= 0.4) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}
