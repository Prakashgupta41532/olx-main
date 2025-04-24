-- Fix missing columns in profiles table
DO $$ 
BEGIN
  -- Check and add bio column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    RAISE NOTICE 'Added bio column to profiles table';
  END IF;

  -- Check and add other potentially missing columns
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    RAISE NOTICE 'Added full_name column to profiles table';
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT;
    RAISE NOTICE 'Added username column to profiles table';
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    RAISE NOTICE 'Added avatar_url column to profiles table';
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
    RAISE NOTICE 'Added phone_number column to profiles table';
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN location TEXT;
    RAISE NOTICE 'Added location column to profiles table';
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'website'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN website TEXT;
    RAISE NOTICE 'Added website column to profiles table';
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'social_links'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN social_links JSONB DEFAULT '{"facebook": "", "twitter": "", "instagram": "", "linkedin": ""}';
    RAISE NOTICE 'Added social_links column to profiles table';
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN preferences JSONB DEFAULT '{"notifications": true, "marketing_emails": true, "language": "en", "theme": "light"}';
    RAISE NOTICE 'Added preferences column to profiles table';
  END IF;

  -- Create a stored procedure to help check available columns
  -- This will be used by the client to check which columns exist
  CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
  RETURNS text[] AS $$
  DECLARE
    columns text[];
  BEGIN
    SELECT array_agg(column_name::text) INTO columns
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = table_name;
    RETURN columns;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Refresh the schema cache to ensure PostgREST sees the new columns
  NOTIFY pgrst, 'reload schema';
  RAISE NOTICE 'Schema cache refreshed';
END $$;
