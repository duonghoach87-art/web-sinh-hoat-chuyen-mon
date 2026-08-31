import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { PLAN_TYPES } from '../../lib/constants';
import { formatDate } from '../../utils/formatDate';
import { uploadFileToSupabase } from '../../utils/fileUploader';
import Modal from '../../components/common/Modal';
import PdfViewerModal from '../../components/common/PdfViewerModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import {
  CalendarDays,
  Plus,
  Eye,
  Download,
  Trash2,
  Calendar,
  FileText,
  Upload
} from 'lucide-react';

export default function DepartmentPlansPage() {
  const { canManage, user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  // Preview & Delete State
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [deletingPlan, setDeletingPlan] = useState(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    plan_type: 'monthly',
    school_year: '2026-2027',
    term: 'Học kỳ 1',
    month: 'Tháng 9',
    week_number: 1,
    content: ''
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('department_plans')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Lỗi tải kế hoạch của tổ:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      plan_type: 'monthly',
      school_year: '2025-2026',
      term: 'Học kỳ 1',
      month: 'Tháng 9',
      week_number: 1,
      content: ''
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setSaving(true);
      let fileUrl = null;

      if (selectedFile) {
        const uploadRes = await uploadFileToSupabase(
          selectedFile,
          'khtn-documents',
          'ke-hoach-to'
        );
        fileUrl = uploadRes.publicUrl;
      }

      const { error } = await supabase.from('department_plans').insert([
        {
          title: formData.title.trim(),
          plan_type: formData.plan_type,
          school_year: formData.school_year,
          term: formData.term,
          month: formData.month,
          week_number: parseInt(formData.week_number) || null,
          content: formData.content,
          file_url: fileUrl,
          created_by: user?.id
        }
      ]);

      if (error) throw error;

      setIsModalOpen(false);
      await fetchPlans();
    } catch (err) {
      console.error('Lỗi khi lưu kế hoạch:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!deletingPlan) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from('department_plans')
        .delete()
        .eq('id', deletingPlan.id);

      if (error) throw error;
      setDeletingPlan(null);
      await fetchPlans();
    } catch (err) {
      console.error('Lỗi khi xóa kế hoạch:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredPlans = plans.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.school_year?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'ALL' || p.plan_type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-brand-600 mb-1">
            <CalendarDays className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Kế Hoạch Giáo Dục</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Kế Hoạch Của Tổ Chuyên Môn KHTN
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý Kế hoạch Năm học, Kế hoạch Học kỳ, Kế hoạch Tháng và Lịch công tác Tuần
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Kế Hoạch Mới</span>
          </button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm kiếm kế hoạch theo tiêu đề, năm học..."
          className="w-full sm:max-w-md"
        />

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedType === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tất cả ({plans.length})
          </button>
          {Object.entries(PLAN_TYPES).map(([typeKey, typeInfo]) => {
            const count = plans.filter((p) => p.plan_type === typeKey).length;
            return (
              <button
                key={typeKey}
                onClick={() => setSelectedType(typeKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  selectedType === typeKey
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {typeInfo.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Plans List */}
      {loading ? (
        <LoadingSpinner text="Đang tải kế hoạch của tổ..." />
      ) : filteredPlans.length === 0 ? (
        <EmptyState
          title="Chưa có kế hoạch nào"
          description="Hiện chưa có bản kế hoạch nào phù hợp với bộ lọc."
          actionText={canManage ? 'Tạo kế hoạch mới' : undefined}
          onAction={canManage ? handleOpenAddModal : undefined}
          icon={CalendarDays}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlans.map((plan) => {
            const typeConfig = PLAN_TYPES[plan.plan_type] || PLAN_TYPES.monthly;
            return (
              <div
                key={plan.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${typeConfig.badge}`}>
                      {typeConfig.label}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Năm học: {plan.school_year}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">
                    {plan.title}
                  </h3>

                  {plan.content && (
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {plan.content}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {formatDate(plan.created_at)}
                  </span>

                  <div className="flex items-center space-x-1.5">
                    {plan.file_url && (
                      <>
                        <button
                          onClick={() => {
                            setPreviewUrl(plan.file_url);
                            setPreviewTitle(plan.title);
                          }}
                          className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg border border-brand-200 transition-colors flex items-center space-x-1 text-xs font-semibold px-2"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem</span>
                        </button>
                        <a
                          href={plan.file_url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}

                    {canManage && (
                      <button
                        onClick={() => setDeletingPlan(plan)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tạo Kế Hoạch */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo Kế Hoạch Của Tổ Chuyên Môn"
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tiêu Đề Kế Hoạch <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Kế hoạch thực hiện nhiệm vụ chuyên môn Tháng 10/2025"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Loại Kế Hoạch</label>
              <select
                value={formData.plan_type}
                onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="yearly">Kế hoạch Năm học</option>
                <option value="term">Kế hoạch Học kỳ</option>
                <option value="monthly">Kế hoạch Tháng</option>
                <option value="weekly">Kế hoạch Tuần</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Năm Học</label>
              <input
                type="text"
                value={formData.school_year}
                onChange={(e) => setFormData({ ...formData, school_year: e.target.value })}
                placeholder="2025-2026"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tệp Kế Hoạch Đính Kèm (PDF / Word)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nội Dung Chi Tiết / Chỉ Tiêu Trọng Tâm</label>
            <textarea
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Nhập tóm tắt các công việc trọng tâm, chỉ tiêu số lượng..."
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu Kế Hoạch'}
            </button>
          </div>
        </form>
      </Modal>

      {/* PDF Viewer */}
      <PdfViewerModal
        isOpen={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        fileUrl={previewUrl}
        title={previewTitle}
      />

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingPlan}
        onClose={() => setDeletingPlan(null)}
        onConfirm={handleDeletePlan}
        title="Xóa kế hoạch"
        message={`Bạn có chắc chắn muốn xóa kế hoạch "${deletingPlan?.title}" không?`}
        isLoading={saving}
      />
    </div>
  );
}
