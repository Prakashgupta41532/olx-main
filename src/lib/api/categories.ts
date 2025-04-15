import { supabase } from '../supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  parent_id: string | null;
  featured: boolean;
  order_index: number;
  subcategories?: Category[];
}

export interface CategoryAttribute {
  id: string;
  category_id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect';
  options?: string[];
  validation?: Record<string, any>;
  required: boolean;
  order_index: number;
}

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*, subcategories:categories(id, name, slug, icon)')
    .is('parent_id', null)
    .order('order_index');

  if (error) throw error;
  return data as Category[];
};

export const getCategoryAttributes = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('category_attributes')
    .select('*')
    .eq('category_id', categoryId)
    .order('order_index');

  if (error) throw error;
  return data as CategoryAttribute[];
};

export const getFeaturedCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('featured', true)
    .order('order_index');

  if (error) throw error;
  return data as Category[];
};