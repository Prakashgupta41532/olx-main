import { supabase } from '../supabase';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
  seller_id: string;
  location: {
    address: string;
    coordinates?: [number, number];
  };
  status: 'active' | 'sold' | 'archived';
  images: string[];
  tags?: string[];
  views_count: number;
  created_at: string;
  updated_at: string;
  negotiable: boolean;
  condition?: string;
  brand?: string;
  model?: string;
  year?: number;
}

export const getListings = async (filters?: {
  category_id?: string;
  location?: string;
  price_min?: number;
  price_max?: number;
  condition?: string;
  sort_by?: string;
}) => {
  let query = supabase.from('listings').select('*').eq('status', 'active');

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }

  if (filters?.location) {
    query = query.textSearch('location->>address', filters.location);
  }

  if (filters?.price_min) {
    query = query.gte('price', filters.price_min);
  }

  if (filters?.price_max) {
    query = query.lte('price', filters.price_max);
  }

  if (filters?.condition) {
    query = query.eq('condition', filters.condition);
  }

  if (filters?.sort_by) {
    switch (filters.sort_by) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'date_desc':
        query = query.order('created_at', { ascending: false });
        break;
      case 'views_desc':
        query = query.order('views_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Listing[];
};

export const createListing = async (listing: Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'views_count'>) => {
  const { data, error } = await supabase
    .from('listings')
    .insert(listing)
    .select()
    .single();

  if (error) throw error;
  return data as Listing;
};

export const updateListing = async (id: string, updates: Partial<Listing>) => {
  const { data, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Listing;
};

export const deleteListing = async (id: string) => {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);

  if (error) throw error;
};