import { supabase } from '../supabase';

export interface ProductListing {
  id: string;
  title: string;
  price: number;
  location: string;
  distance?: string;
  image?: string;
  condition?: string;
  posted?: string;
  verified: boolean;
  category_id?: string;
  seller_id?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const getProductListings = async (filters?: {
  category?: string;
  location?: string;
  price_min?: number;
  price_max?: number;
  condition?: string;
  sort_by?: string;
  verified?: boolean;
}) => {
  let query = supabase.from('product_listings').select('*');

  if (filters?.category) {
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.category)
      .single();
    
    if (categories?.id) {
      query = query.eq('category_id', categories.id);
    }
  }

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
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

  if (filters?.verified !== undefined) {
    query = query.eq('verified', filters.verified);
  }

  if (filters?.sort_by) {
    switch (filters.sort_by) {
      case 'price_low_to_high':
        query = query.order('price', { ascending: true });
        break;
      case 'price_high_to_low':
        query = query.order('price', { ascending: false });
        break;
      case 'newest_first':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as ProductListing[];
};

export const createProductListing = async (listing: Omit<ProductListing, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('product_listings')
    .insert(listing)
    .select()
    .single();

  if (error) throw error;
  return data as ProductListing;
};

export const getProductListingById = async (id: string) => {
  const { data, error } = await supabase
    .from('product_listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as ProductListing;
};

export const updateProductListing = async (id: string, updates: Partial<ProductListing>) => {
  const { data, error } = await supabase
    .from('product_listings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ProductListing;
};

export const deleteProductListing = async (id: string) => {
  const { error } = await supabase
    .from('product_listings')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
