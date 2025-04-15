import { supabase } from '../supabase';

export interface Deal {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  start_date: string;
  end_date: string;
  conditions?: Record<string, any>;
  banner_image?: string;
  status: 'draft' | 'active' | 'expired';
}

export const getActiveDeals = async () => {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('status', 'active')
    .gte('end_date', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Deal[];
};

export const getDealsByCategory = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('status', 'active')
    .eq('category_id', categoryId)
    .gte('end_date', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Deal[];
};