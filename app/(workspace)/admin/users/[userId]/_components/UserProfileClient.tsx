"use client";

import { User } from "@/app/interfaces/user-interfaces";

interface UserProfileClientProps {
  user: User;
  children: React.ReactNode;
}

/**
 * Client component wrapper for user profile page.
 * Handles interactive elements and client-side state.
 * 
 * Future enhancements:
 * - Edit profile modal
 * - Ban/unban actions
 * - Role change confirmation
 * - Activity refresh
 */
export default function UserProfileClient({ 
  user, 
  children 
}: UserProfileClientProps) {
  // Future: Add state management for edit mode, modals, etc.
  
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
