'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Competency } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Target, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Separator } from '@/components/ui/separator';
import EntityTable from './Table';

interface CompetencyTableProps {
  competencies: Competency[];
}

const CompetencyTable: React.FC<CompetencyTableProps> = ({ competencies }) => {
  const competencyColumns: ColumnDef<Competency>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="link"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4 text-muted-foreground"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const competency = row.original;
        const indicatorCount = competency.behavioralIndicators?.length || 0;
        const formatDate = (dateString: string) => {
          return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        };

        return (
          <HoverCard openDelay={300} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Link 
                href={`/hr/competencies/${competency.id}`} 
                className="font-medium text-primary hover:underline cursor-pointer"
              >
                {competency.name}
              </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-80" align="start">
              <div className="space-y-3">
                {/* Header */}
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold leading-none">
                    {competency.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge 
                      variant={competency.isActive ? 'default' : 'secondary'}
                      className="h-5 text-xs"
                    >
                      {competency.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span>•</span>
                    <span>Version {competency.version}</span>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                {competency.description && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {competency.description.length > 120 
                        ? `${competency.description.substring(0, 120)}...` 
                        : competency.description
                      }
                    </p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Category</span>
                    </div>
                    <p className="font-medium">{competency.category}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Indicators</span>
                    </div>
                    <p className="font-medium">
                      {indicatorCount} indicator{indicatorCount !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Updated</span>
                    </div>
                    <p className="font-medium">{formatDate(competency.lastModified)}</p>
                  </div>
                </div>

                {/* Standard Codes */}
                {competency.standardCodes && Object.keys(competency.standardCodes).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Standard Codes</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(competency.standardCodes).map(([key, mapping]) => {
                          if (!mapping) return null;
                          // Handle different mapping types
                          let displayValue: string;
                          if (typeof mapping === 'string') {
                            // BigFiveCategory is a string
                            displayValue = mapping;
                          } else if (typeof mapping === 'object') {
                            // Object types: OnetReference, EscoReference, or legacy StandardCodeMapping
                            const obj = mapping as unknown as Record<string, unknown>;
                            if ('code' in obj && typeof obj.code === 'string') {
                              displayValue = obj.code;
                            } else if ('uri' in obj) {
                              displayValue = (obj.label as string) || (obj.uri as string);
                            } else if ('name' in obj && typeof obj.name === 'string') {
                              displayValue = obj.name;
                            } else {
                              displayValue = JSON.stringify(mapping);
                            }
                          } else {
                            displayValue = String(mapping);
                          }
                          return (
                            <Badge 
                              key={key} 
                              variant="outline" 
                              className="h-5 text-xs"
                            >
                              {key}: {displayValue}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'behavioralIndicators',
      header: 'Indicators',
      cell: ({ row }) => row.original.behavioralIndicators?.length || 0,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
  ];

  return <EntityTable columns={competencyColumns} data={competencies} />;
};

export default CompetencyTable;
