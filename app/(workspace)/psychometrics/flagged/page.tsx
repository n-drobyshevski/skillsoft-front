import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/common/PageHeader';
import { FlaggedItemSummary, DiscriminationFlag } from '@/types/psychometrics';
import { FlaggedItemsClient } from './_components/FlaggedItemsClient';
import { AlertTriangle, AlertCircle, XCircle } from 'lucide-react';
import { getPsychometricsFlaggedItemsCached } from '@/services/api.cache.psychometrics';

// PPR disabled - requires cacheComponents which is incompatible with Clerk
// export const experimental_ppr = true;

export const metadata: Metadata = {
  title: 'Flagged Items - Psychometrics - SkillSoft',
  description: 'Assessment items requiring attention and review.',
};

async function getFlaggedItems() {
  const items = await getPsychometricsFlaggedItemsCached();

  return {
    items: items ?? [],
    error: items === null ? 'Failed to load flagged items data' : null,
  };
}

// Group items by severity for stats
function getGroupCounts(items: FlaggedItemSummary[]) {
  const counts = {
    negative: 0,
    critical: 0,
    warning: 0,
    other: 0,
  };

  items.forEach((item) => {
    switch (item.discriminationFlag) {
      case DiscriminationFlag.NEGATIVE:
        counts.negative++;
        break;
      case DiscriminationFlag.CRITICAL:
        counts.critical++;
        break;
      case DiscriminationFlag.WARNING:
        counts.warning++;
        break;
      default:
        counts.other++;
    }
  });

  return counts;
}

export default async function FlaggedItemsPage() {
  const { items, error } = await getFlaggedItems();
  const counts = getGroupCounts(items);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:gap-8 md:p-6">
      <PageHeader
        title="Flagged Items"
        description="Assessment items requiring attention due to low psychometric indicators"
      />

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Negative</p>
                <p className="text-2xl font-bold text-red-600">{counts.negative}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-orange-600">{counts.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-amber-600">{counts.warning}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground opacity-30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <div className="text-destructive font-medium mb-1">Data Loading Error</div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Client component with batch selection */}
      {!error && <FlaggedItemsClient initialItems={items} />}
    </div>
  );
}
