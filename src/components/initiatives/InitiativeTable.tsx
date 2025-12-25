import { useNavigate } from 'react-router-dom';
import { Initiative, InitiativeStatus, PriorityLevel, SensitivityLevel, DeliveryWindow, ExecutionStage, HealthStatus, ExecutionSignal } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Circle, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { InlineEditCell } from '@/components/ui/inline-edit-cell';
import { useCurrentPersonContribution } from '@/hooks/useInitiativeAccess';

interface InitiativeWithProduct extends Omit<Initiative, 'products'> {
  products?: { name: string } | null;
}

interface InitiativeTableProps {
  initiatives: InitiativeWithProduct[];
  executionSignals?: Record<string, ExecutionSignal>;
  onEdit: (initiative: InitiativeWithProduct) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, field: string, value: string) => void;
  onUpdateSignal?: (initiativeId: string, signalId: string | null, field: string, value: string) => void;
  canEdit: boolean;
  isAdmin: boolean;
  currentUserId?: string;
}

const statusColors: Record<InitiativeStatus, string> = {
  approved: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  blocked: 'bg-red-100 text-red-800',
  delivered: 'bg-green-100 text-green-800',
  dropped: 'bg-gray-100 text-gray-800'
};

const priorityColors: Record<PriorityLevel, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-800'
};

const sensitivityColors: Record<SensitivityLevel, string> = {
  confidential: 'bg-purple-100 text-purple-800',
  internal: 'bg-blue-100 text-blue-800',
  routine: 'bg-gray-100 text-gray-800'
};

const healthColors: Record<HealthStatus, string> = {
  green: 'text-green-500',
  amber: 'text-amber-500',
  red: 'text-red-500'
};

const statusOptions = [
  { value: 'approved', label: 'Approved' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'dropped', label: 'Dropped' },
];

const priorityOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const sensitivityOptions = [
  { value: 'confidential', label: 'Confidential' },
  { value: 'internal', label: 'Internal' },
  { value: 'routine', label: 'Routine' },
];

const windowOptions = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'flexible', label: 'Flexible' },
];

const executionStageOptions = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
];

const healthStatusOptions = [
  { value: 'green', label: 'Green' },
  { value: 'amber', label: 'Amber' },
  { value: 'red', label: 'Red' },
];

const formatStatusLabel = (status: string) => status.replace('_', ' ');

