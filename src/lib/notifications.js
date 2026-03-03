/**
 * Create a notification for a user.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ user_id: string, type: string, title: string, message?: string, link?: string }} options
 */
export async function createNotification(supabase, { user_id, type, title, message, link }) {
  if (!user_id || !type || !title) return;
  const { error } = await supabase.from('notifications').insert({
    user_id,
    type,
    title,
    message,
    link,
    is_read: false,
  });
  if (error) {
    console.error('[notifications] Failed to create notification:', error.message);
  }
}
