import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortOption {
  label: string;
  value: string;
}

interface SortButtonProps {
  options: SortOption[];
  sortBy: string | null;
  sortDirection: SortDirection;
  onSort: (field: string, direction: SortDirection) => void;
}

export function SortButton({ options, sortBy, sortDirection, onSort }: SortButtonProps) {
  const currentOption = options.find((o) => o.value === sortBy);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      if (sortDirection === 'asc') {
        onSort(field, 'desc');
      } else if (sortDirection === 'desc') {
        onSort(field, null);
      } else {
        onSort(field, 'asc');
      }
    } else {
      onSort(field, 'asc');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {sortDirection === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : sortDirection === 'desc' ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4" />
          )}
          {currentOption ? currentOption.label : 'Sort'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSort(option.value)}
            className="gap-2"
          >
            {sortBy === option.value && sortDirection === 'asc' && <ArrowUp className="h-4 w-4" />}
            {sortBy === option.value && sortDirection === 'desc' && <ArrowDown className="h-4 w-4" />}
            {(sortBy !== option.value || !sortDirection) && <ArrowUpDown className="h-4 w-4 opacity-50" />}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