function InitiativeRowWithAccess({ 
  initiative, 
  signal,
  onEdit, 
  onDelete, 
  onUpdate,
  onUpdateSignal,
  canEdit, 
  isAdmin 
}: {
  initiative: InitiativeWithProduct;
  signal?: ExecutionSignal;
  onEdit: (initiative: InitiativeWithProduct) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, field: string, value: string) => void;
  onUpdateSignal?: (initiativeId: string, signalId: string | null, field: string, value: string) => void;
  canEdit: boolean;
  isAdmin: boolean;
}) {
  const navigate = useNavigate();
  const { data: personData } = useCurrentPersonContribution(initiative.id);
  const isLead = personData?.contributionRole === 'lead';
  const canEditSignal = isAdmin || isLead;

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div>
          <InlineEditCell
            value={initiative.title}
            onSave={(value) => onUpdate(initiative.id, 'title', value)}
            canEdit={canEdit}
          />
          {initiative.context && (
            <p className="text-xs text-muted-foreground truncate max-w-48">
              {initiative.context}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>{initiative.products?.name || '-'}</TableCell>
      <TableCell>
        {canEdit ? (
          <InlineEditCell
            value={initiative.status}
            displayValue={formatStatusLabel(initiative.status)}
            onSave={(value) => onUpdate(initiative.id, 'status', value)}
            type="select"
            options={statusOptions}
            canEdit={canEdit}
            className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors[initiative.status]}`}
          />
        ) : (
          <Badge className={statusColors[initiative.status]}>
            {formatStatusLabel(initiative.status)}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        {canEdit ? (
          <InlineEditCell
            value={initiative.priority_level}
            displayValue={initiative.priority_level}
            onSave={(value) => onUpdate(initiative.id, 'priority_level', value)}
            type="select"
            options={priorityOptions}
            canEdit={canEdit}
            className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold capitalize ${priorityColors[initiative.priority_level]}`}
          />
        ) : (
          <Badge className={priorityColors[initiative.priority_level]}>
            {initiative.priority_level}
          </Badge>
        )}
      </TableCell>
      {/* Execution Signal Columns */}
      <TableCell>
        <div className="flex items-center gap-1">
          <Circle 
            className={`h-3 w-3 fill-current ${signal ? healthColors[signal.health_status] : 'text-muted-foreground'}`} 
          />
          {onUpdateSignal && signal ? (
            <InlineEditCell
              value={signal.health_status}
              displayValue={signal.health_status}
              onSave={(value) => onUpdateSignal(initiative.id, signal.id, 'health_status', value)}
              type="select"
              options={healthStatusOptions}
              canEdit={canEditSignal}
              className="capitalize text-xs"
            />
          ) : (
            <span className="text-xs text-muted-foreground capitalize">
              {signal?.health_status || '-'}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {onUpdateSignal && signal ? (
          <InlineEditCell
            value={signal.execution_stage}
            displayValue={formatStatusLabel(signal.execution_stage)}
            onSave={(value) => onUpdateSignal(initiative.id, signal.id, 'execution_stage', value)}
            type="select"
            options={executionStageOptions}
            canEdit={canEditSignal}
            className="capitalize text-xs"
          />
        ) : (
          <span className="text-xs text-muted-foreground capitalize">
            {signal ? formatStatusLabel(signal.execution_stage) : '-'}
          </span>
        )}
      </TableCell>
      <TableCell>
        {onUpdateSignal && signal ? (
          <InlineEditCell
            value={signal.risk_blocker_summary || ''}
            onSave={(value) => onUpdateSignal(initiative.id, signal.id, 'risk_blocker_summary', value)}
            canEdit={canEditSignal}
            className="text-xs max-w-32 truncate"
          />
        ) : (
          <span className="text-xs text-muted-foreground truncate max-w-32 block">
            {signal?.risk_blocker_summary || '-'}
          </span>
        )}
      </TableCell>
      <TableCell>
        <InlineEditCell
          value={initiative.accountable_owner || ''}
          onSave={(value) => onUpdate(initiative.id, 'accountable_owner', value)}
          canEdit={canEdit}
        />
      </TableCell>
      <TableCell>
        {canEdit ? (
          <InlineEditCell
            value={initiative.target_delivery_window}
            displayValue={initiative.target_delivery_window}
            onSave={(value) => onUpdate(initiative.id, 'target_delivery_window', value)}
            type="select"
            options={windowOptions}
            canEdit={canEdit}
            className="capitalize"
          />
        ) : (
          <span className="capitalize">{initiative.target_delivery_window}</span>
        )}
      </TableCell>
      <TableCell className={`text-sm ${
        initiative.tentative_delivery_date && new Date(initiative.tentative_delivery_date) < new Date() && initiative.status !== 'delivered' && initiative.status !== 'dropped'
          ? 'text-destructive font-medium'
          : 'text-muted-foreground'
      }`}>
        <InlineEditCell
          value={initiative.tentative_delivery_date || ''}
          displayValue={initiative.tentative_delivery_date 
            ? format(new Date(initiative.tentative_delivery_date), 'MMM d, yyyy')
            : '-'
          }
          onSave={(value) => onUpdate(initiative.id, 'tentative_delivery_date', value)}
          type="date"
          canEdit={canEdit}
        />
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(`/initiatives/${initiative.id}/resources`)}
            title="Manage Resources"
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEdit(initiative)}
            title={canEdit ? "Edit Initiative" : "View Initiative"}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {isAdmin && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(initiative.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function InitiativeTable({ 
  initiatives, 
  executionSignals = {},
  onEdit, 
  onDelete, 
  onUpdate, 
  onUpdateSignal,
  canEdit, 
  isAdmin 
}: InitiativeTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Health</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Risks/Blockers</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Target Window</TableHead>
            <TableHead>Target Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initiatives.map((initiative) => (
            <InitiativeRowWithAccess
              key={initiative.id}
              initiative={initiative}
              signal={executionSignals[initiative.id]}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onUpdateSignal={onUpdateSignal}
              canEdit={canEdit}
              isAdmin={isAdmin}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
