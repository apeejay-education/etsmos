import { Product, Initiative } from '@/types/database';

interface InitiativeWithProduct extends Omit<Initiative, 'products'> {
  products?: { name: string } | null;
}

export function exportProductsToCSV(products: Product[]): void {
  const headers = [
    'name',
    'description',
    'product_type',
    'lifecycle_stage',
    'strategic_priority',
    'business_owner',
    'tech_owner',
    'is_active',
    'created_at',
    'updated_at'
  ];

  const rows = products.map(product => [
    escapeCSV(product.name),
    escapeCSV(product.description || ''),
    product.product_type,
    product.lifecycle_stage,
    product.strategic_priority,
    escapeCSV(product.business_owner || ''),
    escapeCSV(product.tech_owner || ''),
    product.is_active ? 'true' : 'false',
    product.created_at,
    product.updated_at
  ]);

  downloadCSV(headers, rows, 'products-export.csv');
}

export function exportInitiativesToCSV(initiatives: InitiativeWithProduct[]): void {
  const headers = [
    'title',
    'product_name',
    'context',
    'expected_outcome',
    'approval_source',
    'approving_authority',
    'approval_evidence',
    'approval_date',
    'status',
    'priority_level',
    'sensitivity_level',
    'target_delivery_window',
    'strategic_category',
    'accountable_owner',
    'escalation_owner',
    'actual_delivery_date',
    'delivered_outcome_summary',
    'outcome_vs_intent',
    'closure_notes',
    'created_at',
    'updated_at'
  ];

  const rows = initiatives.map(initiative => [
    escapeCSV(initiative.title),
    escapeCSV(initiative.products?.name || ''),
    escapeCSV(initiative.context || ''),
    escapeCSV(initiative.expected_outcome || ''),
    initiative.approval_source,
    escapeCSV(initiative.approving_authority || ''),
    escapeCSV(initiative.approval_evidence || ''),
    initiative.approval_date || '',
    initiative.status,
    initiative.priority_level,
    initiative.sensitivity_level,
    initiative.target_delivery_window,
    initiative.strategic_category || '',
    escapeCSV(initiative.accountable_owner || ''),
    escapeCSV(initiative.escalation_owner || ''),
    initiative.actual_delivery_date || '',
    escapeCSV(initiative.delivered_outcome_summary || ''),
    initiative.outcome_vs_intent || '',
    escapeCSV(initiative.closure_notes || ''),
    initiative.created_at,
    initiative.updated_at
  ]);

  downloadCSV(headers, rows, 'initiatives-export.csv');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadCSV(headers: string[], rows: string[][], filename: string): void {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Sample CSV content for imports
export const PRODUCTS_SAMPLE_CSV = `name,description,product_type,lifecycle_stage,strategic_priority,business_owner,tech_owner
Digital Onboarding,Customer onboarding automation platform,external,live,high,John Smith,Jane Doe
Internal Analytics,Business intelligence dashboard,internal,build,medium,Alice Johnson,Bob Wilson
Client Portal,Self-service client management,client,ideation,high,Sarah Brown,Mike Davis
R&D Sandbox,Experimental features testing,rnd,maintenance,low,Tom Harris,Emily Clark`;

// Sample CSV organized by sections: Core Details, Approval & Delivery
export const INITIATIVES_SAMPLE_CSV = `title,product_name,status,priority_level,sensitivity_level,strategic_category,context,expected_outcome,accountable_owner,escalation_owner,approval_source,approval_date,target_delivery_window
Launch Mobile App,Digital Onboarding,in_progress,high,internal,revenue,Expand reach to mobile users,50% increase in mobile signups,John Smith,Sarah Brown,board,2024-01-15,quarter
API Integration,Internal Analytics,approved,medium,routine,operations,Connect with third-party tools,Seamless data flow,Alice Johnson,Tom Harris,management,2024-02-01,month
Security Audit,Client Portal,blocked,high,confidential,compliance,Compliance requirement,SOC2 certification,Bob Wilson,Jane Doe,chairman,2024-01-20,immediate`;
