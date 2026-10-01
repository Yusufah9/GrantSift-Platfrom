// These mirror supabase/migrations/001_initial_schema.sql. Once a real
// Supabase project exists, regenerate with:
//   npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
// and this file becomes redundant.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type ProjectStatus = "draft" | "active" | "archived";
export type ProcessingStatus = "pending" | "processing" | "completed" | "failed" | "partially_completed";
export type SourceKind = "funder_org" | "youtube_video" | "user_document" | "user_pasted_text";
export type SourceTrust =
  | "official_funder"
  | "government"
  | "institution"
  | "expert_source"
  | "ai_synthesis"
  | "user_provided";
export type SopStatus = "not_started" | "in_progress" | "blocked" | "done";
export type PostStatus = "draft" | "published" | "archived";
export type AppRole = "user" | "admin";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; role: AppRole; created_at: string };
        Insert: { id: string; full_name?: string | null; role?: AppRole };
        Update: { full_name?: string | null; role?: AppRole };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          status: ProjectStatus;
          org_name: string | null;
          org_industry: string | null;
          org_country: string | null;
          org_website: string | null;
          org_email: string | null;
          org_team_size: number | null;
          org_year_founded: number | null;
          org_social_links: Json;
          org_traction: string | null;
          org_funding_to_date: number | null;
          grant_funder_name: string | null;
          grant_funder_url: string | null;
          grant_amount_sought: number | null;
          grant_deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["projects"]["Row"]> & {
          user_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
        Relationships: [];
      };
      sources: {
        Row: {
          id: string;
          project_id: string;
          kind: SourceKind;
          trust: SourceTrust;
          funder_url: string | null;
          funder_name: string | null;
          youtube_video_id: string | null;
          youtube_url: string | null;
          youtube_channel_title: string | null;
          youtube_video_title: string | null;
          transcript_available: boolean | null;
          storage_path: string | null;
          pasted_text: string | null;
          status: ProcessingStatus;
          status_detail: string | null;
          raw_content: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["sources"]["Row"]> & {
          project_id: string;
          kind: SourceKind;
          trust: SourceTrust;
        };
        Update: Partial<Database["public"]["Tables"]["sources"]["Row"]>;
        Relationships: [];
      };
      readiness_items: {
        Row: {
          id: string;
          project_id: string;
          requirement: string;
          is_met: boolean;
          gap_description: string | null;
          traced_to_source_id: string | null;
          traced_to_user_input: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["readiness_items"]["Row"]> & {
          project_id: string;
          requirement: string;
        };
        Update: Partial<Database["public"]["Tables"]["readiness_items"]["Row"]>;
        Relationships: [];
      };
      sop_tasks: {
        Row: {
          id: string;
          project_id: string;
          task: string;
          owner: string | null;
          input: string | null;
          output: string | null;
          depends_on: string | null;
          deadline: string | null;
          status: SopStatus;
          required_document: string | null;
          traced_to_source_id: string | null;
          notes: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["sop_tasks"]["Row"]> & {
          project_id: string;
          task: string;
        };
        Update: Partial<Database["public"]["Tables"]["sop_tasks"]["Row"]>;
        Relationships: [];
      };
      insights: {
        Row: {
          id: string;
          project_id: string;
          source_id: string;
          category: string;
          claim: string;
          evidence_excerpt: string | null;
          trust: SourceTrust;
          confidence: number | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["insights"]["Row"]> & {
          project_id: string;
          source_id: string;
          category: string;
          claim: string;
          trust: SourceTrust;
        };
        Update: Partial<Database["public"]["Tables"]["insights"]["Row"]>;
        Relationships: [];
      };
      processing_jobs: {
        Row: {
          id: string;
          project_id: string;
          stage: string;
          status: ProcessingStatus;
          error_code: string | null;
          error_message: string | null;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["processing_jobs"]["Row"]> & {
          project_id: string;
          stage: string;
        };
        Update: Partial<Database["public"]["Tables"]["processing_jobs"]["Row"]>;
        Relationships: [];
      };
      authors: {
        Row: { id: string; user_id: string | null; display_name: string; bio: string | null };
        Insert: Partial<Database["public"]["Tables"]["authors"]["Row"]> & { display_name: string };
        Update: Partial<Database["public"]["Tables"]["authors"]["Row"]>;
        Relationships: [];
      };
      categories: {
        Row: { id: string; name: string; slug: string };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & { name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [];
      };
      tags: {
        Row: { id: string; name: string; slug: string };
        Insert: Partial<Database["public"]["Tables"]["tags"]["Row"]> & { name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["tags"]["Row"]>;
        Relationships: [];
      };
      post_tags: {
        Row: { post_id: string; tag_id: string };
        Insert: { post_id: string; tag_id: string };
        Update: Partial<{ post_id: string; tag_id: string }>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          featured_image: string | null;
          author_id: string | null;
          category_id: string | null;
          status: PostStatus;
          meta_description: string | null;
          canonical_url: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["posts"]["Row"]> & { title: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["posts"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

