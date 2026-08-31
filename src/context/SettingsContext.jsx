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
  address: 'Số 123 Đường Giáo Dục, Quận/Huyện...',
  phone_number: '024.3838.xxxx',
  logo_url: null,
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
        setSettings(data);
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
      if (settings?.id) {
        const { data, error } = await supabase
          .from('school_settings')
          .update({
            ...newSettings,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id)
          .select()
          .single();

        if (error) throw error;
        setSettings(data);
        return data;
      } else {
        const { data, error } = await supabase
          .from('school_settings')
          .insert([newSettings])
          .select()
          .single();

        if (error) throw error;
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
