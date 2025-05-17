# Supabase Database Setup Instructions

This README provides instructions on how to set up your Supabase database for the bilingual job-finding platform.

## Schema Overview

The database schema consists of the following main components:

1. User management (profiles, worker profiles, recruiter profiles)
2. Job management (job posts, job applications)
3. Quick job functionality (quick job requests)
4. Review system (reviews for both jobs and quick jobs)

All tables include Row Level Security (RLS) policies to ensure proper data access control.

## Setup Options

You can set up the database schema in one of the following ways:

### Option 1: Using the Supabase Dashboard SQL Editor

1. Log in to your Supabase dashboard at [https://app.supabase.com/](https://app.supabase.com/)
2. Select your project
3. Go to the SQL Editor section
4. Create a new query
5. Copy and paste the contents of `supabase_schema.sql` into the query editor
6. Run the query

### Option 2: Using the PostgreSQL CLI (psql)

If you have PostgreSQL client tools installed:

1. Open a terminal/command prompt
2. Run the following command:
   ```
   psql "postgresql://postgres:Blue.09@db.kogxvvtfdgugwroszkfo.supabase.co:5432/postgres" -f supabase_schema.sql
   ```

## Setting Up Environment Variables

Create a `.env` file in the root of your project with the following content:

```
# Supabase Config
VITE_SUPABASE_URL=https://kogxvvtfdgugwroszkfo.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_anon_key_here` with the actual anon key from your Supabase project.
You can find this in the Supabase dashboard under Project Settings > API.

It's also good practice to create a `.env.example` file without your actual keys:

```
# Supabase configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Make sure to add `.env` files to your `.gitignore` to prevent accidentally committing sensitive information.

## Understanding the Schema Structure

### User Management

- **profiles**: Base table for all users, linked to Supabase Auth
- **worker_profiles**: Extended profile for workers (blue-collar job seekers)
- **recruiter_profiles**: Extended profile for recruiters/employers

### Job System

- **job_posts**: Job listings created by recruiters
- **job_applications**: Applications submitted by workers for jobs

### Quick Job System

- **quick_job_requests**: On-demand service requests for immediate needs

### Reviews

- **reviews**: Feedback and ratings for completed jobs or quick services

## Important Notes

1. The schema includes triggers for:
   - Automatic profile creation when users sign up
   - Keeping timestamps updated

2. Row Level Security (RLS) policies ensure:
   - Users can only see appropriate data
   - Users can only modify their own data
   - Recruiters can only manage their own job posts
   - Workers can only manage their own applications

3. The auth trigger assumes that sign-up includes metadata with 'role' and possibly 'companyName' fields. Make sure your client application sends these during registration.

## Troubleshooting

- If you encounter "permission denied" errors, ensure your Supabase project is properly configured for RLS.
- If triggers fail to create profiles, check the auth.users table schema to ensure compatibility.
- If enum types already exist, you may need to remove those statements from the script. 