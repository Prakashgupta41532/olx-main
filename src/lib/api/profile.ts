import { supabase } from '../supabase';

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  phone_number?: string;
  location?: string;
  bio?: string;
  website?: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  preferences?: {
    notifications?: boolean;
    marketing_emails?: boolean;
    language?: string;
    theme?: string;
  };
  created_at?: string;
  updated_at?: string;
}

/**
 * Get the current user's profile
 */
export const getProfile = async (): Promise<UserProfile | null> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No user logged in');
      return null;
    }
    
    // Get the user's profile from the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      // If the profile doesn't exist, return a basic profile with just the ID
      if (error.code === 'PGRST116') {
        return {
          id: user.id,
          email: user.email
        };
      }
      throw error;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error('Exception in getProfile:', error);
    throw error;
  }
};

/**
 * Update the current user's profile
 */
export const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No user logged in');
    }

    // Filter out any undefined or null values from updates
    const filteredUpdates: Record<string, unknown> = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        filteredUpdates[key] = value;
      }
    });

    // Handle nested objects like social_links separately to avoid overwriting the entire object
    if (updates.social_links) {
      // First get the existing social_links if any
      const { data: existingData } = await supabase
        .from('profiles')
        .select('social_links')
        .eq('id', user.id)
        .maybeSingle();
      
      const existingSocialLinks = existingData?.social_links || {};
      filteredUpdates.social_links = { ...existingSocialLinks, ...updates.social_links };
    }

    // Prepare the profile data
    const profileData = {
      id: user.id,
      email: user.email,
      ...filteredUpdates,
      updated_at: new Date().toISOString()
    };

    // Check if profile exists by trying to get it
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle(); // Use maybeSingle instead of single to avoid PGRST116 error
    
    // If this is a new profile, add created_at
    if (!existingProfile) {
      profileData.created_at = new Date().toISOString();
      console.log('Creating new profile for user:', user.id);
    } else {
      console.log('Updating existing profile for user:', user.id);
    }
    
    // Try to get the available columns in the profiles table
    try {
      const { error: columnsError, data: columnsData } = await supabase
        .rpc('get_table_columns', { table_name: 'profiles' });
      
      if (!columnsError && columnsData) {
        // Filter out properties that don't exist as columns
        const availableColumns = new Set(columnsData);
        Object.keys(profileData).forEach(key => {
          if (!availableColumns.has(key) && key !== 'id' && key !== 'email') {
            console.warn(`Column '${key}' does not exist in profiles table, removing from update`);
            // Use type-safe approach to delete properties
            const typedProfileData = profileData as Record<string, unknown>;
            delete typedProfileData[key];
          }
        });
      }
    } catch (e) {
      console.warn('Could not check available columns:', e);
      // Continue with the update anyway
    }
    
    // Use upsert to create or update the profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select();
    
    if (error) {
      console.error('Error updating profile:', error);
      
      // If the error is about a missing column, try a simpler update with just basic fields
      if (error.message && error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('Trying simplified profile update with basic fields only');
        
        // Use only basic fields that are guaranteed to exist
        const basicProfileData: Record<string, unknown> = {
          id: user.id,
          email: user.email,
          updated_at: new Date().toISOString()
        };
        
        if (!existingProfile) {
          basicProfileData['created_at'] = new Date().toISOString();
        }
        
        const { data: basicData, error: basicError } = await supabase
          .from('profiles')
          .upsert(basicProfileData)
          .select();
          
        if (basicError) {
          console.error('Even basic profile update failed:', basicError);
          throw basicError;
        }
        
        if (!basicData || basicData.length === 0) {
          throw new Error('Failed to update profile - no data returned');
        }
        
        return basicData[0] as UserProfile;
      }
      
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Failed to update profile - no data returned');
    }
    
    return data[0] as UserProfile;
  } catch (error) {
    console.error('Exception in updateProfile:', error);
    throw error;
  }
};

/**
 * Upload a profile avatar image
 * @returns The URL of the uploaded avatar
 */
export const uploadAvatar = async (file: File): Promise<string> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No user logged in');
    }
    
    // Validate file type and size
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const validTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!fileExt || !validTypes.includes(fileExt)) {
      throw new Error('Invalid file type. Please upload an image file (jpg, jpeg, png, gif, webp)');
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File too large. Maximum size is 5MB');
    }
    
    // Create a unique file name
    const fileName = `${user.id}-${Date.now().toString()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    // Make sure we have the latest auth session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session found. Please log in again.');
    }
    
    // First check if the bucket exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'user-avatars');
      
      if (!bucketExists) {
        console.log('Bucket does not exist, attempting to create it');
        // Try to create the bucket if it doesn't exist
        const { error: createBucketError } = await supabase.storage.createBucket('user-avatars', {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024 // 5MB limit
        });
        
        if (createBucketError) {
          console.error('Error creating bucket:', createBucketError);
          // Continue anyway - bucket might exist but we don't have permission to list it
        }
      }
    } catch (error) {
      console.warn('Error checking bucket existence:', error);
      // Continue anyway - we'll try to upload regardless
    }
    
    // Create a FormData object for the file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Try direct upload first using the Supabase storage API
    console.log(`Uploading avatar to path: ${filePath}`);
    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true // Overwrite if exists
      });
    
    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      
      // If the error is related to permissions, try a different approach
      if (uploadError.message?.includes('permission') || uploadError.message?.includes('403')) {
        console.log('Permission error, trying alternative upload method...');
        
        // Try to use a direct API call to the storage endpoint
        try {
          // Get the direct upload URL - use the environment variable
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
          const uploadUrl = `${supabaseUrl}/storage/v1/object/user-avatars/${filePath}`;
          
          // Make a direct PUT request
          const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': file.type,
              'x-upsert': 'true'
            },
            body: file
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Alternative upload failed:', errorText);
            throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
          }
          
          console.log('Alternative upload method succeeded');
        } catch (altError) {
          console.error('Alternative upload method failed:', altError);
          throw new Error(`Unable to upload avatar: ${uploadError.message || uploadError}`);
        }
      } else {
        throw uploadError;
      }
    }
    
    // Get the public URL with cache busting parameter
    const timestamp = Date.now();
    const { data } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath);
    
    if (!data || !data.publicUrl) {
      throw new Error('Failed to get public URL for uploaded avatar');
    }
    
    // Add cache busting parameter
    const publicUrl = `${data.publicUrl}?t=${timestamp}`;
    
    // Update the user's profile with the new avatar URL
    try {
      await updateProfile({ avatar_url: publicUrl });
    } catch (error) {
      console.warn('Profile update failed but avatar was uploaded:', error);
      // Continue anyway since the avatar was uploaded successfully
    }
    
    console.log('Avatar uploaded successfully:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Exception in uploadAvatar:', error);
    throw error;
  }
};

/**
 * Get all user profiles (admin only)
 */
export const getAllProfiles = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all profiles:', error);
      throw error;
    }
    
    return data as UserProfile[];
  } catch (error) {
    console.error('Exception in getAllProfiles:', error);
    throw error;
  }
};
