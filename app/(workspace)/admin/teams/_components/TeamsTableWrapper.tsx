"use client";

import { ManagedTeamSummary } from "@/types/team";
import TeamsTable from "./TeamsTable";

interface TeamsTableWrapperProps {
  teams: ManagedTeamSummary[];
}

/**
 * Client wrapper for TeamsTable to prevent hydration mismatches.
 * Server-rendered HTML may differ from client due to browser state.
 */
export default function TeamsTableWrapper({ teams }: TeamsTableWrapperProps) {
  return <TeamsTable teams={teams} />;
}
