import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Get the environment variables or use placeholders for development
// Replace these with your actual Supabase URL and anon key when deploying
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// For development: Log a warning if using placeholder values
if (supabaseUrl === 'https://your-project-id.supabase.co' || supabaseAnonKey === 'your-anon-key') {
  console.warn(
    'Using placeholder Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables in a .env file.'
  );
}

// Create a single supabase client for the entire app
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper function to get the current user's profile
export const getCurrentProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return profile;
};

// Helper function to get the current user's worker profile
export const getCurrentWorkerProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data: workerProfile } = await supabase
    .from('worker_profiles')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('id', user.id)
    .single();
    
  return workerProfile;
};

// Helper function to get the current user's recruiter profile
export const getCurrentRecruiterProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data: recruiterProfile } = await supabase
    .from('recruiter_profiles')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('id', user.id)
    .single();
    
  return recruiterProfile;
};

// Job-related helpers
export const getJobs = async (filters?: {
  category?: string;
  location?: string;
  type?: string;
  minSalary?: number;
  maxExperience?: number;
}) => {
  let query = supabase
    .from('job_posts')
    .select(`
      *,
      recruiter:recruiter_profiles(
        *,
        profile:profiles(*)
      )
    `);
  
  // Apply filters
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters?.location) {
    query = query.eq('location', filters.location);
  }
  
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  
  if (filters?.minSalary) {
    query = query.gte('salary_min', filters.minSalary);
  }
  
  if (filters?.maxExperience) {
    query = query.lte('experience_required', filters.maxExperience);
  }
  
  const { data: jobs, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
  
  return jobs;
};

export const getJobById = async (jobId: string) => {
  const { data: job } = await supabase
    .from('job_posts')
    .select(`
      *,
      recruiter:recruiter_profiles(
        *,
        profile:profiles(*)
      )
    `)
    .eq('id', jobId)
    .single();
    
  return job;
};

// Quick jobs related helpers
export const getQuickJobs = async (filters?: {
  status?: string;
  service_type?: string;
  location?: string;
}) => {
  let query = supabase
    .from('quick_job_requests')
    .select(`
      *,
      worker:worker_profiles(
        *,
        profile:profiles(*)
      ),
      review:reviews(*)
    `);
  
  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.service_type) {
    query = query.eq('service_type', filters.service_type);
  }
  
  if (filters?.location) {
    query = query.eq('location', filters.location);
  }
  
  const { data: quickJobs, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching quick jobs:', error);
    return [];
  }
  
  return quickJobs;
};

// Job applications helpers
export const applyForJob = async (jobId: string, coverNote?: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('job_applications')
    .insert({
      job_id: jobId,
      worker_id: user.id,
      cover_note: coverNote || null,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error applying for job:', error);
    throw error;
  }
  
  return data;
};

// Get worker applications
export const getWorkerApplications = async () => {
  const user = await getCurrentUser();
  if (!user) return [];
  
  const { data: applications, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      job:job_posts(*)
    `)
    .eq('worker_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
  
  return applications;
};

// Quick job functions
export const createQuickJobRequest = async (
  customerName: string,
  serviceType: string,
  location: string
) => {
  const { data, error } = await supabase
    .from('quick_job_requests')
    .insert({
      customer_name: customerName,
      service_type: serviceType,
      location: location,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating quick job request:', error);
    throw error;
  }
  
  return data;
};

// Accept a quick job (for workers)
export const acceptQuickJob = async (quickJobId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('quick_job_requests')
    .update({
      worker_id: user.id,
      status: 'accepted'
    })
    .eq('id', quickJobId)
    .select()
    .single();
  
  if (error) {
    console.error('Error accepting quick job:', error);
    throw error;
  }
  
  return data;
};

// Submit a review
export const submitReview = async (
  rating: number, 
  comment: string, 
  quickJobId?: string,
  jobApplicationId?: string
) => {
  if (!quickJobId && !jobApplicationId) {
    throw new Error('Either quickJobId or jobApplicationId must be provided');
  }
  
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      rating,
      comment,
      quick_job_id: quickJobId || null,
      job_application_id: jobApplicationId || null
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
  
  return data;
}; 