import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export interface DuplicateInfo {
  rowNum: number;
  identifier: string;
  existingId: string;
}

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  sampleCsvContent: string;
  sampleFileName: string;
  onImport: (data: Record<string, string>[], skipDuplicates: boolean) => Promise<{ success: number; errors: string[]; duplicates?: DuplicateInfo[] }>;
  checkDuplicates?: (data: Record<string, string>[]) => Promise<DuplicateInfo[]>;
  isLoading?: boolean;
}

export function CSVImportDialog({
  open,
  onOpenChange,
  title,
  description,
  sampleCsvContent,
  sampleFileName,
  onImport,
  checkDuplicates,
  isLoading = false
}: CSVImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [result, setResult] = useState<{ success: number; errors: string[]; duplicates?: DuplicateInfo[] } | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateInfo[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return rows;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setResult({ success: 0, errors: ['Please select a CSV file'] });
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setDuplicates([]);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setPreview(parsed);

      // Check for duplicates if the function is provided
      if (checkDuplicates && parsed.length > 0) {
        const foundDuplicates = await checkDuplicates(parsed);
        setDuplicates(foundDuplicates);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;

    const importResult = await onImport(preview, skipDuplicates);
    setResult(importResult);

    if (importResult.errors.length === 0) {
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
    setDuplicates([]);
    setSkipDuplicates(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = sampleFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const newRecordsCount = preview.length - duplicates.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline p-0 h-auto"
            >
              <Download className="h-4 w-4" />
              Download Sample CSV
            </Button>
          </div>

          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {file ? file.name : 'Click to upload or drag and drop a CSV file'}
              </span>
            </label>
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Preview: {preview.length} row(s) found
              </p>
              <div className="max-h-40 overflow-auto border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      {Object.keys(preview[0]).map((header) => (
                        <th key={header} className="p-2 text-left font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-t">
                        {Object.values(row).map((value, j) => (
                          <td key={j} className="p-2 truncate max-w-32">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  ...and {preview.length - 5} more rows
                </p>
              )}
            </div>
          )}

          {duplicates.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    {duplicates.length} duplicate(s) found:
                  </p>
                  <ul className="list-disc list-inside text-sm">
                    {duplicates.slice(0, 3).map((dup, i) => (
                      <li key={i}>Row {dup.rowNum}: "{dup.identifier}" already exists</li>
                    ))}
                    {duplicates.length > 3 && (
                      <li>...and {duplicates.length - 3} more duplicates</li>
                    )}
                  </ul>
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox
                      id="skip-duplicates"
                      checked={skipDuplicates}
                      onCheckedChange={(checked) => setSkipDuplicates(checked === true)}
                    />
                    <label htmlFor="skip-duplicates" className="text-sm cursor-pointer">
                      Skip duplicates and import only new records ({newRecordsCount} new)
                    </label>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert variant={result.errors.length > 0 ? 'destructive' : 'default'}>
              {result.errors.length > 0 ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {result.success > 0 && (
                  <p className="text-green-600">
                    Successfully imported {result.success} record(s)
                  </p>
                )}
                {result.errors.length > 0 && (
                  <ul className="list-disc list-inside mt-1">
                    {result.errors.slice(0, 5).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li>...and {result.errors.length - 5} more errors</li>
                    )}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={preview.length === 0 || isLoading || (skipDuplicates && newRecordsCount === 0)}
          >
            {isLoading ? 'Importing...' : `Import ${skipDuplicates ? newRecordsCount : preview.length} Record(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
