-- Create scraped_data table
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

-- Add indexes for common queries
CREATE INDEX idx_scraped_data_created_at ON public.scraped_data (created_at DESC);
CREATE INDEX idx_scraped_data_url ON public.scraped_data (url);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.scraped_data ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users full access" 
  ON public.scraped_data 
  FOR ALL 
  TO authenticated 
  USING (true);

-- Create policy for anonymous users (read-only)
CREATE POLICY "Allow anonymous users read-only access" 
  ON public.scraped_data 
  FOR SELECT 
  TO anon 
  USING (true);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_scraped_data_updated_at
BEFORE UPDATE ON public.scraped_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column(); 