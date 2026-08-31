import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENT_SUBJECTS, KHTN_SUB_SPECIALTIES } from '../../lib/constants';
import { School, UserPlus, AlertCircle, CheckCircle2, Mail, Lock, User, BookOpen, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const [mainSubject, setMainSubject] = useState('Khoa học Tự nhiên');
  const [khtnSubSpecialty, setKhtnSubSpecialty] = useState('Khoa học Tự nhiên');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialty: 'Khoa học Tự nhiên',
    duties: 'Giáo viên giảng dạy',
    role: 'teacher'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    // Xác định chuyên môn cuối cùng
    const finalSpecialty = mainSubject === 'Khoa học Tự nhiên' ? khtnSubSpecialty : mainSubject;

    try {
      setLoading(true);
      await register(
        formData.email.trim(),
        formData.password,
        formData.fullName.trim(),
        finalSpecialty,
        formData.duties,
        formData.role
      );
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Đăng ký thất bại:', err);
      setError(err.message || 'Đăng ký tài khoản thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-brand-700 to-brand-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-brand-500/25">
            <School className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Đăng Ký Tài Khoản Thành Viên
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Tạo hồ sơ giáo viên Tổ Khoa Học Tự Nhiên (KHTN: Lý - Hóa - Sinh, Toán, Tin, Công Nghệ)
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-7 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2.5 text-xs text-emerald-700 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Đăng ký tài khoản thành công!</p>
                <p className="text-[11px] mt-0.5">Hệ thống đang tự động đăng nhập và chuyển hướng...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Họ và Tên Giáo Viên <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="VD: Cô Nguyễn Thị Hảo"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Địa Chỉ Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="giaovien@school.edu.vn"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Khối chọn Môn Học Chính & Phân Môn KHTN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Môn Giảng Dạy
                </label>
                <select
                  value={mainSubject}
                  onChange={(e) => setMainSubject(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                >
                  {DEPARTMENT_SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nếu là môn Khoa Học Tự Nhiên -> Hiện Dropdown Phân môn: Vật Lý, Hóa Học, Sinh Học */}
              {mainSubject === 'Khoa học Tự nhiên' ? (
                <div className="animate-in fade-in">
                  <label className="block text-xs font-bold text-brand-700 mb-1 uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Phân Môn KHTN</span>
                  </label>
                  <select
                    value={khtnSubSpecialty}
                    onChange={(e) => setKhtnSubSpecialty(e.target.value)}
                    className="w-full px-3 py-2.5 bg-brand-50/50 border border-brand-300 rounded-xl text-xs font-bold text-brand-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  >
                    {KHTN_SUB_SPECIALTIES.map((sub) => (
                      <option key={sub.value} value={sub.value}>
                        {sub.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Nhiệm Vụ / Chức Vụ
                  </label>
                  <input
                    type="text"
                    name="duties"
                    value={formData.duties}
                    onChange={handleChange}
                    placeholder="VD: Giáo viên bộ môn"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              )}
            </div>

            {mainSubject === 'Khoa học Tự nhiên' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Nhiệm Vụ / Chức Vụ
                </label>
                <input
                  type="text"
                  name="duties"
                  value={formData.duties}
                  onChange={handleChange}
                  placeholder="VD: Tổ phó / Thư ký / Giáo viên giảng dạy"
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Mật Khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Xác Nhận Mật Khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Đang tạo tài khoản...' : 'Hoàn Tất Đăng Ký Tài Khoản'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Đã có tài khoản thành viên?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
