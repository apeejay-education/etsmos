import { useState, useMemo } from 'react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchFilter } from '@/components/filters/SearchFilter';
import { SortButton, SortDirection, SortOption } from '@/components/filters/SortButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Filter, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const sortOptions: SortOption[] = [
  { label: 'Date', value: 'changed_at' },
  { label: 'Table', value: 'table_name' },
  { label: 'Action', value: 'action' },
];

const tableLabels: Record<string, string> = {
  products: 'Products',
  initiatives: 'Initiatives',
  execution_signals: 'Execution Signals',
  people: 'People',
  contributions: 'Contributions',
  monthly_snapshots: 'Monthly Snapshots',
};

export default function AuditTrail() {
  const { data: logs, isLoading } = useAuditLogs();
  const [search, setSearch] = useState('');
  const [tableFilter, setTableFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [sortBy, setSortBy] = useState<string | null>('changed_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedLog, setSelectedLog] = useState<typeof logs extends (infer T)[] ? T : never | null>(null);

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    
    let result = logs.filter((log) => {
      if (tableFilter !== 'all' && log.table_name !== tableFilter) return false;
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        const userName = log.profiles?.full_name || log.profiles?.email || '';
        const tableName = tableLabels[log.table_name] || log.table_name;
        if (
          !tableName.toLowerCase().includes(searchLower) &&
          !userName.toLowerCase().includes(searchLower) &&
          !log.action.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      return true;
    });

    if (sortBy && sortDirection) {
      result = [...result].sort((a, b) => {
        let aVal = a[sortBy as keyof typeof a];
        let bVal = b[sortBy as keyof typeof b];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return 0;
      });
    }

    return result;
  }, [logs, search, tableFilter, actionFilter, sortBy, sortDirection]);

  const handleSort = (field: string, direction: SortDirection) => {
    setSortBy(direction ? field : null);
    setSortDirection(direction);
  };

  const actionColors: Record<string, string> = {
    INSERT: 'bg-green-100 text-green-800',
    UPDATE: 'bg-blue-100 text-blue-800',
    DELETE: 'bg-red-100 text-red-800',
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
          <p className="text-muted-foreground">
            Track all changes with timestamps and user attribution
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <SearchFilter
            value={search}
            onChange={setSearch}
            placeholder="Search logs..."
          />
          <div className="flex gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                {Object.entries(tableLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="INSERT">Insert</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
              </SelectContent>
            </Select>
            <SortButton
              options={sortOptions}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No audit logs found</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Changed By</TableHead>
                  <TableHead className="w-20">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(log.changed_at), 'MMM d, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      {tableLabels[log.table_name] || log.table_name}
                    </TableCell>
                    <TableCell>
                      <Badge className={actionColors[log.action]}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.profiles?.full_name || log.profiles?.email || 'System'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedLog?.action} on {tableLabels[selectedLog?.table_name || ''] || selectedLog?.table_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Record ID: <span className="font-mono">{selectedLog?.record_id}</span></p>
                <p>Changed at: {selectedLog && format(new Date(selectedLog.changed_at), 'PPpp')}</p>
                <p>Changed by: {selectedLog?.profiles?.full_name || selectedLog?.profiles?.email || 'System'}</p>
              </div>
              
              {selectedLog?.action === 'UPDATE' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Before</h4>
                    <ScrollArea className="h-64 rounded border p-3 bg-muted/50">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.old_data, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">After</h4>
                    <ScrollArea className="h-64 rounded border p-3 bg-muted/50">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.new_data, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              )}

              {selectedLog?.action === 'INSERT' && (
                <div>
                  <h4 className="font-medium mb-2">New Data</h4>
                  <ScrollArea className="h-64 rounded border p-3 bg-muted/50">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.new_data, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}

              {selectedLog?.action === 'DELETE' && (
                <div>
                  <h4 className="font-medium mb-2">Deleted Data</h4>
                  <ScrollArea className="h-64 rounded border p-3 bg-muted/50">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.old_data, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
