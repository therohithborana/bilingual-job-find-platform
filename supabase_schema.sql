-- Create enum types for role types
CREATE TYPE public.user_role AS ENUM ('worker', 'recruiter', 'admin');
CREATE TYPE public.job_type AS ENUM ('full-time', 'part-time', 'contract');
CREATE TYPE public.quick_job_status AS ENUM ('pending', 'accepted', 'cancelled', 'completed');

-- Create a profiles table that extends auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'worker',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  profile_pic_url TEXT,
  location TEXT,
  languages TEXT[] DEFAULT ARRAY['English'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Worker profiles table
CREATE TABLE public.worker_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  skills TEXT[] NOT NULL DEFAULT '{}',
  experience_years INTEGER NOT NULL DEFAULT 0,
  job_interests TEXT[] NOT NULL DEFAULT '{}',
  qualification TEXT,
  availability BOOLEAN DEFAULT TRUE,
  video_resume_url TEXT,
  is_quick_job_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Recruiter profiles table
CREATE TABLE public.recruiter_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_type TEXT,
  industry TEXT,
  about TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Job posts table
CREATE TABLE public.job_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type job_type NOT NULL DEFAULT 'full-time',
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_min INTEGER NOT NULL,
  salary_max INTEGER NOT NULL,
  experience_required INTEGER DEFAULT 0,
  qualification TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Job applications table
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  cover_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(job_id, worker_id)
);

-- Quick job requests table
CREATE TABLE public.quick_job_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  location TEXT NOT NULL,
  worker_id UUID REFERENCES worker_profiles(id) ON DELETE SET NULL,
  status quick_job_status NOT NULL DEFAULT 'pending',
  happy_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  chat_channel_id TEXT
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quick_job_id UUID REFERENCES quick_job_requests(id) ON DELETE CASCADE,
  job_application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CHECK ((quick_job_id IS NULL AND job_application_id IS NOT NULL) OR 
         (quick_job_id IS NOT NULL AND job_application_id IS NULL))
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating the updated_at column
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_profiles_updated_at
BEFORE UPDATE ON worker_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recruiter_profiles_updated_at
BEFORE UPDATE ON recruiter_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_posts_updated_at
BEFORE UPDATE ON job_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON job_applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quick_job_requests_updated_at
BEFORE UPDATE ON quick_job_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 
         (NEW.raw_user_meta_data->>'role')::user_role);
  
  -- Create worker or recruiter profile based on role
  IF (NEW.raw_user_meta_data->>'role')::user_role = 'worker' THEN
    INSERT INTO public.worker_profiles (id)
    VALUES (NEW.id);
  ELSIF (NEW.raw_user_meta_data->>'role')::user_role = 'recruiter' THEN
    INSERT INTO public.recruiter_profiles (id, company_name, contact_email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'companyName', 'Company'), NEW.email);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
-- Profiles: users can read their own profile
CREATE POLICY "Users can read their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Workers: users can read all worker profiles
CREATE POLICY "Users can read all worker profiles"
ON public.worker_profiles
FOR SELECT
TO authenticated
USING (true);

-- Workers: workers can update their own profile
CREATE POLICY "Workers can update their own profile"
ON public.worker_profiles
FOR UPDATE
USING (auth.uid() = id);

-- Recruiters: users can read approved recruiter profiles
CREATE POLICY "Users can read approved recruiter profiles"
ON public.recruiter_profiles
FOR SELECT
USING ((SELECT is_approved FROM public.recruiter_profiles WHERE id = auth.uid()) = true);

-- Recruiters: recruiters can update their own profile
CREATE POLICY "Recruiters can update their own profile"
ON public.recruiter_profiles
FOR UPDATE
USING (auth.uid() = id);

-- Job posts: everyone can read active job posts
CREATE POLICY "Everyone can read job posts"
ON public.job_posts
FOR SELECT
USING (true);

-- Job posts: recruiters can CRUD their own job posts
CREATE POLICY "Recruiters can create job posts"
ON public.job_posts
FOR INSERT
WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can update their own job posts"
ON public.job_posts
FOR UPDATE
USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can delete their own job posts"
ON public.job_posts
FOR DELETE
USING (auth.uid() = recruiter_id);

-- Job applications: workers can create applications
CREATE POLICY "Workers can create job applications"
ON public.job_applications
FOR INSERT
WITH CHECK (auth.uid() = worker_id);

-- Job applications: workers can see their own applications
CREATE POLICY "Workers can see their own applications"
ON public.job_applications
FOR SELECT
USING (auth.uid() = worker_id);

-- Job applications: recruiters can see applications for their jobs
CREATE POLICY "Recruiters can see applications for their jobs"
ON public.job_applications
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM job_posts 
  WHERE job_posts.id = job_applications.job_id 
  AND job_posts.recruiter_id = auth.uid()
));

-- Quick job requests: everyone can see and create
CREATE POLICY "Everyone can see and create quick job requests"
ON public.quick_job_requests
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create quick job requests"
ON public.quick_job_requests
FOR INSERT
WITH CHECK (true);

-- Quick job requests: workers can update quick jobs assigned to them
CREATE POLICY "Workers can update their assigned quick jobs"
ON public.quick_job_requests
FOR UPDATE
USING (auth.uid() = worker_id);

-- Reviews: anyone can create reviews
CREATE POLICY "Anyone can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (true);

-- Reviews: anyone can read reviews
CREATE POLICY "Anyone can read reviews"
ON public.reviews
FOR SELECT
USING (true); 