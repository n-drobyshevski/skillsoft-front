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
  () => import('@/components/skill-mapper').then(mod => mod.SkillMapper),
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
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Search className="h-6 w-6" />
              Skill Mapper
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Client-side fuzzy search across ESCO and O*NET skill databases
            </p>
          </div>
          
          {/* Stats Cards */}
          {stats && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
                <Database className="h-3.5 w-3.5" />
                {stats.total.toLocaleString()} skills
              </Badge>
              <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                ESCO: {stats.esco.toLocaleString()}
              </Badge>
              <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                O*NET: {stats.onet.toLocaleString()}
              </Badge>
              <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
                <Layers className="h-3.5 w-3.5" />
                {stats.categories} categories
              </Badge>
              <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
                <Zap className="h-3.5 w-3.5" />
                Built in {stats.buildTimeMs}ms
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
      
      {/* Footer Info */}
      <div className="border-t bg-muted/30 px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              <strong>Tips:</strong> Use filters to narrow results • Click a skill for details
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Zero-latency search</span>
            <span>•</span>
            <span>No network calls</span>
            <span>•</span>
            <span>Powered by fuse.js</span>
          </div>
        </div>
      </div>
    </div>
  );
}
