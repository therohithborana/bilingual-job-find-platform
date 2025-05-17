# Supabase Setup Guide

## Environment Variables Setup

To properly configure your Supabase connection, you need to set up environment variables with your Supabase project credentials.

### 1. Create a .env file

Create a file named `.env` in the root of your project (same level as package.json).

### 2. Add Supabase credentials

Add the following lines to your `.env` file:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Replace:
- `your-supabase-url` with your actual Supabase project URL (e.g., https://abcdefghijklm.supabase.co)
- `your-supabase-anon-key` with your project's anon/public key

### 3. Where to find your Supabase credentials

1. Go to [Supabase Dashboard](https://app.supabase.io)
2. Select your project
3. Go to Project Settings > API
4. Find the "Project URL" and "Project API keys"
5. Copy the "URL" value and the "anon public" key

### 4. Restart your development server

After creating the .env file, restart your development server:

```
npm run dev
```

## Note

- The .env file should NOT be committed to your git repository
- Make sure .env is listed in your .gitignore file
- For production deployments, set these environment variables in your hosting platform 