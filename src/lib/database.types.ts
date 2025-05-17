export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'worker' | 'recruiter' | 'admin'
          name: string
          email: string
          phone: string | null
          profile_pic_url: string | null
          location: string | null
          languages: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'worker' | 'recruiter' | 'admin'
          name: string
          email: string
          phone?: string | null
          profile_pic_url?: string | null
          location?: string | null
          languages?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'worker' | 'recruiter' | 'admin'
          name?: string
          email?: string
          phone?: string | null
          profile_pic_url?: string | null
          location?: string | null
          languages?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      worker_profiles: {
        Row: {
          id: string
          skills: string[]
          experience_years: number
          job_interests: string[]
          qualification: string | null
          availability: boolean
          video_resume_url: string | null
          is_quick_job_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          skills?: string[]
          experience_years?: number
          job_interests?: string[]
          qualification?: string | null
          availability?: boolean
          video_resume_url?: string | null
          is_quick_job_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          skills?: string[]
          experience_years?: number
          job_interests?: string[]
          qualification?: string | null
          availability?: boolean
          video_resume_url?: string | null
          is_quick_job_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recruiter_profiles: {
        Row: {
          id: string
          company_name: string
          company_type: string | null
          industry: string | null
          about: string | null
          contact_email: string
          contact_phone: string | null
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_name: string
          company_type?: string | null
          industry?: string | null
          about?: string | null
          contact_email: string
          contact_phone?: string | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          company_type?: string | null
          industry?: string | null
          about?: string | null
          contact_email?: string
          contact_phone?: string | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      job_posts: {
        Row: {
          id: string
          recruiter_id: string
          title: string
          type: 'full-time' | 'part-time' | 'contract'
          category: string
          location: string
          salary_min: number
          salary_max: number
          experience_required: number
          qualification: string | null
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recruiter_id: string
          title: string
          type?: 'full-time' | 'part-time' | 'contract'
          category: string
          location: string
          salary_min: number
          salary_max: number
          experience_required?: number
          qualification?: string | null
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recruiter_id?: string
          title?: string
          type?: 'full-time' | 'part-time' | 'contract'
          category?: string
          location?: string
          salary_min?: number
          salary_max?: number
          experience_required?: number
          qualification?: string | null
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      job_applications: {
        Row: {
          id: string
          job_id: string
          worker_id: string
          status: string
          cover_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          worker_id: string
          status?: string
          cover_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          worker_id?: string
          status?: string
          cover_note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quick_job_requests: {
        Row: {
          id: string
          customer_name: string
          service_type: string
          location: string
          worker_id: string | null
          status: 'pending' | 'accepted' | 'cancelled' | 'completed'
          happy_code: string | null
          created_at: string
          updated_at: string
          chat_channel_id: string | null
        }
        Insert: {
          id?: string
          customer_name: string
          service_type: string
          location: string
          worker_id?: string | null
          status?: 'pending' | 'accepted' | 'cancelled' | 'completed'
          happy_code?: string | null
          created_at?: string
          updated_at?: string
          chat_channel_id?: string | null
        }
        Update: {
          id?: string
          customer_name?: string
          service_type?: string
          location?: string
          worker_id?: string | null
          status?: 'pending' | 'accepted' | 'cancelled' | 'completed'
          happy_code?: string | null
          created_at?: string
          updated_at?: string
          chat_channel_id?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          quick_job_id: string | null
          job_application_id: string | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          quick_job_id?: string | null
          job_application_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          quick_job_id?: string | null
          job_application_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'worker' | 'recruiter' | 'admin'
      job_type: 'full-time' | 'part-time' | 'contract'
      quick_job_status: 'pending' | 'accepted' | 'cancelled' | 'completed'
    }
  }
} 