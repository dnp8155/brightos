export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "operator" | "viewer";
export type LeadStatus = "New" | "Audited" | "Contacted" | "Interested" | "Replied" | "Disqualified";
export type CampaignStatus = "Draft" | "Pending Approval" | "Scheduled" | "Active" | "Paused" | "Completed";
export type IssueSeverity = "low" | "medium" | "high" | "critical";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          domain: string;
          website_url: string;
          country: string;
          industry: string;
          business_type: string;
          employee_count: number | null;
          estimated_revenue: string | null;
          status: LeadStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          domain: string;
          website_url: string;
          country?: string;
          industry?: string;
          business_type?: string;
          employee_count?: number | null;
          estimated_revenue?: string | null;
          status?: LeadStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          domain?: string;
          website_url?: string;
          country?: string;
          industry?: string;
          business_type?: string;
          employee_count?: number | null;
          estimated_revenue?: string | null;
          status?: LeadStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          business_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          job_title: string;
          linkedin_url: string | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          job_title?: string;
          linkedin_url?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          job_title?: string;
          linkedin_url?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      lead_sources: {
        Row: {
          id: string;
          business_id: string;
          source_type: string;
          source_query: string | null;
          discovered_by_agent: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          source_type: string;
          source_query?: string | null;
          discovered_by_agent?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          source_type?: string;
          source_query?: string | null;
          discovered_by_agent?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      website_audits: {
        Row: {
          id: string;
          business_id: string;
          url: string;
          status: string;
          performance_score: number;
          seo_score: number;
          mobile_score: number;
          design_score: number;
          audit_metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          url: string;
          status?: string;
          performance_score?: number;
          seo_score?: number;
          mobile_score?: number;
          design_score?: number;
          audit_metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          url?: string;
          status?: string;
          performance_score?: number;
          seo_score?: number;
          mobile_score?: number;
          design_score?: number;
          audit_metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_issues: {
        Row: {
          id: string;
          audit_id: string;
          category: string;
          severity: IssueSeverity;
          title: string;
          description: string;
          recommended_fix: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          audit_id: string;
          category: string;
          severity?: IssueSeverity;
          title: string;
          description: string;
          recommended_fix?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          audit_id?: string;
          category?: string;
          severity?: IssueSeverity;
          title?: string;
          description?: string;
          recommended_fix?: string | null;
          created_at?: string;
        };
      };
      lead_scores: {
        Row: {
          id: string;
          business_id: string;
          opportunity_score: number;
          intent_signals: Json | null;
          tech_stack_debt_score: number;
          hiring_signal_score: number;
          calculated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          opportunity_score: number;
          intent_signals?: Json | null;
          tech_stack_debt_score?: number;
          hiring_signal_score?: number;
          calculated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          opportunity_score?: number;
          intent_signals?: Json | null;
          tech_stack_debt_score?: number;
          hiring_signal_score?: number;
          calculated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          typical_price_tier: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          typical_price_tier?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          typical_price_tier?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          name: string;
          service_id: string | null;
          target_industry: string;
          status: CampaignStatus;
          target_audience_count: number;
          scheduled_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          service_id?: string | null;
          target_industry?: string;
          status?: CampaignStatus;
          target_audience_count?: number;
          scheduled_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          service_id?: string | null;
          target_industry?: string;
          status?: CampaignStatus;
          target_audience_count?: number;
          scheduled_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaign_recipients: {
        Row: {
          id: string;
          campaign_id: string;
          contact_id: string;
          business_id: string;
          status: string;
          sent_at: string | null;
          opened_at: string | null;
          replied_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          contact_id: string;
          business_id: string;
          status?: string;
          sent_at?: string | null;
          opened_at?: string | null;
          replied_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          contact_id?: string;
          business_id?: string;
          status?: string;
          sent_at?: string | null;
          opened_at?: string | null;
          replied_at?: string | null;
          created_at?: string;
        };
      };
      email_templates: {
        Row: {
          id: string;
          service_id: string | null;
          name: string;
          subject: string;
          body_template: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id?: string | null;
          name: string;
          subject: string;
          body_template: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string | null;
          name?: string;
          subject?: string;
          body_template?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_messages: {
        Row: {
          id: string;
          campaign_recipient_id: string | null;
          sender_email: string;
          recipient_email: string;
          subject: string;
          body_rendered: string;
          direction: "outbound" | "inbound";
          classification: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_recipient_id?: string | null;
          sender_email: string;
          recipient_email: string;
          subject: string;
          body_rendered: string;
          direction?: "outbound" | "inbound";
          classification?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_recipient_id?: string | null;
          sender_email?: string;
          recipient_email?: string;
          subject?: string;
          body_rendered?: string;
          direction?: "outbound" | "inbound";
          classification?: string | null;
          created_at?: string;
        };
      };
      email_events: {
        Row: {
          id: string;
          email_message_id: string;
          event_type: "delivered" | "opened" | "clicked" | "bounced" | "complained";
          raw_payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email_message_id: string;
          event_type: "delivered" | "opened" | "clicked" | "bounced" | "complained";
          raw_payload?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email_message_id?: string;
          event_type?: "delivered" | "opened" | "clicked" | "bounced" | "complained";
          raw_payload?: Json | null;
          created_at?: string;
        };
      };
      suppressions: {
        Row: {
          id: string;
          email: string;
          domain: string | null;
          reason: "unsubscribed" | "hard_bounce" | "spam_complaint" | "manual";
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          domain?: string | null;
          reason?: "unsubscribed" | "hard_bounce" | "spam_complaint" | "manual";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          domain?: string | null;
          reason?: "unsubscribed" | "hard_bounce" | "spam_complaint" | "manual";
          created_at?: string;
        };
      };
      approvals: {
        Row: {
          id: string;
          campaign_id: string;
          approved_by: string;
          status: "pending" | "approved" | "rejected";
          notes: string | null;
          action_taken_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          approved_by: string;
          status?: "pending" | "approved" | "rejected";
          notes?: string | null;
          action_taken_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          approved_by?: string;
          status?: "pending" | "approved" | "rejected";
          notes?: string | null;
          action_taken_at?: string | null;
          created_at?: string;
        };
      };
      follow_up_jobs: {
        Row: {
          id: string;
          contact_id: string;
          campaign_id: string | null;
          scheduled_for: string;
          status: "scheduled" | "processing" | "completed" | "cancelled";
          action_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contact_id: string;
          campaign_id?: string | null;
          scheduled_for: string;
          status?: "scheduled" | "processing" | "completed" | "cancelled";
          action_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string;
          campaign_id?: string | null;
          scheduled_for?: string;
          status?: "scheduled" | "processing" | "completed" | "cancelled";
          action_type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      agent_jobs: {
        Row: {
          id: string;
          agent_identifier: string;
          status: "queued" | "running" | "completed" | "failed";
          input_params: Json | null;
          output_summary: Json | null;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_identifier: string;
          status?: "queued" | "running" | "completed" | "failed";
          input_params?: Json | null;
          output_summary?: Json | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          agent_identifier?: string;
          status?: "queued" | "running" | "completed" | "failed";
          input_params?: Json | null;
          output_summary?: Json | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
        };
      };
      agent_settings: {
        Row: {
          id: string;
          agent_identifier: string;
          is_enabled: boolean;
          schedule_cron: string | null;
          concurrency_limit: number;
          config_payload: Json | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_identifier: string;
          is_enabled?: boolean;
          schedule_cron?: string | null;
          concurrency_limit?: number;
          config_payload?: Json | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_identifier?: string;
          is_enabled?: boolean;
          schedule_cron?: string | null;
          concurrency_limit?: number;
          config_payload?: Json | null;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_entity: string;
          target_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          target_entity: string;
          target_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          target_entity?: string;
          target_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
    };
  };
}
