import { JobPost, JobType } from "@/lib/supabase-types";

// Local storage keys
const STORAGE_KEYS = {
  JOB_POSTS: 'bluehire_job_posts',
  JOB_APPLICATIONS: 'bluehire_job_applications',
  WORKER_PROFILES: 'bluehire_worker_profiles',
  RECRUITER_PROFILES: 'bluehire_recruiter_profiles',
  PROFILES: 'bluehire_profiles',
  QUICK_JOBS: 'bluehire_quick_jobs',
  USERS: 'bluehire_users',
};

// Generic function to get items from localStorage
const getItems = <T>(key: string): T[] => {
  try {
    const items = localStorage.getItem(key);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error(`Error getting items from ${key}:`, error);
    return [];
  }
};

// Generic function to set items in localStorage
const setItems = <T>(key: string, items: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error(`Error saving items to ${key}:`, error);
  }
};

// Job Posts operations
export const getJobPosts = (): JobPost[] => {
  return getItems<JobPost>(STORAGE_KEYS.JOB_POSTS);
};

export const getJobPostsByRecruiterId = (recruiterId: string): JobPost[] => {
  const posts = getJobPosts();
  return posts.filter(post => post.recruiter_id === recruiterId);
};

export const getJobPostById = (jobId: string): JobPost | null => {
  const posts = getJobPosts();
  return posts.find(post => post.id === jobId) || null;
};

export const createJobPost = (jobData: {
  recruiter_id: string;
  title: string;
  type: JobType;
  category: string;
  location: string;
  salary_min: number;
  salary_max: number;
  experience_required: number;
  qualification?: string | null;
  description: string;
}): JobPost => {
  const posts = getJobPosts();
  const now = new Date().toISOString();
  const newJob: JobPost = {
    ...jobData,
    id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    created_at: now,
    updated_at: now,
    qualification: jobData.qualification || undefined,
  };
  
  posts.push(newJob);
  setItems(STORAGE_KEYS.JOB_POSTS, posts);
  return newJob;
};

export const updateJobPost = (jobId: string, updatedData: Partial<JobPost>): JobPost | null => {
  const posts = getJobPosts();
  const index = posts.findIndex(post => post.id === jobId);
  
  if (index !== -1) {
    const updatedJob = { 
      ...posts[index], 
      ...updatedData,
      updated_at: new Date().toISOString() 
    };
    posts[index] = updatedJob;
    setItems(STORAGE_KEYS.JOB_POSTS, posts);
    return updatedJob;
  }
  return null;
};

export const deleteJobPost = (jobId: string): boolean => {
  const posts = getJobPosts();
  const filtered = posts.filter(post => post.id !== jobId);
  
  if (filtered.length < posts.length) {
    setItems(STORAGE_KEYS.JOB_POSTS, filtered);
    
    // Also delete related applications
    const applications = getJobApplications();
    const filteredApplications = applications.filter(app => app.job_id !== jobId);
    setItems(STORAGE_KEYS.JOB_APPLICATIONS, filteredApplications);
    
    return true;
  }
  return false;
};

