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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_invitations: {
        Row: {
          accepted_at: string | null
          client_id: string | null
          client_role: Database["public"]["Enums"]["client_role"] | null
          created_at: string
          email: string
          email_normalized: string | null
          expires_at: string | null
          id: string
          invited_by: string | null
          organization_id: string | null
          status: Database["public"]["Enums"]["access_invitation_status"]
          team_role: Database["public"]["Enums"]["team_role"] | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          accepted_at?: string | null
          client_id?: string | null
          client_role?: Database["public"]["Enums"]["client_role"] | null
          created_at?: string
          email: string
          email_normalized?: string | null
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          organization_id?: string | null
          status?: Database["public"]["Enums"]["access_invitation_status"]
          team_role?: Database["public"]["Enums"]["team_role"] | null
          updated_at?: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          accepted_at?: string | null
          client_id?: string | null
          client_role?: Database["public"]["Enums"]["client_role"] | null
          created_at?: string
          email?: string
          email_normalized?: string | null
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          organization_id?: string | null
          status?: Database["public"]["Enums"]["access_invitation_status"]
          team_role?: Database["public"]["Enums"]["team_role"] | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: [
          {
            foreignKeyName: "access_invitations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          client_id: string
          created_at: string
          id: string
          profile_id: string
          role: Database["public"]["Enums"]["client_role"]
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          profile_id: string
          role?: Database["public"]["Enums"]["client_role"]
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["client_role"]
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_users_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          organization_id: string
          primary_contact_email: string
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          primary_contact_email: string
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          primary_contact_email?: string
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverable_approvals: {
        Row: {
          approval_source: Database["public"]["Enums"]["approval_source"]
          approved_by: string | null
          created_at: string
          deliverable_id: string
          id: string
          notes: string | null
        }
        Insert: {
          approval_source: Database["public"]["Enums"]["approval_source"]
          approved_by?: string | null
          created_at?: string
          deliverable_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          approval_source?: Database["public"]["Enums"]["approval_source"]
          approved_by?: string | null
          created_at?: string
          deliverable_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_approvals_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverable_comments: {
        Row: {
          author_name: string | null
          body: string
          comment_type: string
          created_at: string
          deliverable_id: string
          id: string
          profile_id: string | null
          visibility: string
        }
        Insert: {
          author_name?: string | null
          body: string
          comment_type?: string
          created_at?: string
          deliverable_id: string
          id?: string
          profile_id?: string | null
          visibility?: string
        }
        Update: {
          author_name?: string | null
          body?: string
          comment_type?: string
          created_at?: string
          deliverable_id?: string
          id?: string
          profile_id?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_comments_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          approval_source: Database["public"]["Enums"]["approval_source"] | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          deliverable_type: string
          expected_delivery_date: string | null
          external_url: string | null
          id: string
          internal_notes: string | null
          project_id: string
          revision_limit: number
          revisions_remaining: number
          status: Database["public"]["Enums"]["deliverable_status"]
          title: string
          updated_at: string
        }
        Insert: {
          approval_source?:
            | Database["public"]["Enums"]["approval_source"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          deliverable_type: string
          expected_delivery_date?: string | null
          external_url?: string | null
          id?: string
          internal_notes?: string | null
          project_id: string
          revision_limit?: number
          revisions_remaining?: number
          status?: Database["public"]["Enums"]["deliverable_status"]
          title: string
          updated_at?: string
        }
        Update: {
          approval_source?:
            | Database["public"]["Enums"]["approval_source"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          deliverable_type?: string
          expected_delivery_date?: string | null
          external_url?: string | null
          id?: string
          internal_notes?: string | null
          project_id?: string
          revision_limit?: number
          revisions_remaining?: number
          status?: Database["public"]["Enums"]["deliverable_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          document_type: string
          external_url: string
          id: string
          phase_key: string
          project_id: string
          title: string
          updated_at: string
          visible_to_client: boolean
        }
        Insert: {
          created_at?: string
          document_type: string
          external_url: string
          id?: string
          phase_key?: string
          project_id: string
          title: string
          updated_at?: string
          visible_to_client?: boolean
        }
        Update: {
          created_at?: string
          document_type?: string
          external_url?: string
          id?: string
          phase_key?: string
          project_id?: string
          title?: string
          updated_at?: string
          visible_to_client?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_events: {
        Row: {
          client_id: string | null
          created_at: string
          deliverable_id: string | null
          event_type: Database["public"]["Enums"]["notification_event_type"]
          id: string
          organization_id: string
          payload: Json
          processed_at: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["notification_status"]
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          deliverable_id?: string | null
          event_type: Database["public"]["Enums"]["notification_event_type"]
          id?: string
          organization_id: string
          payload?: Json
          processed_at?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
        }
        Update: {
          client_id?: string | null
          created_at?: string
          deliverable_id?: string | null
          event_type?: Database["public"]["Enums"]["notification_event_type"]
          id?: string
          organization_id?: string
          payload?: Json
          processed_at?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "notification_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_events_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          organization_id: string | null
          team_role: Database["public"]["Enums"]["team_role"] | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          team_role?: Database["public"]["Enums"]["team_role"] | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          team_role?: Database["public"]["Enums"]["team_role"] | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phases: {
        Row: {
          created_at: string
          due_on: string | null
          id: string
          name: string
          phase_key: string
          position: number
          project_id: string
          starts_on: string | null
          status: Database["public"]["Enums"]["phase_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_on?: string | null
          id?: string
          name: string
          phase_key: string
          position: number
          project_id: string
          starts_on?: string | null
          status?: Database["public"]["Enums"]["phase_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_on?: string | null
          id?: string
          name?: string
          phase_key?: string
          position?: number
          project_id?: string
          starts_on?: string | null
          status?: Database["public"]["Enums"]["phase_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_templates: {
        Row: {
          created_at: string
          default_phases: Json
          deliverable_type_suggestions: string[]
          description: string | null
          id: string
          name: string
          organization_id: string | null
          responsibility_presets: Json
          slug: string
          supports_calendar: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_phases?: Json
          deliverable_type_suggestions?: string[]
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          responsibility_presets?: Json
          slug: string
          supports_calendar?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_phases?: Json
          deliverable_type_suggestions?: string[]
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          responsibility_presets?: Json
          slug?: string
          supports_calendar?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          activated_at: string | null
          activation_state: Database["public"]["Enums"]["activation_state"]
          archive_reason: Database["public"]["Enums"]["archive_reason"] | null
          client_id: string
          created_at: string
          created_by: string | null
          current_phase_key: string | null
          ends_on: string | null
          id: string
          name: string
          organization_id: string
          payment_confirmed_at: string | null
          pre_activation_status: Database["public"]["Enums"]["deal_status"]
          proposal_approved_at: string | null
          proposal_token: string
          service_type: string | null
          starts_on: string | null
          status: Database["public"]["Enums"]["project_status"]
          summary: string | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          activation_state?: Database["public"]["Enums"]["activation_state"]
          archive_reason?: Database["public"]["Enums"]["archive_reason"] | null
          client_id: string
          created_at?: string
          created_by?: string | null
          current_phase_key?: string | null
          ends_on?: string | null
          id?: string
          name: string
          organization_id: string
          payment_confirmed_at?: string | null
          pre_activation_status?: Database["public"]["Enums"]["deal_status"]
          proposal_approved_at?: string | null
          proposal_token?: string
          service_type?: string | null
          starts_on?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          activation_state?: Database["public"]["Enums"]["activation_state"]
          archive_reason?: Database["public"]["Enums"]["archive_reason"] | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          current_phase_key?: string | null
          ends_on?: string | null
          id?: string
          name?: string
          organization_id?: string
          payment_confirmed_at?: string | null
          pre_activation_status?: Database["public"]["Enums"]["deal_status"]
          proposal_approved_at?: string | null
          proposal_token?: string
          service_type?: string | null
          starts_on?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "project_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      responsibility_items: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          owner: Database["public"]["Enums"]["responsibility_owner"]
          position: number
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          owner: Database["public"]["Enums"]["responsibility_owner"]
          position?: number
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          owner?: Database["public"]["Enums"]["responsibility_owner"]
          position?: number
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responsibility_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_deliverable_as_client: {
        Args: { target_deliverable_id: string }
        Returns: string
      }
      can_access_project: {
        Args: { target_project_id: string }
        Returns: boolean
      }
      can_manage_client_user: {
        Args: { target_client_id: string }
        Returns: boolean
      }
      can_read_client: { Args: { target_client_id: string }; Returns: boolean }
      is_client_project: {
        Args: { target_project_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
      is_team_project: { Args: { target_project_id: string }; Returns: boolean }
      request_deliverable_revision: {
        Args: { comment_body: string; target_deliverable_id: string }
        Returns: string
      }
    }
    Enums: {
      access_invitation_status: "pending" | "accepted" | "revoked" | "expired"
      activation_state:
        | "internal_draft"
        | "proposal_approved"
        | "payment_confirmed"
        | "activated"
      approval_source:
        | "client_portal"
        | "whatsapp"
        | "email"
        | "call"
        | "admin_override"
      archive_reason: "completed" | "cancelled" | "duplicate" | "expired"
      client_role: "client_owner" | "client_collaborator"
      client_status: "lead" | "active" | "archived"
      deal_status:
        | "draft"
        | "proposal_sent"
        | "proposal_approved"
        | "payment_pending"
        | "payment_confirmed"
      deliverable_status:
        | "planned"
        | "in_progress"
        | "ready_for_review"
        | "revision_requested"
        | "approved"
        | "delivered"
      notification_event_type:
        | "client_portal_activated"
        | "deliverable_ready_for_review"
        | "revision_requested_by_client"
        | "deliverable_approved"
        | "due_date_changed"
        | "client_action_required"
      notification_status: "pending" | "sent" | "failed" | "skipped"
      phase_status: "not_started" | "active" | "complete"
      project_status:
        | "draft"
        | "proposal_sent"
        | "payment_confirmed"
        | "active"
        | "complete"
        | "paused"
        | "archived"
      responsibility_owner: "agency" | "client" | "shared" | "external"
      team_role: "owner" | "admin" | "member"
      user_type: "team" | "client"
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
      access_invitation_status: ["pending", "accepted", "revoked", "expired"],
      activation_state: [
        "internal_draft",
        "proposal_approved",
        "payment_confirmed",
        "activated",
      ],
      approval_source: [
        "client_portal",
        "whatsapp",
        "email",
        "call",
        "admin_override",
      ],
      archive_reason: ["completed", "cancelled", "duplicate", "expired"],
      client_role: ["client_owner", "client_collaborator"],
      client_status: ["lead", "active", "archived"],
      deal_status: [
        "draft",
        "proposal_sent",
        "proposal_approved",
        "payment_pending",
        "payment_confirmed",
      ],
      deliverable_status: [
        "planned",
        "in_progress",
        "ready_for_review",
        "revision_requested",
        "approved",
        "delivered",
      ],
      notification_event_type: [
        "client_portal_activated",
        "deliverable_ready_for_review",
        "revision_requested_by_client",
        "deliverable_approved",
        "due_date_changed",
        "client_action_required",
      ],
      notification_status: ["pending", "sent", "failed", "skipped"],
      phase_status: ["not_started", "active", "complete"],
      project_status: [
        "draft",
        "proposal_sent",
        "payment_confirmed",
        "active",
        "complete",
        "paused",
        "archived",
      ],
      responsibility_owner: ["agency", "client", "shared", "external"],
      team_role: ["owner", "admin", "member"],
      user_type: ["team", "client"],
    },
  },
} as const
