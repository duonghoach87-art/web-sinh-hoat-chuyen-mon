import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getMonthlyPedagogicalTheme } from '../utils/monthlyQuotes';

const SettingsContext = createContext(null);

const defaultTheme = getMonthlyPedagogicalTheme();

const DEFAULT_SETTINGS = {
  department_authority: 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO',
  school_name: 'TRƯỜNG PTDTBT TH&THCS SÌ LỞ LẦU',
  department_name: 'TỔ KHOA HỌC TỰ NHIÊN',
  school_year: '2026-2027',
  active_term: 'Học kỳ 1',
  principal_name: 'Ban Giám Hiệu',
  head_teacher_name: 'Dương Văn Hoạch (Tổ trưởng KHTN)',
  deputy_head_name: 'Nguyễn Thị Hảo (Tổ phó KHTN)',
  address: 'Bản Gia Khâu - xã Sì Lở Lầu - tỉnh Lai Châu',
  phone_number: '0345081076',
  logo_url: null,
  head_signature_url: null,
  principal_signature_url: null,
  motto: defaultTheme.motto || 'Đoàn kết - Sáng tạo - Đổi mới phương pháp dạy học',
  monthly_theme_badge: defaultTheme.badge || 'Tháng 8 • Tập Huấn Chuyên Môn Đầu Năm',
  monthly_focus: defaultTheme.highlight || 'Hoàn thiện phân công chuyên môn và kế hoạch hoạt động của Tổ Khoa học Tự nhiên.'
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('khtn_school_settings');
      if (cached) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
      }
    } catch (e) {
      console.warn('Lỗi đọc settings từ localStorage:', e);
    }
    return DEFAULT_SETTINGS;
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('school_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('Chưa tải được cấu hình trường từ DB:', error.message);
      } else if (data) {
        setSettings((prev) => {
          const merged = { ...prev, ...data };
          try {
            localStorage.setItem('khtn_school_settings', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    } catch (err) {
      console.error('Lỗi nạp cài đặt trường:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings) => {
    try {
      const merged = {
        ...settings,
        ...newSettings,
        updated_at: new Date().toISOString()
      };

      // Lưu ngay vào localStorage
      try {
        localStorage.setItem('khtn_school_settings', JSON.stringify(merged));
      } catch (e) {}
      setSettings(merged);

      if (settings?.id) {
        let { data, error } = await supabase
          .from('school_settings')
          .update(merged)
          .eq('id', settings.id)
          .select()
          .single();

        if (error && error.message?.includes('column')) {
          console.warn('DB chưa có đủ cột mở rộng, đang lưu các trường cơ bản...');
          const fallbackPayload = {
            department_authority: merged.department_authority,
            school_name: merged.school_name,
            department_name: merged.department_name,
            school_year: merged.school_year,
            active_term: merged.active_term,
            principal_name: merged.principal_name,
            head_teacher_name: merged.head_teacher_name,
            address: merged.address,
            phone_number: merged.phone_number,
            motto: merged.motto,
            logo_url: merged.logo_url,
            updated_at: new Date().toISOString()
          };

          const fallbackRes = await supabase
            .from('school_settings')
            .update(fallbackPayload)
            .eq('id', settings.id)
            .select()
            .single();

          if (fallbackRes.error) throw fallbackRes.error;
          data = {
            ...fallbackRes.data,
            ...merged
          };
        } else if (error) {
          throw error;
        }

        if (data) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
        return data || merged;
      } else {
        let { data, error } = await supabase
          .from('school_settings')
          .insert([merged])
          .select()
          .single();

        if (error && error.message?.includes('column')) {
          const fallbackPayload = {
            department_authority: merged.department_authority,
            school_name: merged.school_name,
            department_name: merged.department_name,
            school_year: merged.school_year,
            active_term: merged.active_term,
            principal_name: merged.principal_name,
            head_teacher_name: merged.head_teacher_name,
            address: merged.address,
            phone_number: merged.phone_number,
            motto: merged.motto,
            logo_url: merged.logo_url
          };

          const fallbackRes = await supabase
            .from('school_settings')
            .insert([fallbackPayload])
            .select()
            .single();

          if (fallbackRes.error) throw fallbackRes.error;
          data = {
            ...fallbackRes.data,
            ...merged
          };
        } else if (error) {
          throw error;
        }

        if (data) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
        return data || merged;
      }
    } catch (err) {
      console.error('Lỗi cập nhật cấu hình trường:', err);
      throw err;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, refreshSettings: fetchSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings phải được sử dụng bên trong SettingsProvider');
  }
  return context;
}
