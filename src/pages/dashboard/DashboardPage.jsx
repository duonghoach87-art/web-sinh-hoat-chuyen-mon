import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { formatDate } from '../../utils/formatDate';
import { getMonthlyPedagogicalTheme } from '../../utils/monthlyQuotes';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EventCountdownCard from '../../components/dashboard/EventCountdownCard';
import {
  Users,
  FileText,
  Calendar,
  Award,
  BookOpen,
  Atom,
  ArrowRight,
  School,
  Sparkles,
  GraduationCap,
  FolderArchive,
  Clock,
  ChevronRight,
  Edit3,
  CheckCircle2,
  Save,
  Flame,
  Layers
} from 'lucide-react';

export default function DashboardPage() {
  const { profile, role, canManage } = useAuth();
  const isAdmin = role === 'admin';
  const { settings, updateSettings } = useSettings();
  const defaultMonthlyTheme = getMonthlyPedagogicalTheme(settings?.motto);

  const [stats, setStats] = useState({
    teachersCount: 0,
    documentsCount: 0,
    registrationsCount: 0,
    labsCount: 0
  });

  const [upcomingTeachings, setUpcomingTeachings] = useState([]);
  const [recentMinutes, setRecentMinutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Modal Chỉnh Sửa Banner & Trọng Tâm Tháng (Chỉ dành cho Admin)
  const [isEditBannerOpen, setIsEditBannerOpen] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    monthly_theme_badge: '',
    motto: '',
    monthly_focus: ''
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        const [
          teachersRes,
          documentsRes,
          registrationsRes,
          labsRes,
          teachingsRes,
          minutesRes
        ] = await Promise.all([
          supabase.from('profiles').select('id, is_active'),
          supabase.from('official_documents').select('id'),
          supabase.from('teaching_registrations').select('id'),
          supabase.from('virtual_labs').select('id'),
          supabase
            .from('teaching_registrations')
            .select('*, profiles:teacher_id(full_name, specialty)')
            .order('teaching_date', { ascending: true })
            .limit(4),
          supabase
            .from('meeting_minutes')
            .select('*')
            .order('meeting_date', { ascending: false })
            .limit(3)
        ]);

        const teachersCount = teachersRes.data ? teachersRes.data.length : (teachersRes.count || 0);
        const documentsCount = documentsRes.data ? documentsRes.data.length : (documentsRes.count || 0);
        const registrationsCount = registrationsRes.data ? registrationsRes.data.length : (registrationsRes.count || 0);
        const labsCount = labsRes.data ? labsRes.data.length : (labsRes.count || 0);

        setStats({
          teachersCount,
          documentsCount,
          registrationsCount,
          labsCount
        });

        setUpcomingTeachings(teachingsRes.data || []);
        setRecentMinutes(minutesRes.data || []);
      } catch (error) {
        console.error('Lỗi tải dữ liệu Dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Xử lý mở modal chỉnh sửa Banner
  const handleOpenEditBanner = () => {
    setBannerForm({
      monthly_theme_badge: settings?.monthly_theme_badge || defaultMonthlyTheme.badge,
      motto: settings?.motto || defaultMonthlyTheme.motto,
      monthly_focus: settings?.monthly_focus || defaultMonthlyTheme.highlight
    });
    setIsEditBannerOpen(true);
  };

  // Lưu chỉnh sửa Banner & Trọng tâm tháng
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      setSavingBanner(true);
      await updateSettings({
        monthly_theme_badge: bannerForm.monthly_theme_badge.trim(),
        motto: bannerForm.motto.trim(),
        monthly_focus: bannerForm.monthly_focus.trim()
      });
      setIsEditBannerOpen(false);
    } catch (err) {
      alert(`Không thể lưu chỉnh sửa: ${err.message}`);
    } finally {
      setSavingBanner(false);
    }
  };

  // Nạp nhanh nội dung mẫu của tháng hiện tại
  const handleApplyDefaultMonthlyTheme = () => {
    const theme = getMonthlyPedagogicalTheme();
    setBannerForm({
      monthly_theme_badge: theme.badge,
      motto: theme.motto,
      monthly_focus: theme.highlight
    });
  };

  // Định dạng lời chào đẹp mắt, tránh lặp chữ "Thầy/Cô Thầy..."
  const formatGreetingName = (fullName) => {
    if (!fullName) return 'Quý Thầy Cô';
    const trimmed = fullName.trim();
    if (trimmed.startsWith('Thầy ') || trimmed.startsWith('Cô ')) {
      return trimmed;
    }
    return `Thầy/Cô ${trimmed}`;
  };

  // Lấy các giá trị hiển thị thực tế
  const currentBadge = settings?.monthly_theme_badge || defaultMonthlyTheme.badge;
  const currentMotto = settings?.motto || defaultMonthlyTheme.motto;
  const currentFocus = settings?.monthly_focus || defaultMonthlyTheme.highlight;

  return (
    <div className="space-y-8">
      {/* Banner Chào Mừng & Chủ Đề Sư Phạm Tháng Hiện Tại */}
      <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-brand-900 to-brand-800 text-white p-6 sm:p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-brand-950/20">
        
        {/* Nút Chỉnh Sửa Dành Riêng Cho Quản Trị Viên (Admin - Thầy Hoạch) */}
        {isAdmin && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={handleOpenEditBanner}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white rounded-xl text-xs font-bold border border-white/20 shadow-md transition-all transform hover:scale-105"
              title="Chỉnh sửa chủ đề, khẩu hiệu và trọng tâm tháng"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span>Chỉnh sửa Banner & Trọng tâm tháng</span>
            </button>
          </div>
        )}

        <div className="relative z-10 max-w-3xl space-y-3">
          {/* Badge Tên Trường & Tháng Năm Học */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-brand-200 border border-white/15 shadow-xs transition-transform group-hover:scale-105">
              <School className="w-3.5 h-3.5 text-brand-300" />
              <span>{settings?.school_name || 'Trường THCS'} • Năm Học {settings?.school_year || '2026-2027'}</span>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full text-[11px] font-bold text-emerald-200 border border-emerald-400/25">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              <span>{currentBadge}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Chào mừng {formatGreetingName(profile?.full_name)} đến với Cổng Tổ KHTN
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
            &ldquo;{currentMotto}&rdquo;
          </p>

          {/* Hộp Trọng Tâm Tháng Nổi Bật (Có Thể Chỉnh Sửa) */}
          <div className="p-3.5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 text-xs text-brand-100 max-w-2xl flex items-center space-x-2.5 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="font-medium leading-relaxed">
              <strong className="text-amber-300 uppercase tracking-wide mr-1">Trọng tâm tháng:</strong> 
              {currentFocus}
            </span>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <Link
              to="/teaching-registrations"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/30 transition-all transform hover:-translate-y-0.5"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Đăng ký Thao giảng</span>
            </Link>
            <Link
              to="/exam-bank"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-xs transition-all transform hover:-translate-y-0.5 border border-white/10"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Kho Đề & Ma trận</span>
            </Link>
            <Link
              to="/virtual-labs"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-xs transition-all transform hover:-translate-y-0.5 border border-white/10"
            >
              <Atom className="w-4 h-4" />
              <span>Thí nghiệm ảo PhET</span>
            </Link>
            <Link
              to="/emulation"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-xs transition-all transform hover:-translate-y-0.5 border border-white/10"
            >
              <Award className="w-4 h-4" />
              <span>Thi đua & Xếp loại</span>
            </Link>
          </div>
        </div>

        {/* Decorative Background Icon */}
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
          <Atom className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Grid 4 Thẻ Thống Kê Tổng Quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Thành Viên Trong Tổ"
          value={stats.teachersCount}
          icon={Users}
          description="Giáo viên bộ môn & thực hành KHTN"
          badgeText="Chuyên môn"
          badgeVariant="primary"
        />

        <StatCard
          title="Văn Bản Chỉ Đạo"
          value={stats.documentsCount}
          icon={FileText}
          description="Chỉ thị, Nghị quyết, Công văn"
          badgeText="Hành chính"
          badgeVariant="info"
        />

        <StatCard
          title="Tiết Dạy Đã Đăng Ký"
          value={stats.registrationsCount}
          icon={Calendar}
          description="Thao giảng, hội giảng & chuyên đề"
          badgeText="Kế hoạch"
          badgeVariant="warning"
        />

        <StatCard
          title="Mô Phỏng Thí Nghiệm"
          value={stats.labsCount}
          icon={Atom}
          description="Bài thực hành ảo PhET KHTN"
          badgeText="Kho học liệu"
          badgeVariant="success"
        />
      </div>

      {/* Grid Nội Dung: Lịch Thao Giảng & Đếm Ngược Sự Kiện */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1 & 2: Danh Sách Thao Giảng Sắp Tới */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-brand-50 rounded-xl text-brand-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">Lịch Thao Giảng & Dự Giờ Sắp Tới</h3>
                  <p className="text-xs text-slate-500">Các tiết thao giảng theo kế hoạch chuyên môn</p>
                </div>
              </div>

              <Link
                to="/teaching-registrations"
                className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <LoadingSpinner text="Đang tải lịch thao giảng..." />
            ) : upcomingTeachings.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                Chưa có tiết thao giảng nào trong thời gian tới.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingTeachings.map((teach) => (
                  <div
                    key={teach.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-xl transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-800">{teach.topic_title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full border border-brand-200">
                          {teach.subject}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        GV: <strong>{teach.profiles?.full_name || 'Giáo viên'}</strong> • Lớp {teach.classroom} (Khối {teach.grade_level})
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-brand-700">{formatDate(teach.teaching_date)}</div>
                      <div className="text-[10px] text-slate-400">Tiết {teach.period_number}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Biên Bản Sinh Hoạt Mới Nhất */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">Biên Bản Sinh Hoạt Chuyên Môn Mới Nhất</h3>
                  <p className="text-xs text-slate-500">Ghi nhận các nội dung họp tổ và sinh hoạt chuyên đề</p>
                </div>
              </div>

              <Link
                to="/meeting-minutes"
                className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <LoadingSpinner text="Đang tải biên bản..." />
            ) : recentMinutes.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                Chưa có biên bản sinh hoạt chuyên môn nào.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentMinutes.map((min) => (
                  <div
                    key={min.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-xl transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-slate-800">{min.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{min.location || 'Phòng hội đồng'}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-600">{formatDate(min.meeting_date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cột 3: Đếm Ngược Sự Kiện & Lời Nhắc Chuyên Môn */}
        <div className="space-y-6">
          <EventCountdownCard />
        </div>
      </div>

      {/* Modal Chỉnh Sửa Banner & Trọng Tâm Tháng (Chỉ Quản Trị Viên Mới Mở Được) */}
      <Modal
        isOpen={isEditBannerOpen}
        onClose={() => setIsEditBannerOpen(false)}
        title="Chỉnh Sửa Banner & Trọng Tâm Tháng (Quyền Quản Trị Viên)"
      >
        <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
          <div className="flex items-center justify-between bg-brand-50 p-3 rounded-xl border border-brand-200">
            <span className="text-brand-900 font-bold">💡 Bạn có thể tự động lấy gợi ý mẫu theo tháng:</span>
            <button
              type="button"
              onClick={handleApplyDefaultMonthlyTheme}
              className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-[11px] transition-colors"
            >
              Nạp mẫu tháng hiện tại
            </button>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Chủ Đề / Nhãn Tháng (Badge) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={bannerForm.monthly_theme_badge}
              onChange={(e) =>
                setBannerForm({ ...bannerForm, monthly_theme_badge: e.target.value })
              }
              placeholder="VD: Tháng 8 • Tập Huấn Chuyên Môn Đầu Năm"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Khẩu Hiệu / Slogan Hành Động <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={bannerForm.motto}
              onChange={(e) =>
                setBannerForm({ ...bannerForm, motto: e.target.value })
              }
              placeholder="VD: “Đoàn kết - Sáng tạo - Đổi mới phương pháp dạy học”"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nhiệm Vụ Trọng Tâm Trong Tháng <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={bannerForm.monthly_focus}
              onChange={(e) =>
                setBannerForm({ ...bannerForm, monthly_focus: e.target.value })
              }
              placeholder="VD: Hoàn thiện phân công chuyên môn và kế hoạch hoạt động của Tổ Khoa học Tự nhiên."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditBannerOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={savingBanner}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingBanner ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
