// Database types for the MOS application
export type AppRole = 'admin' | 'manager' | 'viewer';
export type ProductType = 'internal' | 'external' | 'client' | 'rnd';
export type ProductLifecycle = 'ideation' | 'build' | 'live' | 'scale' | 'maintenance' | 'sunset';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type ApprovalSource = 'board' | 'chairman' | 'management' | 'internal';
export type StrategicCategory = 'revenue' | 'compliance' | 'operations' | 'quality' | 'brand';
export type SensitivityLevel = 'confidential' | 'internal' | 'routine';
export type InitiativeStatus = 'approved' | 'in_progress' | 'blocked' | 'delivered' | 'dropped';
export type DeliveryWindow = 'immediate' | 'month' | 'quarter' | 'flexible';
export type OutcomeMatch = 'fully' | 'partial' | 'missed';
export type ExecutionStage = 'not_started' | 'active' | 'paused' | 'completed';
export type HealthStatus = 'green' | 'amber' | 'red';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  product_type: ProductType;
  lifecycle_stage: ProductLifecycle;
  strategic_priority: PriorityLevel;
  business_owner: string | null;
  tech_owner: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Initiative {
  id: string;
  title: string;
  context: string | null;
  expected_outcome: string | null;
  product_id: string;
  approval_source: ApprovalSource;
  approving_authority: string | null;
  approval_date: string | null;
  approval_evidence: string | null;
  strategic_category: StrategicCategory | null;
  sensitivity_level: SensitivityLevel;
  priority_level: PriorityLevel;
  accountable_owner: string | null;
  escalation_owner: string | null;
  status: InitiativeStatus;
  target_delivery_window: DeliveryWindow;
  tentative_delivery_date: string | null;
  actual_delivery_date: string | null;
  delivered_outcome_summary: string | null;
  outcome_vs_intent: OutcomeMatch | null;
  closure_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  products?: Product;
}

export interface ExecutionSignal {
  id: string;
  initiative_id: string;
  execution_stage: ExecutionStage;
  health_status: HealthStatus;
  risk_blocker_summary: string | null;
  last_management_touch: string | null;
  next_expected_movement: string | null;
  jira_epics: string | null;
  last_jira_activity: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  initiatives?: Initiative;
}
