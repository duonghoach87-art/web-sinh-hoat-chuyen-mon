import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { GRADE_LEVELS, EXAM_TYPES, SPECIALTIES } from '../../lib/constants';
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
  FolderArchive,
  Plus,
  Eye,
  Download,
  Trash2,
  FileCheck,
  FileSpreadsheet,
  Upload,
  Calendar,
  Layers,
  BookOpen
} from 'lucide-react';

export default function ExamBankPage() {
  const { user, canManage } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  // Preview & Delete State
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [deletingExam, setDeletingExam] = useState(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [examFile, setExamFile] = useState(null);
  const [matrixFile, setMatrixFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    grade_level: 6,
    subject: 'Khoa học Tự nhiên',
    exam_type: 'mid_term',
    school_year: '2026-2027'
  });

  const fetchExams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exam_bank')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Lỗi tải ngân hàng đề thi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      grade_level: 6,
      subject: 'Khoa học Tự nhiên',
      exam_type: 'mid_term',
      school_year: '2025-2026'
    });
    setExamFile(null);
    setMatrixFile(null);
    setIsModalOpen(true);
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (!examFile || !matrixFile) {
      alert('Vui lòng đính kèm đầy đủ cả 2 tệp: 1. Đề thi và 2. Ma trận/Bản đặc tả!');
      return;
    }

    try {
      setSaving(true);

      // Tải lên 2 file bắt buộc
      const [examRes, matrixRes] = await Promise.all([
        uploadFileToSupabase(examFile, 'khtn-documents', 'de-thi'),
        uploadFileToSupabase(matrixFile, 'khtn-documents', 'ma-tran')
      ]);

      const { error } = await supabase.from('exam_bank').insert([
        {
          title: formData.title.trim(),
          grade_level: parseInt(formData.grade_level),
          subject: formData.subject,
          exam_type: formData.exam_type,
          school_year: formData.school_year,
          exam_file_url: examRes.publicUrl,
          matrix_file_url: matrixRes.publicUrl,
          author_id: user?.id
        }
      ]);

      if (error) throw error;

      setIsModalOpen(false);
      await fetchExams();
    } catch (err) {
      console.error('Lỗi khi lưu đề thi:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!deletingExam) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from('exam_bank')
        .delete()
        .eq('id', deletingExam.id);

      if (error) throw error;
      setDeletingExam(null);
      await fetchExams();
    } catch (err) {
      console.error('Lỗi khi xóa đề thi:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredExams = exams.filter((ex) => {
    const matchesSearch =
      ex.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade =
      selectedGrade === 'ALL' || ex.grade_level.toString() === selectedGrade;

    const matchesType =
      selectedType === 'ALL' || ex.exam_type === selectedType;

    return matchesSearch && matchesGrade && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-brand-600 mb-1">
            <FolderArchive className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Học Liệu & Đánh Giá</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Ngân Hàng Đề Thi & Ma Trận Đặc Tả
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kho lưu trữ đề kiểm tra thường xuyên, giữa kỳ, cuối kỳ bắt buộc kèm bản Ma trận & Đặc tả theo Khối 6, 7, 8, 9
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Đóng Góp Đề Thi Mới</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm theo tên đề thi, môn học, giáo viên ra đề..."
          className="w-full sm:max-w-md"
        />

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="ALL">Tất cả Khối lớp</option>
            <option value="6">Khối 6</option>
            <option value="7">Khối 7</option>
            <option value="8">Khối 8</option>
            <option value="9">Khối 9</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="ALL">Tất cả Kỳ kiểm tra</option>
            <option value="regular">Thường xuyên</option>
            <option value="mid_term">Giữa kỳ</option>
            <option value="final_term">Cuối kỳ</option>
          </select>
        </div>
      </div>

      {/* Exam Grid */}
      {loading ? (
        <LoadingSpinner text="Đang tải ngân hàng đề thi..." />
      ) : filteredExams.length === 0 ? (
        <EmptyState
          title="Chưa có đề thi nào"
          description="Hiện chưa có bộ đề thi nào phù hợp với bộ lọc hoặc từ khóa."
          actionText="Đóng góp đề thi đầu tiên"
          onAction={handleOpenAddModal}
          icon={FolderArchive}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((exam) => {
            const isOwner = exam.author_id === user?.id;
            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-100">
                      Khối {exam.grade_level} • {exam.subject}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Năm: {exam.school_year}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">
                    {exam.title}
                  </h3>

                  <div className="text-[11px] text-slate-500 font-medium">
                    Người ra đề: <strong>{exam.profiles?.full_name || 'Giáo viên tổ'}</strong>
                  </div>

                  {/* 2 Files Actions Badge */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
                        <FileCheck className="w-3.5 h-3.5 text-brand-600" />
                        <span>1. Đề Kiểm Tra</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setPreviewUrl(exam.exam_file_url);
                            setPreviewTitle(`Đề thi: ${exam.title}`);
                          }}
                          className="px-2 py-0.5 text-[11px] font-bold bg-white text-brand-600 border border-brand-200 rounded hover:bg-brand-50"
                        >
                          Xem
                        </button>
                        <a
                          href={exam.exam_file_url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-slate-500 hover:text-slate-700"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>2. Ma Trận & Đặc Tả</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setPreviewUrl(exam.matrix_file_url);
                            setPreviewTitle(`Ma trận: ${exam.title}`);
                          }}
                          className="px-2 py-0.5 text-[11px] font-bold bg-white text-emerald-600 border border-emerald-200 rounded hover:bg-emerald-50"
                        >
                          Xem
                        </button>
                        <a
                          href={exam.matrix_file_url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-slate-500 hover:text-slate-700"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {formatDate(exam.created_at)}
                  </span>

                  {(canManage || isOwner) && (
                    <button
                      onClick={() => setDeletingExam(exam)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                      title="Xóa đề thi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Thêm Đề Thi */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Đóng Góp Đề Thi & Ma Trận Mới"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveExam} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên Bộ Đề Thi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Đề kiểm tra giữa học kỳ 1 môn KHTN 7 (Năm học 2025-2026)"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Khối Lớp</label>
              <select
                value={formData.grade_level}
                onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {GRADE_LEVELS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Môn Học</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {SPECIALTIES.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Loại Kiểm Tra</label>
              <select
                value={formData.exam_type}
                onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="regular">Thường xuyên</option>
                <option value="mid_term">Giữa kỳ</option>
                <option value="final_term">Cuối kỳ</option>
              </select>
            </div>
          </div>

          {/* Bắt buộc 2 Files */}
          <div className="p-4 bg-brand-50/60 border border-brand-100 rounded-2xl space-y-3">
            <div>
              <label className="block text-xs font-bold text-brand-900 mb-1">
                1. Tệp Đề Thi & Đáp Án (Word / PDF) <span className="text-rose-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setExamFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white file:text-brand-700 hover:file:bg-brand-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-900 mb-1">
                2. Tệp Ma Trận & Bản Đặc Tả Đề (Word / PDF / Excel) <span className="text-rose-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={(e) => setMatrixFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white file:text-emerald-700 hover:file:bg-emerald-100"
                required
              />
            </div>
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
              {saving ? 'Đang tải lên...' : 'Lưu Đề Thi & Ma Trận'}
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
        isOpen={!!deletingExam}
        onClose={() => setDeletingExam(null)}
        onConfirm={handleDeleteExam}
        title="Xóa đề thi"
        message={`Bạn có chắc chắn muốn xóa bộ đề "${deletingExam?.title}" không?`}
        isLoading={saving}
      />
    </div>
  );
}
