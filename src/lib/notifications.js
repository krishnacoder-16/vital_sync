import { supabase } from './supabaseClient';

/**
 * Fetch all notifications for a specific user.
 */
export async function getNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

/**
 * Mark a notification as read.
 */
export async function markNotificationAsRead(id) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select();

  return { data: data?.[0], error };
}

/**
 * Create a new notification.
 */
export async function createNotification({ userId, title, message, type }) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([
      {
        user_id: userId,
        title,
        message,
        type,
      },
    ])
    .select();

  return { data: data?.[0], error };
}
