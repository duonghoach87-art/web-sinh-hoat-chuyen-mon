import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { EMULATION_RANKS } from '../../lib/constants';
import { formatDate } from '../../utils/formatDate';
import { broadcastNotification } from '../../utils/notifications';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import PrintReportModal from '../../components/common/PrintReportModal';
import EmulationChart from '../../components/emulation/EmulationChart';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import {
  Award,
  Plus,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  TrendingUp,
  User,
  Calendar,
  Printer,
  ShieldAlert,
  Calculator,
  Info,
  Layers
} from 'lucide-react';

export const TERM_1_MONTHS = ['Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12', 'Tháng 1'];
export const TERM_2_MONTHS = ['Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5'];

export function calculateEmulationRank(score) {
  const s = parseFloat(score) || 0;
  if (s >= 90) return 'Xuất sắc';
  if (s >= 80) return 'Tốt';
  if (s >= 65) return 'Khá';
  if (s >= 50) return 'Đạt';
  return 'Chưa đạt';
}

export default function EmulationPage() {
  const { user, role } = useAuth();
  const { settings } = useSettings();
  const isAdmin = role === 'admin'; // Chỉ Admin (Tổ trưởng - Thầy Hoạch) mới có quyền chấm điểm, sửa, xóa thi đua

  const [allRawEmulations, setAllRawEmulations] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriodType, setSelectedPeriodType] = useState('month'); // 'month' | 'term' | 'year'
  const [selectedPeriodValue, setSelectedPeriodValue] = useState('Tháng 9');
  const [searchTerm, setSearchTerm] = useState('');

  // Form & Print State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const [formData, setFormData] = useState({
    teacher_id: '',
    period_type: 'month',
    period_value: 'Tháng 9',
    school_year: settings?.school_year || '2026-2027',
    professional_score: 90,
    teaching_score: 90,
    activity_score: 90,
    rank: 'Tốt',
    notes: '',
    is_published: true
  });

  // Nạp danh sách giáo viên
  const fetchTeachersAndData = async () => {
    try {
      setLoading(true);
      const [teacherRes, emulRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, specialty, email')
          .order('full_name', { ascending: true }),
        supabase
          .from('emulations')
          .select('*, profiles:teacher_id(full_name, specialty, email)')
          .order('created_at', { ascending: false })
      ]);

      setTeachers(teacherRes.data || []);
      setAllRawEmulations(emulRes.data || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu thi đua:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachersAndData();
  }, []);

  // Tính toán bảng điểm thi đua hiển thị (Tháng / Học kỳ TBC / Cả năm TBC)
  const computeDisplayEmulations = () => {
    const profMap = new Map(teachers.map((t) => [t.id, t]));

    // 1. TRƯỜNG HỢP: XEM THEO THÁNG (Month)
    if (selectedPeriodType === 'month') {
      return allRawEmulations
        .filter(
          (e) => e.period_type === 'month' && e.period_value === selectedPeriodValue
        )
        .map((e) => ({
          ...e,
          profiles: e.profiles || profMap.get(e.teacher_id) || { full_name: 'Giáo viên' }
        }))
        .sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
    }

    // 2. TRƯỜNG HỢP: XEM THEO HỌC KỲ (Term 1: T9 - T1 | Term 2: T2 - T5)
    if (selectedPeriodType === 'term') {
      const isTerm1 = selectedPeriodValue === 'Học kỳ 1';
      const targetMonths = isTerm1 ? TERM_1_MONTHS : TERM_2_MONTHS;
      const maxMonths = targetMonths.length;

      const result = [];

      teachers.forEach((teacher) => {
        const teacherMonthlyRecords = allRawEmulations.filter(
          (e) =>
            e.teacher_id === teacher.id &&
            e.period_type === 'month' &&
            targetMonths.includes(e.period_value)
        );

        if (teacherMonthlyRecords.length > 0) {
          const count = teacherMonthlyRecords.length;
          const sumProf = teacherMonthlyRecords.reduce(
            (acc, curr) => acc + (parseFloat(curr.professional_score) || 0),
            0
          );
          const sumTeach = teacherMonthlyRecords.reduce(
            (acc, curr) => acc + (parseFloat(curr.teaching_score) || 0),
            0
          );
          const sumAct = teacherMonthlyRecords.reduce(
            (acc, curr) => acc + (parseFloat(curr.activity_score) || 0),
            0
          );
          const sumTotal = teacherMonthlyRecords.reduce(
            (acc, curr) => acc + (parseFloat(curr.total_score) || 0),
            0
          );

          const avgProf = parseFloat((sumProf / count).toFixed(2));
          const avgTeach = parseFloat((sumTeach / count).toFixed(2));
          const avgAct = parseFloat((sumAct / count).toFixed(2));
          const avgTotal = parseFloat((sumTotal / count).toFixed(2));
          const rank = calculateEmulationRank(avgTotal);
          const monthsListStr = teacherMonthlyRecords.map((r) => r.period_value).join(', ');

          result.push({
            id: `term_${teacher.id}_${selectedPeriodValue}`,
            teacher_id: teacher.id,
            profiles: teacher,
            period_type: 'term',
            period_value: selectedPeriodValue,
            school_year: settings?.school_year || '2026-2027',
            professional_score: avgProf,
            teaching_score: avgTeach,
            activity_score: avgAct,
            total_score: avgTotal,
            rank: rank,
            notes: `Điểm TBC từ ${count}/${maxMonths} tháng (${monthsListStr})`,
            is_aggregated: true,
            months_count: count,
            max_months: maxMonths
          });
        }
      });

      return result.sort((a, b) => b.total_score - a.total_score);
    }

    // 3. TRƯỜNG HỢP: XEM CẢ NĂM HỌC (Trung bình cộng của 2 học kỳ)
    if (selectedPeriodType === 'year') {
      const result = [];

      teachers.forEach((teacher) => {
        // Lấy các tháng HKI (T9 -> T1)
        const term1Records = allRawEmulations.filter(
          (e) =>
            e.teacher_id === teacher.id &&
            e.period_type === 'month' &&
            TERM_1_MONTHS.includes(e.period_value)
        );

        // Lấy các tháng HKII (T2 -> T5)
        const term2Records = allRawEmulations.filter(
          (e) =>
            e.teacher_id === teacher.id &&
            e.period_type === 'month' &&
            TERM_2_MONTHS.includes(e.period_value)
        );

        let term1Avg = null;
        let term2Avg = null;

        if (term1Records.length > 0) {
          term1Avg = {
            prof: term1Records.reduce((s, r) => s + (parseFloat(r.professional_score) || 0), 0) / term1Records.length,
            teach: term1Records.reduce((s, r) => s + (parseFloat(r.teaching_score) || 0), 0) / term1Records.length,
            act: term1Records.reduce((s, r) => s + (parseFloat(r.activity_score) || 0), 0) / term1Records.length,
            total: term1Records.reduce((s, r) => s + (parseFloat(r.total_score) || 0), 0) / term1Records.length,
            count: term1Records.length
          };
        }

        if (term2Records.length > 0) {
          term2Avg = {
            prof: term2Records.reduce((s, r) => s + (parseFloat(r.professional_score) || 0), 0) / term2Records.length,
            teach: term2Records.reduce((s, r) => s + (parseFloat(r.teaching_score) || 0), 0) / term2Records.length,
            act: term2Records.reduce((s, r) => s + (parseFloat(r.activity_score) || 0), 0) / term2Records.length,
            total: term2Records.reduce((s, r) => s + (parseFloat(r.total_score) || 0), 0) / term2Records.length,
            count: term2Records.length
          };
        }

        // Tính TBC cả năm
        if (term1Avg || term2Avg) {
          let yearProf, yearTeach, yearAct, yearTotal, noteStr;

          if (term1Avg && term2Avg) {
            // Có đủ cả 2 học kỳ: TBC = (HKI + HKII) / 2
            yearProf = parseFloat(((term1Avg.prof + term2Avg.prof) / 2).toFixed(2));
            yearTeach = parseFloat(((term1Avg.teach + term2Avg.teach) / 2).toFixed(2));
            yearAct = parseFloat(((term1Avg.act + term2Avg.act) / 2).toFixed(2));
            yearTotal = parseFloat(((term1Avg.total + term2Avg.total) / 2).toFixed(2));
            noteStr = `TBC Cả năm = [HKI (${term1Avg.total.toFixed(2)}đ) + HKII (${term2Avg.total.toFixed(2)}đ)] / 2`;
          } else if (term1Avg) {
            // Mới có HKI
            yearProf = parseFloat(term1Avg.prof.toFixed(2));
            yearTeach = parseFloat(term1Avg.teach.toFixed(2));
            yearAct = parseFloat(term1Avg.act.toFixed(2));
            yearTotal = parseFloat(term1Avg.total.toFixed(2));
            noteStr = `Tạm tính theo HKI (${term1Avg.total.toFixed(2)}đ - ${term1Avg.count}/5 tháng) • Chưa có điểm HKII`;
          } else {
            // Mới có HKII
            yearProf = parseFloat(term2Avg.prof.toFixed(2));
            yearTeach = parseFloat(term2Avg.teach.toFixed(2));
            yearAct = parseFloat(term2Avg.act.toFixed(2));
            yearTotal = parseFloat(term2Avg.total.toFixed(2));
            noteStr = `Tạm tính theo HKII (${term2Avg.total.toFixed(2)}đ - ${term2Avg.count}/4 tháng) • Chưa có điểm HKI`;
          }

          const rank = calculateEmulationRank(yearTotal);

          result.push({
            id: `year_${teacher.id}`,
            teacher_id: teacher.id,
            profiles: teacher,
            period_type: 'year',
            period_value: `Năm học ${settings?.school_year || '2026-2027'}`,
            school_year: settings?.school_year || '2026-2027',
            professional_score: yearProf,
            teaching_score: yearTeach,
            activity_score: yearAct,
            total_score: yearTotal,
            rank: rank,
            notes: noteStr,
            is_aggregated: true,
            has_both_terms: !!(term1Avg && term2Avg)
          });
        }
      });

      return result.sort((a, b) => b.total_score - a.total_score);
    }

    return [];
  };

  const currentDisplayEmulations = computeDisplayEmulations();

  const handleOpenAddModal = () => {
    if (!isAdmin) {
      alert('Chỉ Quản trị viên (Admin - Tổ trưởng) mới có quyền chấm điểm thi đua.');
      return;
    }
    setEditingItem(null);
    setFormData({
      teacher_id: teachers[0]?.id || '',
      period_type: 'month',
      period_value: selectedPeriodType === 'month' ? selectedPeriodValue : 'Tháng 9',
      school_year: settings?.school_year || '2026-2027',
      professional_score: 90,
      teaching_score: 90,
      activity_score: 90,
      rank: 'Tốt',
      notes: '',
      is_published: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    if (!isAdmin) {
      alert('Chỉ Quản trị viên (Admin - Tổ trưởng) mới có quyền chỉnh sửa điểm thi đua.');
      return;
    }
    if (item.is_aggregated) {
      alert('Điểm học kỳ và cả năm được hệ thống tự động tính từ trung bình cộng của các tháng. Bạn hãy chuyển sang tab "Theo Tháng" để sửa điểm của từng tháng tương ứng.');
      return;
    }
    setEditingItem(item);
    setFormData({
      teacher_id: item.teacher_id,
      period_type: item.period_type,
      period_value: item.period_value,
      school_year: item.school_year || settings?.school_year || '2026-2027',
      professional_score: item.professional_score || 0,
      teaching_score: item.teaching_score || 0,
      activity_score: item.activity_score || 0,
      rank: item.rank || 'Tốt',
      notes: item.notes || '',
      is_published: item.is_published ?? true
    });
    setIsModalOpen(true);
  };

  const calculateTotal = (prof, teach, act) => {
    const p = parseFloat(prof) || 0;
    const t = parseFloat(teach) || 0;
    const a = parseFloat(act) || 0;
    return parseFloat(((p * 0.4) + (t * 0.4) + (a * 0.2)).toFixed(2));
  };

  const handleSaveEmulation = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Chỉ Quản trị viên (Admin - Tổ trưởng) mới có quyền lưu điểm thi đua.');
      return;
    }

    if (!formData.teacher_id) {
      alert('Vui lòng chọn giáo viên để chấm điểm thi đua!');
      return;
    }

    const total = calculateTotal(
      formData.professional_score,
      formData.teaching_score,
      formData.activity_score
    );

    try {
      setSaving(true);
      if (editingItem) {
        const { error } = await supabase
          .from('emulations')
          .update({
            teacher_id: formData.teacher_id,
            period_type: formData.period_type,
            period_value: formData.period_value,
            school_year: formData.school_year,
            professional_score: formData.professional_score,
            teaching_score: formData.teaching_score,
            activity_score: formData.activity_score,
            total_score: total,
            rank: formData.rank,
            notes: formData.notes,
            is_published: formData.is_published,
            rated_by: user?.id
          })
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('emulations').insert([
          {
            teacher_id: formData.teacher_id,
            period_type: formData.period_type,
            period_value: formData.period_value,
            school_year: formData.school_year,
            professional_score: formData.professional_score,
            teaching_score: formData.teaching_score,
            activity_score: formData.activity_score,
            total_score: total,
            rank: formData.rank,
            notes: formData.notes,
            is_published: formData.is_published,
            rated_by: user?.id
          }
        ]);

        if (error) throw error;

        // Phát sóng thông báo cập nhật kết quả thi đua
        await broadcastNotification({
          title: 'Kết Quả Thi Đua Mới Được Cập Nhật',
          message: `Tổ trưởng chuyên môn vừa cập nhật kết quả đánh giá thi đua ${formData.period_value}.`,
          linkUrl: '/emulation',
          type: 'emulation'
        });
      }

      setIsModalOpen(false);
      await fetchTeachersAndData();
    } catch (err) {
      console.error('Lỗi lưu thi đua:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEmulation = async () => {
    if (!deletingItem) return;
    if (!isAdmin) {
      alert('Chỉ Quản trị viên (Admin - Tổ trưởng) mới có quyền xóa kết quả thi đua.');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('emulations')
        .delete()
        .eq('id', deletingItem.id);

      if (error) throw error;
      setDeletingItem(null);
      await fetchTeachersAndData();
    } catch (err) {
      console.error('Lỗi khi xóa kết quả thi đua:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredEmulations = currentDisplayEmulations.filter((item) => {
    if (!item) return false;
    const term = (searchTerm || '').toLowerCase().trim();
    const name = (item.profiles?.full_name || '').toLowerCase();
    const notes = (item.notes || '').toLowerCase();
    return !term || name.includes(term) || notes.includes(term);
  });

  const getRankBadge = (rank) => {
    switch (rank) {
      case 'Xuất sắc':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Tốt':
        return 'bg-brand-100 text-brand-800 border-brand-300';
      case 'Khá':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Đạt':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-brand-600 mb-1">
            <Award className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Đánh Giá & Khen Thưởng</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Thi Đua & Xếp Loại Tổ Chuyên Môn KHTN
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chấm điểm thi đua hàng tháng • Tự động tính Trung bình cộng Học kỳ (HKI: T9-T1, HKII: T2-T5) & Cả năm học
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsPrintOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In Bảng Thi Đua</span>
          </button>

          {/* CHỈ ADMIN (TỔ TRƯỞNG - THẦY HOẠCH) MỚI NHÌN THẤY NÚT CHẤM ĐIỂM */}
          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Chấm Điểm Thi Đua (Tháng)</span>
            </button>
          )}
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Period Type Selection */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setSelectedPeriodType('month');
                setSelectedPeriodValue('Tháng 9');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedPeriodType === 'month' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Theo Tháng
            </button>
            <button
              onClick={() => {
                setSelectedPeriodType('term');
                setSelectedPeriodValue('Học kỳ 1');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedPeriodType === 'term' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Theo Học Kỳ (Tự Động TBC)
            </button>
            <button
              onClick={() => {
                setSelectedPeriodType('year');
                setSelectedPeriodValue(`Năm học ${settings?.school_year || '2026-2027'}`);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedPeriodType === 'year' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cả Năm Học (TBC 2 Học Kỳ)
            </button>
          </div>

          {/* Period Value Selection */}
          <div className="flex items-center space-x-2 overflow-x-auto">
            {selectedPeriodType === 'month' && (
              <div className="flex items-center space-x-1.5">
                {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((m) => {
                  const val = `Tháng ${m}`;
                  return (
                    <button
                      key={m}
                      onClick={() => setSelectedPeriodValue(val)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                        selectedPeriodValue === val
                          ? 'bg-brand-600 text-white shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      T{m}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedPeriodType === 'term' && (
              <div className="flex items-center space-x-2">
                {['Học kỳ 1', 'Học kỳ 2'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedPeriodValue(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedPeriodValue === t
                        ? 'bg-brand-600 text-white shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t} {t === 'Học kỳ 1' ? '(T9 đến T1)' : '(T2 đến T5)'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Khung Thông Báo Công Thức Tự Động Tính Điểm */}
        {selectedPeriodType !== 'month' && (
          <div className="p-3 bg-brand-50/80 border border-brand-200 rounded-xl flex items-center justify-between gap-3 text-xs text-brand-900 animate-in fade-in">
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-brand-600 shrink-0" />
              <span>
                {selectedPeriodType === 'term' ? (
                  <>
                    <strong>Công thức tự động:</strong> Điểm {selectedPeriodValue} = Điểm Trung Bình Cộng (TBC) của các tháng{' '}
                    {selectedPeriodValue === 'Học kỳ 1' ? 'Học kỳ I (Tháng 9 đến Tháng 1)' : 'Học kỳ II (Tháng 2 đến Tháng 5)'}.
                  </>
                ) : (
                  <>
                    <strong>Công thức tự động:</strong> Điểm thi đua Cả Năm Học = Điểm Trung Bình Cộng của cả hai học kỳ{' '}
                    <strong>(Điểm HKI + Điểm HKII) / 2</strong>.
                  </>
                )}
              </span>
            </div>

            <span className="text-[11px] font-bold text-brand-700 bg-white px-2.5 py-0.5 rounded-full border border-brand-200 shrink-0">
              ⚡ Tự động tính toán
            </span>
          </div>
        )}

        {/* Search inside emulation table */}
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm giáo viên trong bảng xếp loại..."
        />
      </div>

      {/* Biểu Đồ Thống Kê & Bục Vinh Danh */}
      <EmulationChart emulations={filteredEmulations} periodValue={selectedPeriodValue} />

      {/* Emulation Table */}
      {loading ? (
        <LoadingSpinner text="Đang tải kết quả thi đua..." />
      ) : filteredEmulations.length === 0 ? (
        <EmptyState
          title="Chưa có kết quả thi đua"
          description={
            selectedPeriodType === 'month'
              ? `Chưa có dữ liệu chấm điểm cho ${selectedPeriodValue}.`
              : `Chưa có dữ liệu điểm các tháng thành phần để tính TBC cho ${selectedPeriodValue}. Quý thầy cô vui lòng chấm điểm các tháng trước.`
          }
          actionText={isAdmin && selectedPeriodType === 'month' ? 'Chấm điểm cho giáo viên' : undefined}
          onAction={isAdmin && selectedPeriodType === 'month' ? handleOpenAddModal : undefined}
          icon={Award}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">Thứ Hạng</th>
                  <th className="py-3.5 px-4">Họ và Tên Giáo Viên</th>
                  <th className="py-3.5 px-4 text-center">Hồ Sơ (40%)</th>
                  <th className="py-3.5 px-4 text-center">Thao Giảng (40%)</th>
                  <th className="py-3.5 px-4 text-center">Phong Trào (20%)</th>
                  <th className="py-3.5 px-4 text-center">
                    {selectedPeriodType === 'month' ? 'Tổng Điểm' : 'Điểm TBC'}
                  </th>
                  <th className="py-3.5 px-4 text-center">Xếp Loại</th>
                  <th className="py-3.5 px-4">Ghi Chú & Chi Tiết Tính</th>
                  {isAdmin && selectedPeriodType === 'month' && (
                    <th className="py-3.5 px-4 text-right">Thao Tác</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmulations.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            index === 0
                              ? 'bg-amber-100 text-amber-800'
                              : index === 1
                              ? 'bg-slate-200 text-slate-700'
                              : index === 2
                              ? 'bg-orange-100 text-orange-800'
                              : 'text-slate-500 font-medium'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800 text-sm">
                        {item.profiles?.full_name || 'Giáo viên'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.profiles?.specialty || 'Tổ KHTN'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-slate-700">
                      {item.professional_score}
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-slate-700">
                      {item.teaching_score}
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-slate-700">
                      {item.activity_score}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm font-black text-brand-700">
                        {item.total_score}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getRankBadge(item.rank)}`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-[11px]">
                      {item.is_aggregated ? (
                        <span className="inline-flex items-center space-x-1 text-brand-700 font-medium bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/60">
                          <span>{item.notes}</span>
                        </span>
                      ) : (
                        item.notes || '---'
                      )}
                    </td>
                    {isAdmin && selectedPeriodType === 'month' && (
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg border border-slate-200 transition-colors"
                            title="Sửa điểm thi đua tháng"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                            title="Xóa bản ghi thi đua tháng"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Chấm Điểm Thi Đua Theo Tháng (Chỉ Admin mới mở được) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Chỉnh Sửa Điểm Thi Đua' : 'Chấm Điểm Thi Đua Giáo Viên'}
      >
        <form onSubmit={handleSaveEmulation} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chọn Giáo Viên <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.teacher_id}
              disabled={!!editingItem}
              onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
              required
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name} ({t.specialty || 'Tổ KHTN'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tháng Đánh Giá</label>
              <select
                value={formData.period_value}
                onChange={(e) => setFormData({ ...formData, period_value: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((m) => (
                  <option key={m} value={`Tháng ${m}`}>
                    Tháng {m} {m >= 9 || m === 1 ? '(Học kỳ I)' : '(Học kỳ II)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Xếp Loại Chung</label>
              <select
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {EMULATION_RANKS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Điểm Hồ Sơ (40%)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={formData.professional_score}
                onChange={(e) => setFormData({ ...formData, professional_score: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Điểm Thao Giảng (40%)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={formData.teaching_score}
                onChange={(e) => setFormData({ ...formData, teaching_score: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Điểm Phong Trào (20%)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={formData.activity_score}
                onChange={(e) => setFormData({ ...formData, activity_score: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nhận Xét & Đánh Giá</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ghi chú thành tích hoặc điểm cần khắc phục..."
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/20 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu Điểm Thi Đua'}
            </button>
          </div>
        </form>
      </Modal>

      {/* In Bảng Thi Đua Chuẩn */}
      <PrintReportModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        docType="emulation"
        data={{
          periodValue: selectedPeriodValue,
          items: filteredEmulations
        }}
      />

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteEmulation}
        title="Xóa đánh giá thi đua"
        message={`Bạn có chắc chắn muốn xóa bản ghi thi đua tháng của "${deletingItem?.profiles?.full_name}" không?`}
        isLoading={saving}
      />
    </div>
  );
}
