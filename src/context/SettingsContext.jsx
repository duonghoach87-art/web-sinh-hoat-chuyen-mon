import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  department_authority: 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO',
  school_name: 'TRƯỜNG THCS CHU VĂN AN',
  department_name: 'TỔ KHOA HỌC TỰ NHIÊN',
  school_year: '2025-2026',
  active_term: 'Học kỳ 1',
  principal_name: 'Thầy Nguyễn Văn Quản (Hiệu trưởng)',
  head_teacher_name: 'Thầy Dương Văn Hoạch (Tổ trưởng KHTN)',
  deputy_head_name: 'Cô Nguyễn Thị Hảo (Tổ phó KHTN)',
  address: 'Số 123 Đường Giáo Dục, Quận/Huyện...',
  phone_number: '024.3838.xxxx',
  logo_url: null,
  head_signature_url: null,
  principal_signature_url: null,
  motto: 'Đoàn kết - Sáng tạo - Đổi mới phương pháp dạy học'
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
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
        setSettings((prev) => ({
          ...prev,
          ...data
        }));
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
      const payload = {
        ...newSettings,
        updated_at: new Date().toISOString()
      };

      if (settings?.id) {
        let { data, error } = await supabase
          .from('school_settings')
          .update(payload)
          .eq('id', settings.id)
          .select()
          .single();

        // Nếu DB chưa có cột mới, tự động loại bỏ cột mở rộng và lưu các trường cơ bản
        if (error && error.message?.includes('column')) {
          console.warn('DB chưa có đủ cột mở rộng, đang lưu các trường cơ bản...');
          const fallbackPayload = {
            department_authority: newSettings.department_authority,
            school_name: newSettings.school_name,
            department_name: newSettings.department_name,
            school_year: newSettings.school_year,
            active_term: newSettings.active_term,
            principal_name: newSettings.principal_name,
            head_teacher_name: newSettings.head_teacher_name,
            address: newSettings.address,
            phone_number: newSettings.phone_number,
            motto: newSettings.motto,
            logo_url: newSettings.logo_url,
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
            deputy_head_name: newSettings.deputy_head_name,
            head_signature_url: newSettings.head_signature_url,
            principal_signature_url: newSettings.principal_signature_url
          };
        } else if (error) {
          throw error;
        }

        setSettings(data);
        return data;
      } else {
        let { data, error } = await supabase
          .from('school_settings')
          .insert([payload])
          .select()
          .single();

        if (error && error.message?.includes('column')) {
          const fallbackPayload = {
            department_authority: newSettings.department_authority,
            school_name: newSettings.school_name,
            department_name: newSettings.department_name,
            school_year: newSettings.school_year,
            active_term: newSettings.active_term,
            principal_name: newSettings.principal_name,
            head_teacher_name: newSettings.head_teacher_name,
            address: newSettings.address,
            phone_number: newSettings.phone_number,
            motto: newSettings.motto,
            logo_url: newSettings.logo_url
          };

          const fallbackRes = await supabase
            .from('school_settings')
            .insert([fallbackPayload])
            .select()
            .single();

          if (fallbackRes.error) throw fallbackRes.error;
          data = {
            ...fallbackRes.data,
            deputy_head_name: newSettings.deputy_head_name,
            head_signature_url: newSettings.head_signature_url,
            principal_signature_url: newSettings.principal_signature_url
          };
        } else if (error) {
          throw error;
        }

        setSettings(data);
        return data;
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
