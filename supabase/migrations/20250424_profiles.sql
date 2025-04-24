-- Create profiles table if it doesn't exist with enhanced structure
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT,
      full_name TEXT,
      username TEXT,
      avatar_url TEXT,
      phone_number TEXT,
      location TEXT,
      bio TEXT,
      website TEXT,
      social_links JSONB DEFAULT '{"facebook": "", "twitter": "", "instagram": "", "linkedin": ""}',
      preferences JSONB DEFAULT '{"notifications": true, "marketing_emails": true, "language": "en", "theme": "light"}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
    );
    
    -- Add a comment to the table
    COMMENT ON TABLE profiles IS 'User profile information for OLX clone application';
  ELSE
    -- Check and add any missing columns to existing table
    DO $COLUMN_UPDATE$
    BEGIN
      -- Add email column if it doesn't exist
      IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'profiles'::regclass AND attname = 'email' AND NOT attisdropped) THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
      END IF;
      
      -- Add social_links column if it doesn't exist
      IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'profiles'::regclass AND attname = 'social_links' AND NOT attisdropped) THEN
        ALTER TABLE profiles ADD COLUMN social_links JSONB DEFAULT '{"facebook": "", "twitter": "", "instagram": "", "linkedin": ""}';
      END IF;
      
      -- Add preferences column if it doesn't exist
      IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'profiles'::regclass AND attname = 'preferences' AND NOT attisdropped) THEN
        ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{"notifications": true, "marketing_emails": true, "language": "en", "theme": "light"}';
      END IF;
    END $COLUMN_UPDATE$;
  END IF;
  
  -- Create unique index on username but allow nulls
  IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'profiles_username_idx') THEN
    CREATE UNIQUE INDEX profiles_username_idx ON profiles (username) WHERE username IS NOT NULL;
  END IF;
END $$;

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for avatars
-- First, make sure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload their own avatars
DO $$ 
BEGIN
  -- Drop existing policy if it exists
  BEGIN
    DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  -- Check if the policy already exists
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can upload their own avatars' AND tablename = 'objects' AND schemaname = 'storage') THEN
    -- Create a completely permissive policy for avatar uploads
    CREATE POLICY "Users can upload their own avatars"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
  END IF;
END $$;

-- Allow public read access to avatars
DO $$ 
BEGIN
  -- Drop existing policy if it exists
  BEGIN
    DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  -- Check if the policy already exists
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Public can view avatars' AND tablename = 'objects' AND schemaname = 'storage') THEN
    -- Create policy for public read access
    CREATE POLICY "Public can view avatars"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'user-avatars');
  END IF;
END $$;

-- Add policy for authenticated users to update and delete their avatars
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  BEGIN
    DROP POLICY IF EXISTS "Users can update and delete their own avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  -- Check if the policy already exists
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can update their own avatars' AND tablename = 'objects' AND schemaname = 'storage') THEN
    -- Create policy for update (completely permissive)
    CREATE POLICY "Users can update their own avatars"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (true);
  END IF;
  
  -- Check if the policy already exists
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can delete their own avatars' AND tablename = 'objects' AND schemaname = 'storage') THEN
    -- Create policy for delete (completely permissive)
    CREATE POLICY "Users can delete their own avatars"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Set up RLS (Row Level Security) for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read any profile
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE policyname = 'Anyone can read profiles' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Anyone can read profiles"
    ON profiles
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Create policy for users to update only their own profile
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE policyname = 'Users can update their own profile' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Create policy for users to insert only their own profile
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE policyname = 'Users can insert their own profile' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Create function to handle profile updates with enhanced validation
CREATE OR REPLACE FUNCTION handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Always update the timestamp
  NEW.updated_at = TIMEZONE('utc', NOW());
  
  -- Ensure email is not changed (it should match the auth.users email)
  IF TG_OP = 'UPDATE' AND OLD.email IS NOT NULL AND NEW.email <> OLD.email THEN
    RAISE WARNING 'Email cannot be changed directly in profiles table';
    NEW.email = OLD.email;
  END IF;
  
  -- Validate username format if provided
  IF NEW.username IS NOT NULL THEN
    -- Remove any special characters and spaces from username
    NEW.username = REGEXP_REPLACE(NEW.username, '[^a-zA-Z0-9_]', '', 'g');
    
    -- Ensure username is at least 3 characters
    IF LENGTH(NEW.username) < 3 THEN
      NEW.username = NEW.username || SUBSTRING(MD5(NEW.id::text) FROM 1 FOR (3 - LENGTH(NEW.username)));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update the updated_at timestamp
DROP TRIGGER IF EXISTS update_profile_timestamp ON profiles;
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_trigger WHERE tgname = 'update_profile_timestamp' AND tgrelid = 'profiles'::regclass
  ) THEN
    CREATE TRIGGER update_profile_timestamp
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_profile_update();
  END IF;
END $$;

-- Create function to automatically create a profile when a new user signs up
-- Enhanced to handle existing profiles and include more user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if profile already exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    -- Extract username from email if available
    DECLARE
      username_from_email TEXT := SPLIT_PART(NEW.email, '@', 1);
    BEGIN
      -- Insert new profile with more initial data
      INSERT INTO public.profiles (
        id, 
        email, 
        username,
        created_at,
        updated_at,
        preferences
      )
      VALUES (
        NEW.id, 
        NEW.email,
        -- Generate a unique username by adding random suffix if needed
        CASE 
          WHEN EXISTS (SELECT 1 FROM public.profiles WHERE username = username_from_email) 
          THEN username_from_email || '_' || SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6)
          ELSE username_from_email
        END,
        COALESCE(NEW.created_at, TIMEZONE('utc', NOW())),
        TIMEZONE('utc', NOW()),
        jsonb_build_object(
          'notifications', true,
          'marketing_emails', true,
          'language', 'en',
          'theme', 'light'
        )
      );
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_trigger WHERE tgname = 'on_auth_user_created' AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
