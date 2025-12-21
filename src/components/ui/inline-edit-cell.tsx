import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InlineEditCellProps {
  value: string;
  onSave: (value: string) => void;
  type?: 'text' | 'select' | 'date';
  options?: { value: string; label: string }[];
  canEdit?: boolean;
  className?: string;
  placeholder?: string;
  displayValue?: string;
}

export function InlineEditCell({
  value,
  onSave,
  type = 'text',
  options = [],
  canEdit = true,
  className,
  placeholder = '-',
  displayValue,
}: InlineEditCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!canEdit) {
    return <span className={className}>{displayValue || value || placeholder}</span>;
  }

  if (isEditing) {
    if (type === 'select') {
      return (
        <div className="flex items-center gap-1">
          <Select
            value={editValue}
            onValueChange={(val) => {
              setEditValue(val);
              onSave(val);
              setIsEditing(false);
            }}
          >
            <SelectTrigger className="h-8 w-full min-w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    if (type === 'date') {
      return (
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="h-8 w-auto"
          />
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="h-8 w-full min-w-[100px]"
        />
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSave}>
          <Check className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancel}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <span
      className={cn(
        'cursor-pointer hover:bg-muted/50 px-1 py-0.5 rounded -mx-1 transition-colors',
        className
      )}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {displayValue || value || placeholder}
    </span>
  );
}
