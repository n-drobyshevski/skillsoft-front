/**
 * Skill Mapper Demo Page
 * 
 * Demonstrates the client-side fuzzy search engine for mapping skills.
 * This page uses static JSON data with zero network calls for search.
 * 
 * Performance Optimizations:
 * - Dynamic import with next/dynamic for code splitting
 * - Suspense loading state for better UX
 * - Deferred loading of heavy skill data
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getAllSkills, getSkillStats } from '@/lib/skill-data-loader';
import type { UnifiedSkill } from '@/types/skills';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Zap, Search, Layers } from 'lucide-react';

// Dynamic import with loading fallback for code splitting
// This splits SkillMapper into a separate chunk, reducing initial bundle size
const SkillMapper = dynamic(
  () => import('@/components/common/skill-mapper').then(mod => mod.SkillMapper),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false, // Disable SSR since this is a client-only component
  }
);

export default function SkillMapperPage() {
  const [skills, setSkills] = useState<UnifiedSkill[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    esco: number;
    onet: number;
    categories: number;
    buildTimeMs: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load skills on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const allSkills = getAllSkills();
        const skillStats = getSkillStats();
        
        setSkills(allSkills);
        setStats(skillStats);
      } catch {
        // Silently handle error - skills will be empty
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading Skill Database</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Processing ESCO and O*NET data...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header - Responsive padding and layout */}
      <div className="border-b bg-background px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Search className="h-5 w-5 sm:h-6 sm:w-6" />
              Skill Mapper
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Client-side fuzzy search across ESCO and O*NET databases
            </p>
          </div>
          
          {/* Stats Cards - Responsive grid on mobile, flex on larger screens */}
          {stats && (
            <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
              <Badge variant="outline" className="gap-1 py-1 px-2 sm:gap-1.5 sm:py-1.5 sm:px-3 text-xs justify-center">
                <Database className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span className="truncate">{stats.total.toLocaleString()} skills</span>
              </Badge>
              <Badge variant="secondary" className="gap-1 py-1 px-2 sm:gap-1.5 sm:py-1.5 sm:px-3 text-xs justify-center">
                <span className="truncate">ESCO: {stats.esco.toLocaleString()}</span>
              </Badge>
              <Badge variant="secondary" className="gap-1 py-1 px-2 sm:gap-1.5 sm:py-1.5 sm:px-3 text-xs justify-center">
                <span className="truncate">O*NET: {stats.onet.toLocaleString()}</span>
              </Badge>
              <Badge variant="outline" className="gap-1 py-1 px-2 sm:gap-1.5 sm:py-1.5 sm:px-3 text-xs justify-center">
                <Layers className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span className="truncate">{stats.categories} cats</span>
              </Badge>
              <Badge variant="outline" className="col-span-2 gap-1 py-1 px-2 sm:gap-1.5 sm:py-1.5 sm:px-3 text-xs justify-center">
                <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span className="truncate">Built in {stats.buildTimeMs}ms</span>
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content - Skill Mapper */}
      <div className="flex-1 overflow-hidden">
        <SkillMapper
          skills={skills}
          placeholder="Search for skills, competencies, abilities... (e.g., 'leadership', 'data analysis', 'communication')"
          className="h-full"
        />
      </div>
      
      {/* Footer Info - Responsive and mobile-friendly */}
      <div className="border-t bg-muted/30 px-3 py-2 sm:px-6 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline">
              <strong>Tips:</strong> Use filters to narrow results • Click a skill for details
            </span>
            <span className="sm:hidden">
              Tap filters to narrow • Tap skill for details
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
            <span>Zero-latency</span>
            <span>•</span>
            <span>No network</span>
            <span>•</span>
            <span>fuse.js</span>
          </div>
        </div>
      </div>
    </div>
  );
}
