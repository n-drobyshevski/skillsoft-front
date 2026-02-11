"use client";

import dynamic from "next/dynamic";
import TableSkeleton from "@/components/data-display/TableSkeleton";
import type { User } from "@/types/user";

// Dynamic import with ssr: false to avoid hydration mismatch with Radix UI components
// This must be in a Client Component
const UsersTable = dynamic(() => import("./UsersTable"), {
  ssr: false,
  loading: () => <TableSkeleton />,
});

interface UsersTableWrapperProps {
  users: User[];
}

export default function UsersTableWrapper({ users }: UsersTableWrapperProps) {
  return <UsersTable users={users} />;
}
