import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ROLES } from '../lib/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tải thông tin Profile từ bảng profiles trong Supabase
  const fetchProfile = async (userId, userEmail) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Chưa tìm thấy profile trong bảng profiles:', error.message);
        // Tạo profile tạm thời nếu trigger chưa kịp ghi
        const fallbackProfile = {
          id: userId,
          email: userEmail,
          full_name: userEmail?.split('@')[0] || 'Giáo viên KHTN',
          role: ROLES.TEACHER,
          specialty: 'Khoa học Tự nhiên',
          duties: 'Giáo viên giảng dạy',
          is_active: true
        };
        setProfile(fallbackProfile);
        return fallbackProfile;
      }

      setProfile(data);
      return data;
    } catch (err) {
      console.error('Lỗi khi tải profile:', err);
      return null;
    }
  };

  // Khởi tạo và lắng nghe trạng thái đăng nhập
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (!isSupabaseConfigured()) {
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id, session.user.email);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Lỗi kiểm tra session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Lắng nghe thay đổi đăng nhập/đăng xuất
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Đăng nhập
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  // Đăng ký tài khoản mới
  const register = async (email, password, fullName, specialty = 'Khoa học Tự nhiên', duties = 'Giáo viên giảng dạy', role = 'teacher') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          specialty,
          duties,
          role
        }
      }
    });
    if (error) throw error;
    return data;
  };

  // Đăng xuất
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  // Cập nhật thông tin profile
  const updateProfileData = async (updates) => {
    if (!user) throw new Error('Chưa đăng nhập');
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  // Kiểm tra quyền hạn
  const role = profile?.role || ROLES.TEACHER;
  const isAdmin = role === ROLES.ADMIN;
  const isHeadTeacher = role === ROLES.HEAD_TEACHER;
  const isTeacher = role === ROLES.TEACHER;
  const canManage = isAdmin || isHeadTeacher;

  const value = {
    user,
    profile,
    role,
    loading,
    isAdmin,
    isHeadTeacher,
    isTeacher,
    canManage,
    login,
    register,
    logout,
    updateProfileData,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}
