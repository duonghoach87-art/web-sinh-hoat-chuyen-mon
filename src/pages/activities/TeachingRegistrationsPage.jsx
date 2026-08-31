import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  GRADE_LEVELS,
  TEACHING_REG_TYPES,
  REGISTRATION_STATUS,
  SPECIALTIES
} from '../../lib/constants';
import { formatDate } from '../../utils/formatDate';
import { createNotification } from '../../utils/notifications';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import PrintReportModal from '../../components/common/PrintReportModal';
import LessonEvaluationModal from './LessonEvaluationModal';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import {
  GraduationCap,
  Plus,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Filter,
  User,
  Star,
  Printer,
  MessageSquare
} from 'lucide-react';

export default function TeachingRegistrationsPage() {
  const { user, profile, canManage, role } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');

  // Form & Review Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [evaluatingReg, setEvaluatingReg] = useState(null);
  const [isPrintScheduleOpen, setIsPrintScheduleOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState('approved');
  const [reviewerNote, setReviewerNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingReg, setDeletingReg] = useState(null);

  const [formData, setFormData] = useState({
    topic_title: '',
    subject: 'Khoa học Tự nhiên',
    grade_level: 6,
    teaching_date: new Date().toISOString().split('T')[0],
    period_number: 1,
    curriculum_period: 1,
    classroom: '6A1',
    type: 'thao_giang'
  });

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teaching_registrations')
        .select('*, profiles(full_name, specialty, email)')
        .order('teaching_date', { ascending: true });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Lỗi tải danh sách thao giảng:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      topic_title: '',
      subject: profile?.specialty || 'Khoa học Tự nhiên',
      grade_level: 6,
      teaching_date: new Date().toISOString().split('T')[0],
      period_number: 1,
      curriculum_period: 1,
      classroom: '6A1',
      type: 'thao_giang'
    });
    setIsModalOpen(true);
  };

  const handleSaveRegistration = async (e) => {
    e.preventDefault();
    if (!formData.topic_title.trim() || !user) return;

    try {
      setSaving(true);
      const { error } = await supabase.from('teaching_registrations').insert([
        {
          teacher_id: user.id,
          topic_title: formData.topic_title.trim(),
          subject: formData.subject,
          grade_level: parseInt(formData.grade_level),
          teaching_date: formData.teaching_date,
          period_number: parseInt(formData.period_number),
          curriculum_period: parseInt(formData.curriculum_period) || null,
          classroom: formData.classroom.trim(),
          type: formData.type,
          status: 'pending'
        }
      ]);

      if (error) throw error;

      setIsModalOpen(false);
      await fetchRegistrations();
    } catch (err) {
      console.error('Lỗi khi đăng ký tiết dạy:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenReview = (reg, action) => {
    setSelectedReg(reg);
    setReviewAction(action);
    setReviewerNote('');
    setReviewModalOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedReg) return;
    try {
      setSaving(true);
      const note = reviewerNote.trim() || (reviewAction === 'approved' ? 'Tổ trưởng đã phê duyệt lịch dạy.' : 'Vui lòng chọn ngày khác hoặc liên hệ tổ trưởng.');
      const { error } = await supabase
        .from('teaching_registrations')
        .update({
          status: reviewAction,
          reviewer_note: note,
          reviewed_by: user?.id
        })
        .eq('id', selectedReg.id);

      if (error) throw error;

      // Gửi thông báo đến giáo viên
      await createNotification({
        userId: selectedReg.teacher_id,
        title: reviewAction === 'approved' ? 'Lịch Thao Giảng Đã Được Duyệt' : 'Yêu Cầu Thay Đổi Lịch Dạy',
        message: `Tiết dạy "${selectedReg.topic_title}" ngày ${formatDate(selectedReg.teaching_date)} đã được ${reviewAction === 'approved' ? 'phê duyệt' : 'từ chối/yêu cầu đổi lịch'}. Ghi chú: ${note}`,
        linkUrl: '/teaching-registrations',
        type: 'teaching'
      });

      setReviewModalOpen(false);
      setSelectedReg(null);
      await fetchRegistrations();
    } catch (err) {
      console.error('Lỗi duyệt lịch thao giảng:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRegistration = async () => {
    if (!deletingReg) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from('teaching_registrations')
        .delete()
        .eq('id', deletingReg.id);

      if (error) throw error;
      setDeletingReg(null);
      await fetchRegistrations();
    } catch (err) {
      console.error('Lỗi khi xóa đăng ký:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.topic_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.classroom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'ALL' || reg.status === selectedStatus;

    const matchesGrade =
      selectedGrade === 'ALL' || reg.grade_level.toString() === selectedGrade;

    return matchesSearch && matchesStatus && matchesGrade;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-brand-600 mb-1">
            <GraduationCap className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Thao Giảng & Hội Giảng</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Đăng Ký & Quản Lý Lịch Thao Giảng - Chuyên Đề
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đăng ký lịch dạy, phê duyệt lịch và đánh giá trực tuyến tiết dự giờ theo Công văn 5512/BGDĐT
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsPrintScheduleOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In Lịch Phân Công</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Đăng Ký Tiết Thao Giảng</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm theo tên bài học, giáo viên, lớp học..."
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="ALL">Tất cả Trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Registrations List / Table */}
      {loading ? (
        <LoadingSpinner text="Đang tải lịch đăng ký thao giảng..." />
      ) : filteredRegistrations.length === 0 ? (
        <EmptyState
          title="Chưa có lịch đăng ký nào"
          description="Hiện chưa có tiết thao giảng nào được đăng ký trong danh sách này."
          actionText="Đăng ký tiết dạy ngay"
          onAction={handleOpenAddModal}
          icon={GraduationCap}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">Tên Bài Học / Chủ Đề</th>
                  <th className="py-3.5 px-4">Giáo Viên Dạy</th>
                  <th className="py-3.5 px-4">Thời Gian & Tiết</th>
                  <th className="py-3.5 px-4">Lớp / Khối</th>
                  <th className="py-3.5 px-4">Hình Thức</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Đánh Giá & Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.map((reg) => {
                  const statusInfo = REGISTRATION_STATUS[reg.status] || REGISTRATION_STATUS.pending;
                  const typeInfo = TEACHING_REG_TYPES[reg.type] || TEACHING_REG_TYPES.thao_giang;
                  const isOwner = reg.teacher_id === user?.id;

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-800 text-sm leading-snug">
                            {reg.topic_title}
                          </h4>
                          <span className="text-[11px] text-slate-500 block">
                            {reg.subject} &bullet; Tiết PPCT: {reg.curriculum_period || '---'}
                          </span>
                          {reg.reviewer_note && (
                            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1 rounded mt-1">
                              Ý kiến duyệt: {reg.reviewer_note}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-700">
                          {reg.profiles?.full_name || 'Giáo viên'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {reg.profiles?.specialty}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-brand-700 flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-brand-500" />
                          <span>{formatDate(reg.teaching_date)}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Tiết {reg.period_number} trong buổi</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                          {reg.classroom}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1.5">(Khối {reg.grade_level})</span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${typeInfo.badge}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Nút Đánh giá dự giờ CV 5512 */}
                          <button
                            onClick={() => setEvaluatingReg(reg)}
                            className="p-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors text-xs font-bold flex items-center space-x-1 px-2.5"
                            title="Gửi phiếu đánh giá tiết dạy theo CV 5512"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                            <span>Đánh giá 5512</span>
                          </button>

                          {canManage && reg.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleOpenReview(reg, 'approved')}
                                className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors text-xs font-bold flex items-center space-x-1 px-2"
                                title="Phê duyệt lịch dạy"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Duyệt</span>
                              </button>
                              <button
                                onClick={() => handleOpenReview(reg, 'rejected')}
                                className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors text-xs font-bold flex items-center space-x-1 px-2"
                                title="Từ chối / Đổi ngày"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Từ chối</span>
                              </button>
                            </>
                          )}

                          {(canManage || (isOwner && reg.status === 'pending')) && (
                            <button
                              onClick={() => setDeletingReg(reg)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                              title="Hủy / Xóa đăng ký"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Đăng Ký */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Đăng Ký Tiết Dạy Thao Giảng / Chuyên Đề"
      >
        <form onSubmit={handleSaveRegistration} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên Bài Dạy / Chủ Đề Thao Giảng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.topic_title}
              onChange={(e) => setFormData({ ...formData, topic_title: e.target.value })}
              placeholder="VD: Bài 12 - Tế bào: Đơn vị cơ sở của sự sống"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phân Môn / Môn Học</label>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày Dạy</label>
              <input
                type="date"
                value={formData.teaching_date}
                onChange={(e) => setFormData({ ...formData, teaching_date: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tiết Trong Buổi</label>
              <select
                value={formData.period_number}
                onChange={(e) => setFormData({ ...formData, period_number: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                  <option key={p} value={p}>
                    Tiết {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tiết PPCT</label>
              <input
                type="number"
                min="1"
                max="200"
                value={formData.curriculum_period}
                onChange={(e) => setFormData({ ...formData, curriculum_period: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lớp Thực Hiện</label>
              <input
                type="text"
                value={formData.classroom}
                onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                placeholder="VD: 6A1, 8A3..."
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hình Thức</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="thao_giang">Thao giảng cấp Tổ</option>
                <option value="chuyen_de">Dạy Chuyên đề</option>
                <option value="hoi_giang">Hội giảng cấp Trường/Huyện</option>
                <option value="du_gio">Dự giờ đồng nghiệp</option>
              </select>
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
              {saving ? 'Đang gửi...' : 'Gửi Đăng Ký'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Duyệt Thao Giảng */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={reviewAction === 'approved' ? 'Phê Duyệt Lịch Thao Giảng' : 'Từ Chối / Yêu Cầu Chỉnh Sửa'}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100 space-y-1">
            <p>Bài dạy: <strong>{selectedReg?.topic_title}</strong></p>
            <p>Giáo viên: <strong>{selectedReg?.profiles?.full_name}</strong></p>
            <p>Ngày dạy: <strong>{formatDate(selectedReg?.teaching_date)} (Tiết {selectedReg?.period_number}, Lớp {selectedReg?.classroom})</strong></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi Chú / Ý Kiến Của Tổ Trưởng
            </label>
            <textarea
              rows={3}
              value={reviewerNote}
              onChange={(e) => setReviewerNote(e.target.value)}
              placeholder="Nhập ghi chú chỉ đạo hoặc lý do thay đổi lịch..."
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmReview}
              disabled={saving}
              className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs ${
                reviewAction === 'approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {saving ? 'Đang lưu...' : reviewAction === 'approved' ? 'Xác Nhận Phê Duyệt' : 'Xác Nhận Từ Chối'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Đánh Giá Dự Giờ Theo CV 5512 */}
      <LessonEvaluationModal
        isOpen={!!evaluatingReg}
        onClose={() => setEvaluatingReg(null)}
        registration={evaluatingReg}
        onEvaluated={fetchRegistrations}
      />

      {/* In Lịch Phân Công Thao Giảng */}
      <PrintReportModal
        isOpen={isPrintScheduleOpen}
        onClose={() => setIsPrintScheduleOpen(false)}
        docType="schedule"
        data={{ items: filteredRegistrations }}
      />

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingReg}
        onClose={() => setDeletingReg(null)}
        onConfirm={handleDeleteRegistration}
        title="Xóa đăng ký thao giảng"
        message={`Bạn có chắc chắn muốn hủy đăng ký tiết dạy "${deletingReg?.topic_title}" không?`}
        isLoading={saving}
      />
    </div>
  );
}
