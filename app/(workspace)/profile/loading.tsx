import { Card, CardContent } from '@/components/ui/card';
import { IdentitySectionSkeleton } from './_components/IdentitySection';
import { PropertiesSectionSkeleton } from './_components/PropertiesSection';
import { SkillsSectionSkeleton } from './_components/SkillsSection';
import { PersonalitySectionSkeleton } from './_components/PersonalitySection';
import { ResultsSectionSkeleton } from './_components/ResultsSection';

/**
 * Profile Page Loading State
 *
 * Displays skeleton UI matching the flat card layout
 * while the page data is being fetched.
 */
export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-3">
          <Card className="gap-0 py-0 rounded-lg shadow-none">
            <CardContent><IdentitySectionSkeleton /></CardContent>
          </Card>
          <Card className="gap-0 py-0 rounded-lg shadow-none">
            <CardContent><PropertiesSectionSkeleton /></CardContent>
          </Card>
          <Card className="gap-0 py-0 rounded-lg shadow-none">
            <CardContent><SkillsSectionSkeleton /></CardContent>
          </Card>
          <Card className="gap-0 py-0 rounded-lg shadow-none">
            <CardContent><PersonalitySectionSkeleton /></CardContent>
          </Card>
          <Card className="gap-0 py-0 rounded-lg shadow-none">
            <CardContent><ResultsSectionSkeleton /></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