// Job Applications operations
interface JobApplication {
  id: string;
  job_id: string;
  worker_id: string;
  cover_note?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const getJobApplications = (): JobApplication[] => {
  return getItems<JobApplication>(STORAGE_KEYS.JOB_APPLICATIONS);
};

export const getJobApplicationsByWorkerId = (workerId: string): JobApplication[] => {
  const apps = getJobApplications();
  return apps.filter(app => app.worker_id === workerId);
};

export const getJobApplicationsForJob = (jobId: string): JobApplication[] => {
  const apps = getJobApplications();
  return apps.filter(app => app.job_id === jobId);
};

export const getJobApplicationsWithDetails = (workerId: string) => {
  const apps = getJobApplicationsByWorkerId(workerId);
  const jobPosts = getJobPosts();
  const recruiterProfiles = getRecruiterProfiles();
  
  return apps.map(app => {
    const job = jobPosts.find(j => j.id === app.job_id);
    const recruiter = job ? recruiterProfiles.find(r => r.id === job.recruiter_id) : null;
    
    return {
      ...app,
      job: job || { 
        id: "unknown",
        title: "Unknown Job", 
        type: "unknown" as JobType, 
        location: "Unknown",
        recruiter_id: "",
        category: "",
        salary_min: 0,
        salary_max: 0,
        experience_required: 0,
        description: "",
        created_at: "",
        updated_at: ""
      },
      recruiter
    };
  });
};

export const createJobApplication = (applicationData: {
  job_id: string;
  worker_id: string;
  cover_note?: string;
}): JobApplication => {
  const applications = getJobApplications();
  
  // Check if already applied
  const existingApp = applications.find(
    app => app.job_id === applicationData.job_id && app.worker_id === applicationData.worker_id
  );
  
  if (existingApp) {
    throw new Error("You have already applied for this job");
  }
  
  const now = new Date().toISOString();
  const newApplication: JobApplication = {
    ...applicationData,
    id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    status: 'pending',
    created_at: now,
    updated_at: now
  };
  
  applications.push(newApplication);
  setItems(STORAGE_KEYS.JOB_APPLICATIONS, applications);
  return newApplication;
};

export const updateJobApplication = (appId: string, updatedData: Partial<JobApplication>): JobApplication | null => {
  const applications = getJobApplications();
  const index = applications.findIndex(app => app.id === appId);
  
  if (index !== -1) {
    const updatedApp = { 
      ...applications[index], 
      ...updatedData,
      updated_at: new Date().toISOString()
    };
    applications[index] = updatedApp;
    setItems(STORAGE_KEYS.JOB_APPLICATIONS, applications);
    return updatedApp;
  }
  return null;
};

export const deleteJobApplication = (appId: string): boolean => {
  const applications = getJobApplications();
  const filtered = applications.filter(app => app.id !== appId);
  
  if (filtered.length < applications.length) {
    setItems(STORAGE_KEYS.JOB_APPLICATIONS, filtered);
    return true;
  }
  return false;
};

// Profiles operations
interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export const getProfiles = (): Profile[] => {
  return getItems<Profile>(STORAGE_KEYS.PROFILES);
};

export const getProfileById = (userId: string): { name: string; email: string; role: string } | null => {
  const users = getItems(STORAGE_KEYS.USERS) || [];
  const user = users.find((u: any) => u._id === userId);
  
  if (!user) return null;
  
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const createProfile = (profileData: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profile_picture?: string;
}): Profile => {
  const profiles = getProfiles();
  const now = new Date().toISOString();
  const newProfile: Profile = {
    ...profileData,
    created_at: now,
    updated_at: now
  };
  
  profiles.push(newProfile);
  setItems(STORAGE_KEYS.PROFILES, profiles);
  return newProfile;
};

// Worker profiles operations
interface WorkerProfile {
  id: string;
  skills: string[];
  experience_years: number;
  job_interests: string[];
  qualification: string;
  availability: boolean;
  is_quick_job_active: boolean;
  video_resume_url?: string;
  resume_text?: string;
  portfolio_links?: string[];
  certifications?: string[];
  languages?: string[];
  preferred_job_type?: string;
  preferred_location?: string;
  preferred_salary_range?: { min: number; max: number };
  about_me?: string;
  created_at: string;
  updated_at: string;
}

export const getWorkerProfiles = (): WorkerProfile[] => {
  return getItems<WorkerProfile>(STORAGE_KEYS.WORKER_PROFILES);
};

export const getWorkerProfileById = (userId: string): WorkerProfile | null => {
  const profiles = getWorkerProfiles();
  return profiles.find(profile => profile.id === userId) || null;
};

export const createWorkerProfile = (profileData: {
  id: string;
  skills: string[];
  experience_years: number;
  job_interests: string[];
  qualification: string;
  availability: boolean;
  is_quick_job_active: boolean;
  video_resume_url?: string;
  resume_text?: string;
  portfolio_links?: string[];
  certifications?: string[];
  languages?: string[];
  preferred_job_type?: string;
  preferred_location?: string;
  preferred_salary_range?: { min: number; max: number };
  about_me?: string;
}): WorkerProfile => {
  const now = new Date().toISOString();
  const newProfile: WorkerProfile = {
    ...profileData,
    created_at: now,
    updated_at: now
  };
  
  const profiles = getWorkerProfiles();
  profiles.push(newProfile);
  setItems(STORAGE_KEYS.WORKER_PROFILES, profiles);
  return newProfile;
};

// Update worker profile
export const updateWorkerProfile = (userId: string, profileData: Partial<WorkerProfile>): WorkerProfile | null => {
  const profiles = getWorkerProfiles();
  const profileIndex = profiles.findIndex(profile => profile.id === userId);
  
  if (profileIndex === -1) {
    // Profile doesn't exist, create a new one
    const now = new Date().toISOString();
    const newProfile: WorkerProfile = {
      id: userId,
      skills: profileData.skills || [],
      experience_years: profileData.experience_years || 0,
      job_interests: profileData.job_interests || [],
      qualification: profileData.qualification || '',
      availability: profileData.availability !== false,
      is_quick_job_active: profileData.is_quick_job_active || false,
      video_resume_url: profileData.video_resume_url,
      resume_text: profileData.resume_text,
      portfolio_links: profileData.portfolio_links || [],
      certifications: profileData.certifications || [],
      languages: profileData.languages || [],
      preferred_job_type: profileData.preferred_job_type,
      preferred_location: profileData.preferred_location,
      preferred_salary_range: profileData.preferred_salary_range || { min: 0, max: 0 },
      about_me: profileData.about_me || '',
      created_at: now,
      updated_at: now
    };
    
    profiles.push(newProfile);
    setItems(STORAGE_KEYS.WORKER_PROFILES, profiles);
    return newProfile;
  } else {
    // Update existing profile
    const now = new Date().toISOString();
    const updatedProfile = {
      ...profiles[profileIndex],
      ...profileData,
      updated_at: now
    };
    
    profiles[profileIndex] = updatedProfile;
    setItems(STORAGE_KEYS.WORKER_PROFILES, profiles);
    return updatedProfile;
  }
};

// Recruiter profiles operations
interface RecruiterProfile {
  id: string;
  company_name: string;
  company_type: string;
  industry: string;
  about: string;
  company_size?: string;
  founded_year?: number;
  company_website?: string;
  company_logo_url?: string;
  social_media?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  office_locations?: string[];
  benefits_offered?: string[];
  contact_email: string;
  contact_phone?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export const getRecruiterProfiles = (): RecruiterProfile[] => {
  return getItems<RecruiterProfile>(STORAGE_KEYS.RECRUITER_PROFILES);
};

export const getRecruiterProfileById = (userId: string): RecruiterProfile | null => {
  const profiles = getRecruiterProfiles();
  return profiles.find(profile => profile.id === userId) || null;
};

export const createRecruiterProfile = (profileData: {
  id: string;
  company_name: string;
  company_type: string;
  industry: string;
  about: string;
  company_size?: string;
  founded_year?: number;
  company_website?: string;
  company_logo_url?: string;
  social_media?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  office_locations?: string[];
  benefits_offered?: string[];
  contact_email: string;
  contact_phone?: string;
  is_approved: boolean;
}): RecruiterProfile => {
  const now = new Date().toISOString();
  const newProfile: RecruiterProfile = {
    ...profileData,
    created_at: now,
    updated_at: now
  };
  
  const profiles = getRecruiterProfiles();
  profiles.push(newProfile);
  setItems(STORAGE_KEYS.RECRUITER_PROFILES, profiles);
  return newProfile;
};

// Update recruiter profile
export const updateRecruiterProfile = (userId: string, profileData: Partial<RecruiterProfile>): RecruiterProfile | null => {
  const profiles = getRecruiterProfiles();
  const profileIndex = profiles.findIndex(profile => profile.id === userId);
  
  if (profileIndex === -1) {
    // Profile doesn't exist, create a new one
    const now = new Date().toISOString();
    const newProfile: RecruiterProfile = {
      id: userId,
      company_name: profileData.company_name || '',
      company_type: profileData.company_type || '',
      industry: profileData.industry || '',
      about: profileData.about || '',
      company_size: profileData.company_size,
      founded_year: profileData.founded_year ? Number(profileData.founded_year) : undefined,
      company_website: profileData.company_website,
      company_logo_url: profileData.company_logo_url,
      social_media: profileData.social_media || {
        linkedin: '',
        twitter: '',
        facebook: ''
      },
      office_locations: profileData.office_locations || [],
      benefits_offered: profileData.benefits_offered || [],
      contact_email: profileData.contact_email || '',
      contact_phone: profileData.contact_phone,
      is_approved: true, // Auto-approve for localStorage version
      created_at: now,
      updated_at: now
    };
    
    profiles.push(newProfile);
    setItems(STORAGE_KEYS.RECRUITER_PROFILES, profiles);
    return newProfile;
  } else {
    // Update existing profile
    const now = new Date().toISOString();
    const updatedProfile = {
      ...profiles[profileIndex],
      ...profileData,
      updated_at: now
    };
    
    profiles[profileIndex] = updatedProfile;
    setItems(STORAGE_KEYS.RECRUITER_PROFILES, profiles);
    return updatedProfile;
  }
};

// Initialize with sample data if empty
export const initializeLocalStorage = () => {
  // Initialize job posts if empty
  const jobPosts = getJobPosts();
  if (jobPosts.length === 0) {
    setItems(STORAGE_KEYS.JOB_POSTS, sampleJobPosts);
  }
  
  // Initialize other collections as needed
  const recruiterProfiles = getRecruiterProfiles();
  if (recruiterProfiles.length === 0) {
    setItems(STORAGE_KEYS.RECRUITER_PROFILES, sampleRecruiterProfiles);
  }
  
  const profiles = getProfiles();
  if (profiles.length === 0) {
    setItems(STORAGE_KEYS.PROFILES, sampleProfiles);
  }
};

// Sample data
const sampleProfiles: Profile[] = [
  {
    id: 'recruiter-1',
    name: 'ABC Construction',
    email: 'info@abcconstruction.com',
    phone: '9876543210',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'recruiter-2',
    name: 'XYZ Facilities',
    email: 'contact@xyzfacilities.com',
    phone: '9876543211',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'worker-1',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '9876543212',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const sampleRecruiterProfiles: RecruiterProfile[] = [
  {
    id: 'recruiter-1',
    company_name: 'ABC Construction Pvt Ltd',
    company_type: 'Private Limited',
    industry: 'Construction',
    about: 'Leading construction company specializing in residential and commercial projects.',
    contact_email: 'info@abcconstruction.com',
    contact_phone: '9876543210',
    is_approved: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'recruiter-2',
    company_name: 'XYZ Facilities Management',
    company_type: 'LLP',
    industry: 'Facility Management',
    about: 'Provides comprehensive facility management services.',
    contact_email: 'contact@xyzfacilities.com',
    contact_phone: '9876543211',
    is_approved: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const now = new Date().toISOString();

const sampleJobPosts: JobPost[] = [
  {
    id: 'job-1',
    recruiter_id: 'recruiter-1',
    title: 'Electrician for Commercial Project',
    type: 'full-time',
    category: 'Electrical',
    location: 'Bangalore',
    salary_min: 18000,
    salary_max: 25000,
    experience_required: 2,
    qualification: 'ITI Electrical',
    description: 'Looking for experienced electricians for a commercial building project. Must be familiar with industrial wiring and safety protocols.',
    created_at: new Date('2023-04-15').toISOString(),
    updated_at: now
  },
  {
    id: 'job-2',
    recruiter_id: 'recruiter-2',
    title: 'Plumber for Residential Complex',
    type: 'full-time',
    category: 'Plumbing',
    location: 'Mysore',
    salary_min: 15000,
    salary_max: 22000,
    experience_required: 1,
    qualification: 'ITI Plumbing',
    description: 'We need skilled plumbers for apartment building maintenance. Should have experience with modern plumbing systems.',
    created_at: new Date('2023-04-10').toISOString(),
    updated_at: now
  },
  {
    id: 'job-3',
    recruiter_id: 'recruiter-1',
    title: 'AC Technician',
    type: 'part-time',
    category: 'HVAC',
    location: 'Bangalore',
    salary_min: 20000,
    salary_max: 30000,
    experience_required: 3,
    qualification: 'HVAC Certification',
    description: 'Experienced AC technician needed for servicing and repairs. Must have knowledge of multiple brands and models.',
    created_at: new Date('2023-04-12').toISOString(),
    updated_at: now
  }
]; 