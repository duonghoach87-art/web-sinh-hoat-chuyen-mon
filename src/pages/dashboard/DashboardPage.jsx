import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';
import {
  Users,
  FileText,
  GraduationCap,
  Atom,
  Calendar,
  ArrowRight,
  BookOpen,
  FolderArchive,
  Award,
  Sparkles,
  School,
  Clock,
  Printer
} from 'lucide-react';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { settings } = useSettings();
  const [stats, setStats] = useState({
    teachersCount: 0,
    documentsCount: 0,
    registrationsCount: 0,
    labsCount: 0
  });
  const [upcomingTeachings, setUpcomingTeachings] = useState([]);
  const [recentMinutes, setRecentMinutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        const [
          { count: teachersCount },
          { count: documentsCount },
          { count: registrationsCount },
          { count: labsCount },
          { data: teachingsData },
          { data: minutesData }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('official_documents').select('*', { count: 'exact', head: true }),
          supabase.from('teaching_registrations').select('*', { count: 'exact', head: true }),
          supabase.from('virtual_labs').select('*', { count: 'exact', head: true }),
          supabase
            .from('teaching_registrations')
            .select('*, profiles(full_name, specialty)')
            .order('teaching_date', { ascending: true })
            .limit(4),
          supabase
            .from('meeting_minutes')
            .select('*')
            .order('meeting_date', { ascending: false })
            .limit(3)
        ]);

        setStats({
          teachersCount: teachersCount || 0,
          documentsCount: documentsCount || 0,
          registrationsCount: registrationsCount || 0,
          labsCount: labsCount || 0
        });

        setUpcomingTeachings(teachingsData || []);
        setRecentMinutes(minutesData || []);
      } catch (error) {
        console.error('Lỗi tải dữ liệu Dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Banner Chào Mừng & Giới thiệu Năm Học */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-brand-900 to-brand-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-brand-200 mb-3 border border-white/10">
            <School className="w-3.5 h-3.5" />
            <span>
              {settings?.school_name || 'Trường THCS'} &bullet; Năm Học {settings?.school_year || '2025-2026'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-2">
            Chào mừng {profile?.full_name ? `Thầy/Cô ${profile.full_name}` : 'Quý Thầy Cô'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {settings?.motto || 'Hệ thống quản lý sinh hoạt chuyên môn, lưu trữ minh chứng giáo dục, ngân hàng đề kiểm tra và theo dõi thi đua Tổ Khoa học Tự nhiên cấp THCS.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/teaching-registrations"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/30 transition-all"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Đăng ký Thao giảng</span>
            </Link>
            <Link
              to="/exam-bank"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-xs transition-all"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Kho Đề & Ma trận</span>
            </Link>
            <Link
              to="/virtual-labs"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-xs transition-all"
            >
              <Atom className="w-4 h-4" />
              <span>Thí nghiệm ảo PhET</span>
            </Link>
            <Link
              to="/emulation"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-xs transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Thi đua & Xếp loại</span>
            </Link>
          </div>
        </div>

        {/* Decorative Background Icon */}
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
          <Atom className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* 4 Thẻ Thống Kê Nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Giáo Viên Trong Tổ"
          value={stats.teachersCount}
          icon={Users}
          color="blue"
          description="Thành viên đang công tác"
        />
        <StatCard
          title="Văn Bản Chỉ Đạo"
          value={stats.documentsCount}
          icon={FileText}
          color="emerald"
          description="Chỉ thị, công văn, kế hoạch"
        />
        <StatCard
          title="Lịch Thao Giảng"
          value={stats.registrationsCount}
          icon={GraduationCap}
          color="amber"
          description="Đã đăng ký năm học"
        />
        <StatCard
          title="Thí Nghiệm Ảo"
          value={stats.labsCount}
          icon={Atom}
          color="sky"
          description="Mô phỏng PhET Lý-Hóa-Sinh"
        />
      </div>

      {/* Nội Dung 2 Cột: Lịch Thao Giảng Sắp Tới & Biên Bản Họp Mới Nhất */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1 & 2: Lịch Thao Giảng & Hội Giảng */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-brand-50 rounded-xl text-brand-600">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Lịch Thao Giảng & Chuyên Đề</h3>
                <p className="text-xs text-slate-400">Danh sách tiết dạy được phân công và đăng ký</p>
              </div>
            </div>
            <Link
              to="/teaching-registrations"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner size="sm" text="Đang tải lịch thao giảng..." />
          ) : upcomingTeachings.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              Chưa có lịch đăng ký thao giảng nào trong kỳ này.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingTeachings.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800 hover:text-brand-600 transition-colors">
                        {item.topic_title}
                      </span>
                      <Badge variant={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'}>
                        {item.status === 'approved' ? 'Đã duyệt' : item.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-[11px] text-slate-500">
                      <span>GV: <strong>{item.profiles?.full_name || 'Giáo viên'}</strong></span>
                      <span>Lớp: {item.classroom}</span>
                      <span>Khối: {item.grade_level}</span>
                      <span>Tiết: {item.period_number}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 shrink-0">
                    <div className="font-bold text-brand-700">{formatDate(item.teaching_date)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cột 3: Biên Bản Họp Mới Nhất */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Biên Bản Sinh Hoạt</h3>
                <p className="text-xs text-slate-400">Các cuộc họp định kỳ & chuyên đề</p>
              </div>
            </div>
            <Link
              to="/meeting-minutes"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner size="sm" text="Đang tải biên bản..." />
          ) : recentMinutes.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              Chưa có biên bản sinh hoạt nào.
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {recentMinutes.map((minute) => (
                <div
                  key={minute.id}
                  className="p-3 bg-slate-50/70 hover:bg-slate-100/70 rounded-xl border border-slate-200/60 transition-colors"
                >
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{minute.title}</p>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(minute.meeting_date)}</span>
                    </span>
                    <span className="font-medium text-slate-600">{minute.chairperson || 'Tổ KHTN'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-slate-100">
            <Link
              to="/intro"
              className="w-full flex items-center justify-center space-x-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <School className="w-4 h-4 text-slate-500" />
              <span>Quy chế Tổ KHTN theo TT 32/2020</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
