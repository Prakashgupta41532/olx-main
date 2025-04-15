import { supabase } from '../supabase';

export interface AnalyticsMetric {
  id: string;
  metric_name: string;
  metric_value: Record<string, any>;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const trackEvent = async (
  metricName: string,
  metricValue: Record<string, any>,
  metadata?: Record<string, any>
) => {
  const { error } = await supabase.rpc('track_user_action', {
    action_name: metricName,
    action_data: metricValue,
  });

  if (error) throw error;
};

export const getAnalytics = async (
  metricName?: string,
  startDate?: string,
  endDate?: string
) => {
  let query = supabase.from('analytics').select('*');

  if (metricName) {
    query = query.eq('metric_name', metricName);
  }

  if (startDate) {
    query = query.gte('timestamp', startDate);
  }

  if (endDate) {
    query = query.lte('timestamp', endDate);
  }

  const { data, error } = await query.order('timestamp', { ascending: false });

  if (error) throw error;
  return data as AnalyticsMetric[];
};