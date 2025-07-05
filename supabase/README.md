# Supabase Setup for Content Scraper

This directory contains database migrations and seed data for the Content Scraper application.

## Database Schema

The main table is `scraped_data` which stores all information about scraped websites:

```sql
CREATE TABLE public.scraped_data (
  id UUID PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  headings JSONB NOT NULL DEFAULT '[]'::jsonb,
  links JSONB NOT NULL DEFAULT '[]'::jsonb,
  screenshot TEXT,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Setup Instructions

### Option 1: Using Supabase CLI

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Apply migrations:
   ```bash
   supabase db push
   ```

### Option 2: Manual Setup

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of `migrations/20250704_initial_schema.sql`
4. Run the SQL in the editor
5. Optionally, run the seed data from `seed.sql`

## Environment Variables

Make sure to set up the following environment variables in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Row Level Security (RLS)

The migrations set up the following RLS policies:

1. Authenticated users have full access to the `scraped_data` table
2. Anonymous users have read-only access to the `scraped_data` table

## Database Indexes

The following indexes are created for better performance:

1. `idx_scraped_data_created_at` - For sorting by creation date
2. `idx_scraped_data_url` - For searching by URL 