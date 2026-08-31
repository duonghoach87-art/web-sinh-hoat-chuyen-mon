import { createClient } from '@supabase/supabase-js';

// Giá trị mặc định kết nối trực tiếp đến Supabase của trường (dự phòng trường hợp chưa điền biến môi trường trên Vercel)
const DEFAULT_SUPABASE_URL = 'https://oewgdrbxbpgbcnnjqthh.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ld2dkcmJ4YnBnYmNubmpxdGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMTgzMzAsImV4cCI6MjEwMzY5NDMzMH0.bxMfV0AWIEmrswSZSud5I92WI0JsAGhd7HYde704VbQ';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Khởi tạo Supabase Client chính của ứng dụng
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Khởi tạo Client cô lập không lưu phiên đăng nhập (Dùng khi Admin tạo tài khoản cho giáo viên mới mà không bị cướp phiên Admin)
export const createIsolatedClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
};

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl !== 'https://your-project-id.supabase.co' &&
      !supabaseUrl.includes('placeholder')
  );
};
