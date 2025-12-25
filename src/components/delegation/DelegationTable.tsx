import { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkloadBar } from './WorkloadBar';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import type { PersonWorkload } from '@/hooks/useDelegation';

interface DelegationTableProps {
  data: PersonWorkload[];
  departmentFilter: string;
  priorityFilter: string;
  statusFilter: string;
}

export function DelegationTable({ data, departmentFilter, priorityFilter, statusFilter }: DelegationTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Apply filters
  let filteredData = data;

  if (departmentFilter && departmentFilter !== 'all') {
    filteredData = filteredData.filter(p => p.department === departmentFilter);
  }

  if (priorityFilter && priorityFilter !== 'all') {
    filteredData = filteredData.filter(p => {
      if (priorityFilter === 'high') return p.highPriorityCount > 0;
      if (priorityFilter === 'medium') return p.mediumPriorityCount > 0;
      if (priorityFilter === 'low') return p.lowPriorityCount > 0;
      return true;
    });
  }

  if (statusFilter && statusFilter !== 'all') {
    filteredData = filteredData.filter(p => {
      return p.initiatives.some(i => i.status === statusFilter);
    });
  }

  // Sort by workload score descending
  filteredData = [...filteredData].sort((a, b) => b.workloadScore - a.workloadScore);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-center">Active</TableHead>
            <TableHead className="text-center">Completed</TableHead>
            <TableHead className="text-center">Priority Mix</TableHead>
            <TableHead className="text-center">Risk</TableHead>
            <TableHead>Workload</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                No people with initiatives found.
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((person) => (
              <>
                <TableRow
                  key={person.id}
                  className={cn(
                    'cursor-pointer hover:bg-muted/50',
                    person.workloadCategory === 'overloaded' && 'bg-destructive/5',
                    person.workloadCategory === 'warning' && 'bg-yellow-500/5'
                  )}
                  onClick={() => toggleRow(person.id)}
                >
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      {expandedRows.has(person.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{person.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{person.department || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{person.roleTitle || '—'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{person.activeInitiatives}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{person.completedInitiatives}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      {person.highPriorityCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          H:{person.highPriorityCount}
                        </Badge>
                      )}
                      {person.mediumPriorityCount > 0 && (
                        <Badge variant="default" className="text-xs">
                          M:{person.mediumPriorityCount}
                        </Badge>
                      )}
                      {person.lowPriorityCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          L:{person.lowPriorityCount}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      {person.redHealthCount > 0 && (
                        <div className="flex items-center gap-1 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{person.redHealthCount}</span>
                        </div>
                      )}
                      {person.amberHealthCount > 0 && (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">{person.amberHealthCount}</span>
                        </div>
                      )}
                      {person.redHealthCount === 0 && person.amberHealthCount === 0 && (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <WorkloadBar
                      score={person.workloadScore}
                      category={person.workloadCategory}
                      highPriority={person.highPriorityCount}
                      mediumPriority={person.mediumPriorityCount}
                      lowPriority={person.lowPriorityCount}
                      blocked={person.blockedCount}
                      overdue={person.overdueCount}
                    />
                  </TableCell>
                </TableRow>
                
                {/* Expanded Row - Initiative List */}
                {expandedRows.has(person.id) && (
                  <TableRow>
                    <TableCell colSpan={9} className="bg-muted/30 p-0">
                      <div className="p-4">
                        <h4 className="text-sm font-semibold mb-3">Initiatives</h4>
                        <div className="space-y-2">
                          {person.initiatives.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No initiatives assigned.</p>
                          ) : (
                            person.initiatives.map((init) => (
                              <div
                                key={init.id}
                                className="flex items-center justify-between p-2 bg-background rounded border cursor-pointer hover:bg-muted/50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/initiatives?search=${encodeURIComponent(init.title)}`);
                                }}
                              >
                                <div className="flex-1">
                                  <span className="font-medium text-sm">{init.title}</span>
                                  {init.product_name && (
                                    <span className="text-muted-foreground text-xs ml-2">
                                      ({init.product_name})
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      init.priority_level === 'high' ? 'destructive' :
                                      init.priority_level === 'medium' ? 'default' : 'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {init.priority_level}
                                  </Badge>
                                  <Badge
                                    variant={
                                      init.status === 'blocked' ? 'destructive' :
                                      init.status === 'delivered' ? 'outline' : 'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {init.status.replace('_', ' ')}
                                  </Badge>
                                  {init.health_status && (
                                    <div className={cn(
                                      'h-2 w-2 rounded-full',
                                      init.health_status === 'green' && 'bg-green-500',
                                      init.health_status === 'amber' && 'bg-yellow-500',
                                      init.health_status === 'red' && 'bg-destructive'
                                    )} />
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
