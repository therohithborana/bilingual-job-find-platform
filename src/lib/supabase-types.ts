// TypeScript definitions for Supabase database schema

// Enum types
export type UserRole = 'worker' | 'recruiter' | 'admin';
export type JobType = 'full-time' | 'part-time' | 'contract';
export type QuickJobStatus = 'pending' | 'accepted' | 'cancelled' | 'completed';

// Profile types
export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  profile_pic_url?: string;
  location?: string;
  languages: string[];
  created_at: string;
  updated_at: string;
}

// Worker profile
export interface WorkerProfile {
  id: string;
  skills: string[];
  experience_years: number;
  job_interests: string[];
  qualification?: string;
  availability: boolean;
  video_resume_url?: string;
  is_quick_job_active: boolean;
  created_at: string;
  updated_at: string;
}

// Combined worker profile with base profile data
export interface WorkerWithProfile extends WorkerProfile {
  profile: Profile;
}

// Recruiter profile
export interface RecruiterProfile {
  id: string;
  company_name: string;
  company_type?: string;
  industry?: string;
  about?: string;
  contact_email: string;
  contact_phone?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

// Combined recruiter profile with base profile data
export interface RecruiterWithProfile extends RecruiterProfile {
  profile: Profile;
}

// Job post
export interface JobPost {
  id: string;
  recruiter_id: string;
  title: string;
  type: JobType;
  category: string;
  location: string;
  salary_min: number;
  salary_max: number;
  experience_required: number;
  qualification?: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Job application
export interface JobApplication {
  id: string;
  job_id: string;
  worker_id: string;
  status: string;
  cover_note?: string;
  created_at: string;
  updated_at: string;
}

// Quick job request
export interface QuickJobRequest {
  id: string;
  customer_name: string;
  service_type: string;
  location: string;
  worker_id?: string;
  status: QuickJobStatus;
  happy_code?: string;
  created_at: string;
  updated_at: string;
  chat_channel_id?: string;
}

// Review
export interface Review {
  id: string;
  quick_job_id?: string;
  job_application_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

// Database types with nested relationships for common queries
export type WorkerWithReviews = WorkerWithProfile & {
  reviews: Review[];
};

export type JobWithRecruiter = JobPost & {
  recruiter: RecruiterWithProfile;
};

export type JobApplicationWithJobAndWorker = JobApplication & {
  job: JobPost;
  worker: WorkerWithProfile;
};

export type QuickJobWithWorkerAndReview = QuickJobRequest & {
  worker?: WorkerWithProfile;
  review?: Review;
}; 