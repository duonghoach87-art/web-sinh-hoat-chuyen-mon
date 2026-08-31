import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, normalizeTeacherName } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { School, LogIn, AlertCircle, KeyRound, User, ChevronDown, Sparkles, ShieldCheck, Key, Check } from 'lucide-react';

export default function LoginPage() {
  const [fullNameInput, setFullNameInput] = useState('');
  const [password, setPassword] = useState('');
  const [teachersList, setTeachersList] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loginByNameOrEmail, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Nạp danh sách tất cả giáo viên chính thức trong tổ (is_active = true)
  useEffect(() => {
    async function loadTeachers() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, specialty, role, is_active')
          .eq('is_active', true)
          .order('role', { ascending: true })
          .order('full_name', { ascending: true });

        if (data && data.length > 0) {
          const cleaned = data.map((t) => ({
            ...t,
            full_name: normalizeTeacherName(t.full_name)
          }));
          setTeachersList(cleaned);
        }
      } catch (err) {
        console.warn('Lỗi nạp danh sách giáo viên:', err);
      }
    }
    loadTeachers();
  }, []);

  // Tự động chuyển hướng ngay vào Trang Chủ khi đã đăng nhập
  useEffect(() => {
    if (user && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullNameInput.trim() || !password) {
      setError('Vui lòng nhập Họ và Tên giáo viên và Mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      await loginByNameOrEmail(fullNameInput.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Đăng nhập thất bại:', err);
      setError(err.message || 'Đăng nhập không thành công. Quý thầy cô vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeacher = (teacher) => {
    setFullNameInput(teacher.full_name);
    setIsDropdownOpen(false);
  };

  const isConfigured = isSupabaseConfigured();

  // Lọc danh sách theo từ khóa gõ
  const filteredDropdownList = teachersList.filter((t) => {
    if (!fullNameInput) return true;
    return t.full_name.toLowerCase().includes(fullNameInput.toLowerCase().trim());
  });

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-brand-700 to-brand-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-brand-500/25">
            <School className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Đăng Nhập Cổng KHTN
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Hệ thống Quản lý Sinh hoạt Chuyên môn & Hồ sơ Điện tử
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs text-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Chưa kết nối Supabase</p>
              <p>
                Quý thầy cô vui lòng cấu hình tệp{' '}
                <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> theo hướng dẫn trong tài liệu để kích hoạt cơ sở dữ liệu thực.
              </p>
            </div>
          </div>
        )}

        {/* Login Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-7 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ô Nhập Họ và Tên Giáo Viên (Có Danh Sách Chọn Nhanh) */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Họ và Tên Giáo Viên <span className="text-rose-500">*</span>
                </label>
                {teachersList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="text-[11px] text-brand-600 hover:text-brand-700 font-bold flex items-center space-x-0.5"
                  >
                    <span>Danh sách giáo viên ({teachersList.length})</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullNameInput}
                  onChange={(e) => {
                    setFullNameInput(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    if (teachersList.length > 0) {
                      setIsDropdownOpen(true);
                    }
                  }}
                  placeholder="Chọn từ danh sách hoặc gõ Họ và Tên..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-semibold text-slate-800"
                  required
                />
              </div>

              {/* Menu Thả Chọn Nhanh Giáo Viên Trong Danh Sách Chính Thức */}
              {isDropdownOpen && teachersList.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in">
                  <div className="p-2 text-[10px] uppercase font-bold text-slate-400 bg-slate-50 rounded-t-2xl flex items-center justify-between">
                    <span>Thành Viên Tổ KHTN ({teachersList.length} thầy cô)</span>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                  {filteredDropdownList.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Không tìm thấy giáo viên trong danh sách tổ
                    </div>
                  ) : (
                    filteredDropdownList.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTeacher(t)}
                        className={`w-full px-3.5 py-2.5 text-left text-xs hover:bg-brand-50 flex items-center justify-between transition-colors ${
                          fullNameInput === t.full_name ? 'bg-brand-50/80 font-bold text-brand-700' : ''
                        }`}
                      >
                        <div>
                          <span className="font-bold text-slate-800">{t.full_name}</span>
                          <span className="text-[11px] text-slate-400 block">
                            {t.specialty || 'Khoa học Tự nhiên'}
                          </span>
                        </div>
                        {t.role === 'admin' ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                            Quản trị viên
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-bold rounded-md">
                            Giáo viên
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Ô Nhập Mật Khẩu */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mật Khẩu <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 italic">
                  Mật khẩu do Tổ trưởng cấp
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Đang kiểm tra danh sách tổ...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập Vào Hệ Thống</span>
                </>
              )}
            </button>
          </form>

          {/* Ghi chú hướng dẫn phân quyền */}
          <div className="p-3.5 bg-brand-50/70 border border-brand-200 rounded-2xl text-xs text-brand-900 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Quy định bảo mật Tổ KHTN</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600 leading-relaxed">
              <li>
                <strong>Phạm vi truy cập:</strong> Hệ thống chỉ cho phép các thầy cô có tên trong danh sách 11 thành viên chính thức của Tổ KHTN đăng nhập.
              </li>
              <li>
                <strong>Mật khẩu ban đầu:</strong> <code>GiaoVien@123</code> (hoặc mật khẩu riêng do Quản trị viên cấp).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
