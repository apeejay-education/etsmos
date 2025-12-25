export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      capacity_settings: {
        Row: {
          complexity_high: number
          complexity_low: number
          complexity_medium: number
          id: string
          role_multiplier_advisor: number
          role_multiplier_contributor: number
          role_multiplier_lead: number
          role_multiplier_reviewer: number
          updated_at: string
          weekly_capacity_hours: number
        }
        Insert: {
          complexity_high?: number
          complexity_low?: number
          complexity_medium?: number
          id?: string
          role_multiplier_advisor?: number
          role_multiplier_contributor?: number
          role_multiplier_lead?: number
          role_multiplier_reviewer?: number
          updated_at?: string
          weekly_capacity_hours?: number
        }
        Update: {
          complexity_high?: number
          complexity_low?: number
          complexity_medium?: number
          id?: string
          role_multiplier_advisor?: number
          role_multiplier_contributor?: number
          role_multiplier_lead?: number
          role_multiplier_reviewer?: number
          updated_at?: string
          weekly_capacity_hours?: number
        }
        Relationships: []
      }
      contributions: {
        Row: {
          assessed_at: string | null
          assessed_by: string | null
          assessment_notes: string | null
          contribution_role: Database["public"]["Enums"]["contribution_role"]
          contribution_summary: string | null
          created_at: string
          id: string
          initiative_id: string
          performance_rating:
            | Database["public"]["Enums"]["performance_rating"]
            | null
          person_id: string
          updated_at: string
        }
        Insert: {
          assessed_at?: string | null
          assessed_by?: string | null
          assessment_notes?: string | null
          contribution_role?: Database["public"]["Enums"]["contribution_role"]
          contribution_summary?: string | null
          created_at?: string
          id?: string
          initiative_id: string
          performance_rating?:
            | Database["public"]["Enums"]["performance_rating"]
            | null
          person_id: string
          updated_at?: string
        }
        Update: {
          assessed_at?: string | null
          assessed_by?: string | null
          assessment_notes?: string | null
          contribution_role?: Database["public"]["Enums"]["contribution_role"]
          contribution_summary?: string | null
          created_at?: string
          id?: string
          initiative_id?: string
          performance_rating?:
            | Database["public"]["Enums"]["performance_rating"]
            | null
          person_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributions_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_signals: {
        Row: {
          created_at: string
          execution_stage: Database["public"]["Enums"]["execution_stage"]
          health_status: Database["public"]["Enums"]["health_status"]
          id: string
          initiative_id: string
          jira_epics: string | null
          last_jira_activity: string | null
          last_management_touch: string | null
          next_expected_movement: string | null
          risk_blocker_summary: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          execution_stage?: Database["public"]["Enums"]["execution_stage"]
          health_status?: Database["public"]["Enums"]["health_status"]
          id?: string
          initiative_id: string
          jira_epics?: string | null
          last_jira_activity?: string | null
          last_management_touch?: string | null
          next_expected_movement?: string | null
          risk_blocker_summary?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          execution_stage?: Database["public"]["Enums"]["execution_stage"]
          health_status?: Database["public"]["Enums"]["health_status"]
          id?: string
          initiative_id?: string
          jira_epics?: string | null
          last_jira_activity?: string | null
          last_management_touch?: string | null
          next_expected_movement?: string | null
          risk_blocker_summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_signals_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: true
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_allocations: {
        Row: {
          allocated_hours_per_week: number
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          initiative_id: string
          person_id: string
          role: Database["public"]["Enums"]["contribution_role"]
          start_date: string
          updated_at: string
        }
        Insert: {
          allocated_hours_per_week?: number
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          initiative_id: string
          person_id: string
          role?: Database["public"]["Enums"]["contribution_role"]
          start_date?: string
          updated_at?: string
        }
        Update: {
          allocated_hours_per_week?: number
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          initiative_id?: string
          person_id?: string
          role?: Database["public"]["Enums"]["contribution_role"]
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiative_allocations_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiative_allocations_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_chats: {
        Row: {
          created_at: string
          id: string
          initiative_id: string
          message: string
          person_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          initiative_id: string
          message: string
          person_id: string
        }
        Update: {
          created_at?: string
          id?: string
          initiative_id?: string
          message?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiative_chats_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiative_chats_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          initiative_id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          initiative_id: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          initiative_id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiative_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiative_tasks_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_updates: {
        Row: {
          content: string
          created_at: string | null
          due_date: string | null
          id: string
          initiative_id: string
          person_id: string
          priority: Database["public"]["Enums"]["priority_level"] | null
          title: string | null
          update_status: Database["public"]["Enums"]["update_status"] | null
          update_type: Database["public"]["Enums"]["update_type"]
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          initiative_id: string
          person_id: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          title?: string | null
          update_status?: Database["public"]["Enums"]["update_status"] | null
          update_type: Database["public"]["Enums"]["update_type"]
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          initiative_id?: string
          person_id?: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          title?: string | null
          update_status?: Database["public"]["Enums"]["update_status"] | null
          update_type?: Database["public"]["Enums"]["update_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "initiative_updates_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiative_updates_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      initiatives: {
        Row: {
          accountable_owner: string | null
          actual_delivery_date: string | null
          approval_date: string | null
          approval_evidence: string | null
          approval_source: Database["public"]["Enums"]["approval_source"]
          approving_authority: string | null
          closure_notes: string | null
          complexity: string
          context: string | null
          created_at: string
          delivered_outcome_summary: string | null
          escalation_owner: string | null
          expected_outcome: string | null
          id: string
          outcome_vs_intent: Database["public"]["Enums"]["outcome_match"] | null
          priority_level: Database["public"]["Enums"]["priority_level"]
          product_id: string
          sensitivity_level: Database["public"]["Enums"]["sensitivity_level"]
          status: Database["public"]["Enums"]["initiative_status"]
          strategic_category:
            | Database["public"]["Enums"]["strategic_category"]
            | null
          target_delivery_window: Database["public"]["Enums"]["delivery_window"]
          tentative_delivery_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          accountable_owner?: string | null
          actual_delivery_date?: string | null
          approval_date?: string | null
          approval_evidence?: string | null
          approval_source?: Database["public"]["Enums"]["approval_source"]
          approving_authority?: string | null
          closure_notes?: string | null
          complexity?: string
          context?: string | null
          created_at?: string
          delivered_outcome_summary?: string | null
          escalation_owner?: string | null
          expected_outcome?: string | null
          id?: string
          outcome_vs_intent?:
            | Database["public"]["Enums"]["outcome_match"]
            | null
          priority_level?: Database["public"]["Enums"]["priority_level"]
          product_id: string
          sensitivity_level?: Database["public"]["Enums"]["sensitivity_level"]
          status?: Database["public"]["Enums"]["initiative_status"]
          strategic_category?:
            | Database["public"]["Enums"]["strategic_category"]
            | null
          target_delivery_window?: Database["public"]["Enums"]["delivery_window"]
          tentative_delivery_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          accountable_owner?: string | null
          actual_delivery_date?: string | null
          approval_date?: string | null
          approval_evidence?: string | null
          approval_source?: Database["public"]["Enums"]["approval_source"]
          approving_authority?: string | null
          closure_notes?: string | null
          complexity?: string
          context?: string | null
          created_at?: string
          delivered_outcome_summary?: string | null
          escalation_owner?: string | null
          expected_outcome?: string | null
          id?: string
          outcome_vs_intent?:
            | Database["public"]["Enums"]["outcome_match"]
            | null
          priority_level?: Database["public"]["Enums"]["priority_level"]
          product_id?: string
          sensitivity_level?: Database["public"]["Enums"]["sensitivity_level"]
          status?: Database["public"]["Enums"]["initiative_status"]
          strategic_category?:
            | Database["public"]["Enums"]["strategic_category"]
            | null
          target_delivery_window?: Database["public"]["Enums"]["delivery_window"]
          tentative_delivery_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiatives_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_snapshots: {
        Row: {
          blockers_faced: string | null
          created_at: string
          created_by: string | null
          id: string
          key_deliveries: string | null
          lessons_learned: string | null
          month_year: string
          next_month_focus: string | null
          summary: string | null
          updated_at: string
        }
        Insert: {
          blockers_faced?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          key_deliveries?: string | null
          lessons_learned?: string | null
          month_year: string
          next_month_focus?: string | null
          summary?: string | null
          updated_at?: string
        }
        Update: {
          blockers_faced?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          key_deliveries?: string | null
          lessons_learned?: string | null
          month_year?: string
          next_month_focus?: string | null
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          must_reset_password: boolean
          role_title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          must_reset_password?: boolean
          role_title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          must_reset_password?: boolean
          role_title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_leads: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          person_id: string
          product_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          person_id: string
          product_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          person_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_leads_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_leads_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          business_owner: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          lifecycle_stage: Database["public"]["Enums"]["product_lifecycle"]
          name: string
          product_type: Database["public"]["Enums"]["product_type"]
          strategic_priority: Database["public"]["Enums"]["priority_level"]
          tech_owner: string | null
          updated_at: string
        }
        Insert: {
          business_owner?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          lifecycle_stage?: Database["public"]["Enums"]["product_lifecycle"]
          name: string
          product_type?: Database["public"]["Enums"]["product_type"]
          strategic_priority?: Database["public"]["Enums"]["priority_level"]
          tech_owner?: string | null
          updated_at?: string
        }
        Update: {
          business_owner?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          lifecycle_stage?: Database["public"]["Enums"]["product_lifecycle"]
          name?: string
          product_type?: Database["public"]["Enums"]["product_type"]
          strategic_priority?: Database["public"]["Enums"]["priority_level"]
          tech_owner?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_person_id: { Args: never; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_initiative_lead: {
        Args: { _initiative_id: string; _user_id: string }
        Returns: boolean
      }
      is_product_lead: {
        Args: { _product_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_initiative_access: {
        Args: { _initiative_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_product_access: {
        Args: { _product_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "viewer"
      approval_source: "board" | "chairman" | "management" | "internal"
      contribution_role: "lead" | "contributor" | "reviewer" | "advisor"
      delivery_window: "immediate" | "month" | "quarter" | "flexible"
      execution_stage: "not_started" | "active" | "paused" | "completed"
      health_status: "green" | "amber" | "red"
      initiative_status:
        | "approved"
        | "in_progress"
        | "blocked"
        | "delivered"
        | "dropped"
      outcome_match: "fully" | "partial" | "missed"
      performance_rating:
        | "exceptional"
        | "strong"
        | "meets_expectations"
        | "needs_improvement"
      priority_level: "high" | "medium" | "low"
      product_lifecycle:
        | "ideation"
        | "build"
        | "live"
        | "scale"
        | "maintenance"
        | "sunset"
      product_type: "internal" | "external" | "client" | "rnd"
      sensitivity_level: "confidential" | "internal" | "routine"
      strategic_category:
        | "revenue"
        | "compliance"
        | "operations"
        | "quality"
        | "brand"
      update_status: "open" | "completed" | "blocked"
      update_type: "update" | "review" | "closure" | "comment"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "viewer"],
      approval_source: ["board", "chairman", "management", "internal"],
      contribution_role: ["lead", "contributor", "reviewer", "advisor"],
      delivery_window: ["immediate", "month", "quarter", "flexible"],
      execution_stage: ["not_started", "active", "paused", "completed"],
      health_status: ["green", "amber", "red"],
      initiative_status: [
        "approved",
        "in_progress",
        "blocked",
        "delivered",
        "dropped",
      ],
      outcome_match: ["fully", "partial", "missed"],
      performance_rating: [
        "exceptional",
        "strong",
        "meets_expectations",
        "needs_improvement",
      ],
      priority_level: ["high", "medium", "low"],
      product_lifecycle: [
        "ideation",
        "build",
        "live",
        "scale",
        "maintenance",
        "sunset",
      ],
      product_type: ["internal", "external", "client", "rnd"],
      sensitivity_level: ["confidential", "internal", "routine"],
      strategic_category: [
        "revenue",
        "compliance",
        "operations",
        "quality",
        "brand",
      ],
      update_status: ["open", "completed", "blocked"],
      update_type: ["update", "review", "closure", "comment"],
    },
  },
} as const
