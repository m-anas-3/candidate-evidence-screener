export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      candidates: {
        Row: {
          analysis_error: string | null
          analysis_status: Database["public"]["Enums"]["candidate_analysis_status"]
          created_at: string
          id: string
          job_id: string
          name: string
          portfolio_url: string | null
          proposal_text: string
          resume_path: string
          resume_text: string | null
          updated_at: string
        }
        Insert: {
          analysis_error?: string | null
          analysis_status?: Database["public"]["Enums"]["candidate_analysis_status"]
          created_at?: string
          id?: string
          job_id: string
          name: string
          portfolio_url?: string | null
          proposal_text: string
          resume_path: string
          resume_text?: string | null
          updated_at?: string
        }
        Update: {
          analysis_error?: string | null
          analysis_status?: Database["public"]["Enums"]["candidate_analysis_status"]
          created_at?: string
          id?: string
          job_id?: string
          name?: string
          portfolio_url?: string | null
          proposal_text?: string
          resume_path?: string
          resume_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          candidate_id: string
          content: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["chat_message_role"]
        }
        Insert: {
          candidate_id: string
          content: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["chat_message_role"]
        }
        Update: {
          candidate_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["chat_message_role"]
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string
          description: string
          id: string
          must_have_skills: string[]
          recruiter_id: string
          requirements: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          must_have_skills?: string[]
          recruiter_id: string
          requirements: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          must_have_skills?: string[]
          recruiter_id?: string
          requirements?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      screening_reports: {
        Row: {
          candidate_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          matched_skills: Json | null
          missing_skills: Json | null
          model_identifier: string
          outreach_message: string | null
          portfolio_evidence: Json | null
          prompt_version: string
          proposal_specificity_findings: Json | null
          raw_structured_output: Json | null
          recommendation:
            Database["public"]["Enums"]["screening_recommendation"] | null
          review_points: Json | null
          score: number | null
          started_at: string
          status: Database["public"]["Enums"]["screening_report_status"]
          strengths: Json | null
          summary: string | null
          updated_at: string
          weaknesses: Json | null
        }
        Insert: {
          candidate_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          matched_skills?: Json | null
          missing_skills?: Json | null
          model_identifier: string
          outreach_message?: string | null
          portfolio_evidence?: Json | null
          prompt_version: string
          proposal_specificity_findings?: Json | null
          raw_structured_output?: Json | null
          recommendation?:
            Database["public"]["Enums"]["screening_recommendation"] | null
          review_points?: Json | null
          score?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["screening_report_status"]
          strengths?: Json | null
          summary?: string | null
          updated_at?: string
          weaknesses?: Json | null
        }
        Update: {
          candidate_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          matched_skills?: Json | null
          missing_skills?: Json | null
          model_identifier?: string
          outreach_message?: string | null
          portfolio_evidence?: Json | null
          prompt_version?: string
          proposal_specificity_findings?: Json | null
          raw_structured_output?: Json | null
          recommendation?:
            Database["public"]["Enums"]["screening_recommendation"] | null
          review_points?: Json | null
          score?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["screening_report_status"]
          strengths?: Json | null
          summary?: string | null
          updated_at?: string
          weaknesses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "screening_reports_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      consume_ai_rate_limit: {
        Args: { requested_kind: string }
        Returns: {
          allowed: boolean
          retry_after_seconds: number
        }[]
      }
    }
    Enums: {
      candidate_analysis_status:
        | "pending"
        | "extracting"
        | "ready"
        | "processing"
        | "completed"
        | "failed"
      chat_message_role: "user" | "assistant"
      screening_recommendation: "strong_fit" | "possible_fit" | "weak_fit"
      screening_report_status: "processing" | "completed" | "failed"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends (PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never
