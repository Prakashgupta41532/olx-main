import { supabase } from '../supabase';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id?: string;
  content: string;
  read: boolean;
  created_at: string;
}

export const getMessages = async (userId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const sendMessage = async (message: Omit<Message, 'id' | 'created_at' | 'read'>) => {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const markMessageAsRead = async (messageId: string) => {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId);

  if (error) throw error;
};