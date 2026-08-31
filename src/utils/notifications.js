import { supabase } from '../lib/supabase';

/**
 * Gửi thông báo đến một giáo viên cụ thể
 */
export async function createNotification({
  userId,
  title,
  message,
  linkUrl = '/',
  type = 'system'
}) {
  if (!userId) return;
  try {
    const { error } = await supabase.from('notifications').insert([
      {
        user_id: userId,
        title,
        message,
        link_url: linkUrl,
        type,
        is_read: false
      }
    ]);
    if (error) console.warn('Lỗi ghi thông báo:', error.message);
  } catch (err) {
    console.error('Lỗi gửi thông báo:', err);
  }
}

/**
 * Gửi thông báo đến tất cả giáo viên trong tổ
 */
export async function broadcastNotification({
  title,
  message,
  linkUrl = '/',
  type = 'system'
}) {
  try {
    const { data: teachers, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_active', true);

    if (error || !teachers?.length) return;

    const payload = teachers.map((t) => ({
      user_id: t.id,
      title,
      message,
      link_url: linkUrl,
      type,
      is_read: false
    }));

    const { error: insertError } = await supabase.from('notifications').insert(payload);
    if (insertError) console.warn('Lỗi gửi thông báo hàng loạt:', insertError.message);
  } catch (err) {
    console.error('Lỗi phát sóng thông báo:', err);
  }
}
