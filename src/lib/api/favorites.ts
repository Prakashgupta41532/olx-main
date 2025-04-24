import { supabase } from '../supabase';
import { ProductListing } from './productListings';

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface FavoriteWithProduct extends Favorite {
  product: ProductListing;
}

// Add a product to favorites
export const addToFavorites = async (productId: string) => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User must be logged in to add favorites');
  }

  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: user.user.id,
      product_id: productId
    })
    .select()
    .single();

  if (error) {
    // If the error is a duplicate, we can ignore it
    if (error.code === '23505') {
      return { success: true, message: 'Already in favorites' };
    }
    throw error;
  }

  return { success: true, data };
};

// Remove a product from favorites
export const removeFromFavorites = async (productId: string) => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User must be logged in to remove favorites');
  }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .match({ 
      user_id: user.user.id, 
      product_id: productId 
    });

  if (error) throw error;
  return { success: true };
};

// Check if a product is in favorites
export const isProductFavorited = async (productId: string) => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    return false;
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .match({ 
      user_id: user.user.id, 
      product_id: productId 
    })
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    throw error;
  }

  return !!data;
};

// Get all favorites for the current user
export const getUserFavorites = async () => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User must be logged in to get favorites');
  }

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      user_id,
      product_id,
      created_at,
      product:product_id (*)
    `)
    .eq('user_id', user.user.id);

  if (error) throw error;
  
  // Transform the data to match the FavoriteWithProduct interface
  return data.map(item => ({
    id: item.id,
    user_id: item.user_id,
    product_id: item.product_id,
    created_at: item.created_at,
    product: item.product as unknown as ProductListing
  })) as FavoriteWithProduct[];
};
