import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { MEETING_TYPES } from '../../lib/constants';
import { formatDate } from '../../utils/formatDate';
import { uploadFileToSupabase } from '../../utils/fileUploader';
import Modal from '../../components/common/Modal';
import PdfViewerModal from '../../components/common/PdfViewerModal';
import PrintReportModal from '../../components/common/PrintReportModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import {
  FileCheck2,
  Plus,
  Eye,
  Download,
  Trash2,
  Calendar,
  Users,
  Printer,
  FileSignature
} from 'lucide-react';

export default function MeetingMinutesPage() {
  const { user, canManage } = useAuth();
  const [minutes, setMinutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  // Preview, Print & Delete State
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [printingMinute, setPrintingMinute] = useState(null);
  const [deletingMinute, setDeletingMinute] = useState(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    meeting_type: 'regular',
    meeting_date: new Date().toISOString().split('T')[0],
    location: 'Phòng Hội đồng SP / Phòng Tổ KHTN',
    chairperson: 'Tổ trưởng chuyên môn',
    secretary: '',
    attendees_count: 11,
    content: '',
    conclusions: ''
  });

  const fetchMinutes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meeting_minutes')
        .select('*, profiles(full_name)')
        .order('meeting_date', { ascending: false });

      if (error) throw error;
      setMinutes(data || []);
    } catch (error) {
      console.error('Lỗi tải danh sách biên bản:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMinutes();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      meeting_type: 'regular',
      meeting_date: new Date().toISOString().split('T')[0],
      location: 'Phòng Hội đồng SP / Phòng Tổ KHTN',
      chairperson: 'Tổ trưởng chuyên môn',
      secretary: '',
      attendees_count: 11,
      content: '',
      conclusions: ''
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSaveMinute = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setSaving(true);
      let fileUrl = null;

      if (selectedFile) {
        const uploadRes = await uploadFileToSupabase(
          selectedFile,
          'khtn-documents',
          'bien-ban'
        );
        fileUrl = uploadRes.publicUrl;
      }

      const { error } = await supabase.from('meeting_minutes').insert([
        {
          title: formData.title.trim(),
          meeting_type: formData.meeting_type,
          meeting_date: formData.meeting_date,
          location: formData.location,
          chairperson: formData.chairperson,
          secretary: formData.secretary,
          attendees_count: parseInt(formData.attendees_count) || 11,
          content: formData.content,
          conclusions: formData.conclusions,
          file_url: fileUrl,
          created_by: user?.id
        }
      ]);

      if (error) throw error;

      setIsModalOpen(false);
      await fetchMinutes();
    } catch (err) {
      console.error('Lỗi khi lưu biên bản:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMinute = async () => {
    if (!deletingMinute) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from('meeting_minutes')
        .delete()
        .eq('id', deletingMinute.id);

      if (error) throw error;
      setDeletingMinute(null);
      await fetchMinutes();
    } catch (err) {
      console.error('Lỗi khi xóa biên bản:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredMinutes = minutes.filter((m) => {
    const matchesSearch =
      m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.chairperson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.secretary?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'ALL' || m.meeting_type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-brand-600 mb-1">
            <FileCheck2 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Hồ Sơ Chuyên Môn</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Biên Bản Sinh Hoạt Tổ Chuyên Môn
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lưu trữ biên bản họp tổ 2 tuần/lần, hỗ trợ in ấn mẫu chuẩn Quốc gia hoặc tải bản scan có chữ ký
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Biên Bản Mới</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm theo tiêu đề, chủ trì, thư ký..."
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
            Tất cả ({minutes.length})
          </button>
          {Object.entries(MEETING_TYPES).map(([typeKey, typeInfo]) => {
            const count = minutes.filter((m) => m.meeting_type === typeKey).length;
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

      {/* Minutes Grid */}
      {loading ? (
        <LoadingSpinner text="Đang tải biên bản sinh hoạt..." />
      ) : filteredMinutes.length === 0 ? (
        <EmptyState
          title="Chưa có biên bản nào"
          description="Hiện chưa có bản ghi biên bản họp tổ nào."
          actionText="Tạo biên bản đầu tiên"
          onAction={handleOpenAddModal}
          icon={FileCheck2}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMinutes.map((minute) => {
            const typeConfig = MEETING_TYPES[minute.meeting_type] || MEETING_TYPES.regular;
            return (
              <div
                key={minute.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${typeConfig.badge}`}>
                      {typeConfig.label}
                    </span>
                    <div className="flex items-center space-x-1 text-slate-400 text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(minute.meeting_date)}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 leading-snug">
                    {minute.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 py-2 px-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Chủ trì:</span>
                      <span className="font-semibold text-slate-700">{minute.chairperson || 'Tổ trưởng'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Thư ký:</span>
                      <span className="font-semibold text-slate-700">{minute.secretary || 'Thư ký cuộc họp'}</span>
                    </div>
                  </div>

                  {minute.content && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Tóm tắt nội dung:</span>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {minute.content}
                      </p>
                    </div>
                  )}

                  {minute.conclusions && (
                    <div className="p-2.5 bg-brand-50/70 border border-brand-100 rounded-xl text-xs text-brand-900">
                      <span className="font-bold block text-[11px] mb-0.5">Kết luận & Phân công:</span>
                      <p className="line-clamp-2 leading-relaxed">{minute.conclusions}</p>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tham dự: <strong>{minute.attendees_count}/11</strong> GV</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Nút In / Xuất PDF Chuẩn Quốc Gia */}
                    <button
                      onClick={() => setPrintingMinute(minute)}
                      className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center space-x-1 text-xs font-semibold px-2.5"
                      title="In / Xuất PDF biên bản"
                    >
                      <Printer className="w-3.5 h-3.5 text-brand-600" />
                      <span>In Bản Chuẩn</span>
                    </button>

                    {minute.file_url && (
                      <>
                        <button
                          onClick={() => {
                            setPreviewUrl(minute.file_url);
                            setPreviewTitle(minute.title);
                          }}
                          className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg border border-brand-200 transition-colors flex items-center space-x-1 text-xs font-semibold px-2.5"
                          title="Xem bản scan có chữ ký"
                        >
                          <FileSignature className="w-3.5 h-3.5" />
                          <span>Xem Scan</span>
                        </button>
                        <a
                          href={minute.file_url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}

                    {(canManage || minute.created_by === user?.id) && (
                      <button
                        onClick={() => setDeletingMinute(minute)}
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

      {/* Modal Tạo Biên Bản */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Lập Biên Bản Sinh Hoạt Chuyên Môn"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveMinute} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tiêu Đề Biên Bản <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Biên bản sinh hoạt chuyên môn định kỳ lần 1 - Tháng 10/2025"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Loại Sinh Hoạt</label>
              <select
                value={formData.meeting_type}
                onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="regular">Họp Tổ Định Kỳ</option>
                <option value="lesson_study">Nghiên Cứu Bài Học (Lesson Study)</option>
                <option value="quality_improvement">Chuyên Đề Nâng Cao Chất Lượng</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày Họp</label>
              <input
                type="date"
                value={formData.meeting_date}
                onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số Người Có Mặt</label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.attendees_count}
                onChange={(e) => setFormData({ ...formData, attendees_count: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Người Chủ Trì</label>
              <input
                type="text"
                value={formData.chairperson}
                onChange={(e) => setFormData({ ...formData, chairperson: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thư Ký Ghi Biên Bản</label>
              <input
                type="text"
                value={formData.secretary}
                onChange={(e) => setFormData({ ...formData, secretary: e.target.value })}
                placeholder="VD: Cô Nguyễn Thị Hảo"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tệp Scan PDF Có Chữ Ký (Nếu có)</label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nội Dung Diễn Biến Cuộc Họp</label>
            <textarea
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="1. Đánh giá hoạt động 2 tuần qua...&#10;2. Thảo luận phương pháp dạy học chương trình KHTN mới..."
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kết Luận Cuộc Họp & Phân Công Nhiệm Vụ</label>
            <textarea
              rows={2}
              value={formData.conclusions}
              onChange={(e) => setFormData({ ...formData, conclusions: e.target.value })}
              placeholder="Thống nhất kế hoạch kiểm tra giữa kỳ, phân công giáo viên ra đề..."
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
              {saving ? 'Đang lưu...' : 'Lưu Biên Bản'}
            </button>
          </div>
        </form>
      </Modal>

      {/* In / Xuất PDF Bản Chuẩn Modal */}
      <PrintReportModal
        isOpen={!!printingMinute}
        onClose={() => setPrintingMinute(null)}
        docType="minutes"
        data={printingMinute}
      />

      {/* PDF Viewer */}
      <PdfViewerModal
        isOpen={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        fileUrl={previewUrl}
        title={previewTitle}
      />

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingMinute}
        onClose={() => setDeletingMinute(null)}
        onConfirm={handleDeleteMinute}
        title="Xóa biên bản"
        message={`Bạn có chắc chắn muốn xóa biên bản "${deletingMinute?.title}" không?`}
        isLoading={saving}
      />
    </div>
  );
}
