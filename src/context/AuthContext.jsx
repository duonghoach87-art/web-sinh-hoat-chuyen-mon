import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, createIsolatedClient } from '../lib/supabase';
import { ROLES } from '../lib/constants';

const AuthContext = createContext(null);

// Hàm chuẩn hóa loại bỏ tiền tố Thầy/Cô và khoảng trắng thừa
export function normalizeTeacherName(str) {
  return (str || '')
    .replace(/^(Thầy|Cô|GV|Đ\/c|Đc|Thay|Co)\s+/gi, '')
    .trim();
}

// Chuyển đổi Họ và Tên giáo viên sang Email hệ thống chuẩn
export function nameToSystemEmail(fullName) {
  const clean = normalizeTeacherName(fullName)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '');

  if (
    clean === 'duongvanhoach' ||
    clean === 'duonghoach' ||
    clean.includes('duonghoach') ||
    clean.includes('hoach')
  ) {
    return 'duonghoach87@gmail.com';
  }
  return `${clean || 'giaovien'}@khtn.edu.vn`;
}

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
      // 1. Thử tìm profile theo ID người dùng
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // 2. Nếu chưa tìm thấy theo ID, thử tìm theo Email
      if (!data && userEmail) {
        const { data: byEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle();

        if (byEmail) {
          data = byEmail;
        }
      }

      // 3. Nếu là Thầy Hoạch -> ĐẢM BẢO 100% QUYỀN ADMIN & TỔ TRƯỞNG CHUYÊN MÔN
      if (data) {
        const isHoach =
          data.email === 'duonghoach87@gmail.com' ||
          data.email?.includes('duonghoach') ||
          normalizeTeacherName(data.full_name) === 'Dương Văn Hoạch' ||
          data.full_name?.includes('Hoạch');

        if (isHoach) {
          data.role = ROLES.ADMIN;
          data.full_name = 'Dương Văn Hoạch';
          data.duties = 'Tổ trưởng chuyên môn - Quản trị viên';

          // Tự động cập nhật sửa lại quyền Admin trong Database nếu chưa đúng
          if (data.role !== ROLES.ADMIN) {
            supabase
              .from('profiles')
              .update({
                role: ROLES.ADMIN,
                full_name: 'Dương Văn Hoạch',
                duties: 'Tổ trưởng chuyên môn - Quản trị viên',
                is_active: true
              })
              .eq('id', data.id)
              .then();
          }
        } else if (data.full_name) {
          data.full_name = normalizeTeacherName(data.full_name);
        }
      }

      setProfile(data || null);
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

        const {
          data: { session }
        } = await supabase.auth.getSession();
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

  // CHỈ CHO PHÉP GIÁO VIÊN CÓ TÊN TRONG DANH SÁCH PROFILES ĐƯỢC ĐĂNG NHẬP
  const loginByNameOrEmail = async (nameOrEmail, password) => {
    const inputRaw = (nameOrEmail || '').trim();
    const inputClean = normalizeTeacherName(inputRaw);
    const pass = (password || '').trim();

    if (!inputClean || !pass) {
      throw new Error('Vui lòng nhập đầy đủ Họ và Tên và Mật khẩu.');
    }

    // 1. Tải danh sách tất cả giáo viên trong bảng profiles của tổ
    let { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('*');

    if (profileErr || !profiles || profiles.length === 0) {
      // Thử lại nếu có trục trặc mạng
      const retry = await supabase.from('profiles').select('*');
      profiles = retry.data || [];
    }

    const inputLower = inputClean.toLowerCase();
    const inputNorm = inputClean
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .toLowerCase();

    // 2. TÌM KIẾM GIÁO VIÊN TRONG DANH SÁCH CHÍNH THỨC
    const matchedProfile = (profiles || []).find((p) => {
      const pNameClean = normalizeTeacherName(p.full_name);
      const pNameLower = pNameClean.toLowerCase();
      const pEmailLower = (p.email || '').toLowerCase().trim();

      const pNameNorm = pNameClean
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .toLowerCase();

      return (
        pNameLower === inputLower ||
        pNameNorm === inputNorm ||
        pEmailLower === inputRaw.toLowerCase() ||
        pEmailLower === inputLower
      );
    });

    // ❌ NẾU KHÔNG CÓ TRONG DANH SÁCH -> TỪ CHỐI ĐĂNG NHẬP NGAY
    if (!matchedProfile) {
      throw new Error(
        `Giáo viên "${inputRaw}" không có trong danh sách thành viên Tổ KHTN của trường. Chỉ các thầy cô có trong danh sách tổ mới được phép đăng nhập. Quý thầy cô vui lòng kiểm tra lại Họ và Tên hoặc liên hệ Quản trị viên (Thầy Hoạch) để được thêm vào danh sách.`
      );
    }

    // ❌ NẾU ĐÃ LUÂN CHUYỂN / VÔ HIỆU HÓA -> TỪ CHỐI
    if (matchedProfile.is_active === false) {
      throw new Error(
        `Tài khoản của giáo viên "${matchedProfile.full_name}" hiện đang ở trạng thái ngừng hoạt động hoặc đã chuyển công tác. Quý thầy cô vui lòng liên hệ Tổ trưởng để được hỗ trợ.`
      );
    }

    const targetEmail = (matchedProfile.email || nameToSystemEmail(matchedProfile.full_name)).toLowerCase();
    const resolvedFullName = normalizeTeacherName(matchedProfile.full_name);

    // 3. TIẾN HÀNH ĐĂNG NHẬP QUA SUPABASE AUTH
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: pass
      });

      if (!error && data?.user) {
        return data;
      }

      // Xử lý riêng cho Quản trị viên Thầy Hoạch (hỗ trợ cả Admin@123456 và GiaoVien@123)
      if (
        (targetEmail === 'duonghoach87@gmail.com' || resolvedFullName === 'Dương Văn Hoạch') &&
        pass === 'GiaoVien@123'
      ) {
        const { data: adminData, error: adminErr } =
          await supabase.auth.signInWithPassword({
            email: targetEmail,
            password: 'Admin@123456'
          });
        if (!adminErr && adminData?.user) {
          return adminData;
        }
      }

      // 4. Nếu giáo viên ĐÃ CÓ TÊN TRONG DANH SÁCH nhưng tài khoản Auth chưa kích hoạt và dùng mật khẩu chuẩn GiaoVien@123
      if (pass === 'GiaoVien@123' || pass === 'Admin@123456') {
        try {
          const isolatedClient = createIsolatedClient();
          const { data: signData } = await isolatedClient.auth.signUp({
            email: targetEmail,
            password: pass,
            options: {
              data: {
                full_name: resolvedFullName,
                role: matchedProfile.role || ROLES.TEACHER
              }
            }
          });

          if (signData?.user) {
            // Đăng nhập lại ngay sau khi tài khoản được kích hoạt
            const { data: loginData, error: loginErr } =
              await supabase.auth.signInWithPassword({
                email: targetEmail,
                password: pass
              });
            if (!loginErr && loginData?.user) {
              return loginData;
            }
          }
        } catch (initErr) {
          console.warn('Kích hoạt tài khoản thành viên:', initErr);
        }
      }

      throw error || new Error('Mật khẩu không chính xác');
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      if (err.message?.includes('Invalid login credentials')) {
        throw new Error(
          `Mật khẩu đăng nhập của giáo viên "${resolvedFullName}" không chính xác. Mật khẩu mặc định là GiaoVien@123.`
        );
      }
      throw err;
    }
  };

  // Đăng nhập tương thích
  const login = async (email, password) => {
    return loginByNameOrEmail(email, password);
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

  // Quyền hạn hệ thống: Thầy Hoạch luôn là Quản trị viên (Admin)
  const isHoachAdmin =
    user?.email === 'duonghoach87@gmail.com' ||
    user?.email?.includes('duonghoach') ||
    normalizeTeacherName(profile?.full_name) === 'Dương Văn Hoạch' ||
    profile?.email === 'duonghoach87@gmail.com';

  const role = isHoachAdmin ? ROLES.ADMIN : profile?.role || ROLES.TEACHER;
  const isAdmin = role === ROLES.ADMIN || isHoachAdmin;
  const isHeadTeacher = role === ROLES.HEAD_TEACHER;
  const isTeacher = role === ROLES.TEACHER && !isHoachAdmin;
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
    loginByNameOrEmail,
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
