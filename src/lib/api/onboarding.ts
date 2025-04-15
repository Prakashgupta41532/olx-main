import { supabase } from '../supabase';

export interface OnboardingData {
  id: string;
  user_id: string;
  selfie_url?: string;
  id_document_url?: string;
  status: 'pending' | 'verified' | 'rejected';
  completed_steps: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export const getOnboardingStatus = async (userId: string) => {
  const { data, error } = await supabase
    .from('onboarding')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as OnboardingData | null;
};

export const updateOnboarding = async (
  userId: string,
  updates: Partial<Omit<OnboardingData, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
) => {
  const { data, error } = await supabase
    .from('onboarding')
    .upsert({ user_id: userId, ...updates })
    .select()
    .single();

  if (error) throw error;
  return data as OnboardingData;
};

export const uploadVerificationDocument = async (
  userId: string,
  file: File,
  type: 'selfie' | 'id_document'
) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${type}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('verification-documents')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('verification-documents')
    .getPublicUrl(fileName);

  const updates = type === 'selfie'
    ? { selfie_url: publicUrl }
    : { id_document_url: publicUrl };

  return updateOnboarding(userId, updates);
};