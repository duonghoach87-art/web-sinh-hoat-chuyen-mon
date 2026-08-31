import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { createNotification } from '../../utils/notifications';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatDate';
import {
  FileText,
  Star,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Award
} from 'lucide-react';

export default function LessonEvaluationModal({
  isOpen,
  onClose,
  registration,
  onEvaluated
}) {
  const { user, profile } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    criteria_1_score: 9.0,
    criteria_2_score: 9.0,
    criteria_3_score: 9.0,
    rank: 'Tốt',
    strengths: '',
    improvements: '',
    general_comment: ''
  });

  const fetchEvaluations = async () => {
    if (!registration?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lesson_evaluations')
        .select('*, evaluator:evaluator_id(full_name, specialty)')
        .eq('registration_id', registration.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Lỗi nạp đánh giá tiết dạy:', error.message);
        return;
      }
      setEvaluations(data || []);
    } catch (err) {
      console.warn('Chưa tải được đánh giá:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && registration?.id) {
      fetchEvaluations();
      setShowForm(false);
    }
  }, [isOpen, registration]);

  const calculateTotal = (c1, c2, c3) => {
    const s1 = parseFloat(c1) || 0;
    const s2 = parseFloat(c2) || 0;
    const s3 = parseFloat(c3) || 0;
    return parseFloat(((s1 + s2 + s3) / 3).toFixed(2));
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!user || !registration?.id) return;

    const total = calculateTotal(
      formData.criteria_1_score,
      formData.criteria_2_score,
      formData.criteria_3_score
    );

    try {
      setSaving(true);
      const { error } = await supabase.from('lesson_evaluations').insert([
        {
          registration_id: registration.id,
          evaluator_id: user.id,
          criteria_1_score: formData.criteria_1_score,
          criteria_2_score: formData.criteria_2_score,
          criteria_3_score: formData.criteria_3_score,
          total_score: total,
          rank: formData.rank,
          strengths: formData.strengths,
          improvements: formData.improvements,
          general_comment: formData.general_comment
        }
      ]);

      if (error) throw error;

      // Gửi thông báo đến giáo viên dạy
      await createNotification({
        userId: registration.teacher_id,
        title: 'Phiếu Nhận Xét Dự Giờ Mới',
        message: `Thầy/Cô ${profile?.full_name || 'Đồng nghiệp'} vừa gửi phiếu nhận xét đánh giá tiết dạy "${registration.topic_title}".`,
        linkUrl: '/teaching-registrations',
        type: 'evaluation'
      });

      setShowForm(false);
      await fetchEvaluations();
      if (onEvaluated) onEvaluated();
    } catch (err) {
      console.error('Lỗi khi lưu phiếu đánh giá:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Phiếu Đánh Giá Tiết Dạy Dự Giờ (Công Văn 5512/BGDĐT)"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Thông tin tiết dạy */}
        <div className="p-4 bg-brand-50/70 border border-brand-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h4 className="font-bold text-brand-900 text-sm">{registration?.topic_title}</h4>
            <p className="text-slate-600 mt-0.5">
              Giáo viên dạy: <strong>{registration?.profiles?.full_name}</strong> &bullet; Lớp:{' '}
              {registration?.classroom} (Tiết {registration?.period_number})
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="font-bold text-brand-700 block">
              {formatDate(registration?.teaching_date)}
            </span>
            <span className="text-[11px] text-slate-500">Hình thức: {registration?.type}</span>
          </div>
        </div>

        {/* Tab / Buttons xem danh sách hoặc thêm nhận xét */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Các Phiếu Nhận Xét Đã Gửi ({evaluations.length})
          </span>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Gửi Phiếu Nhận Xét Dự Giờ</span>
            </button>
          )}
        </div>

        {/* Form Đánh Giá CV 5512 */}
        {showForm ? (
          <form onSubmit={handleSaveEvaluation} className="space-y-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Nhập Điểm Đánh Giá Tiết Dạy</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Đóng form
              </button>
            </div>

            {/* 3 Tiêu chí 5512 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  1. Kế hoạch bài dạy (0-10đ)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.criteria_1_score}
                  onChange={(e) => setFormData({ ...formData, criteria_1_score: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold"
                  required
                />
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  2. Tổ chức dạy học (0-10đ)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.criteria_2_score}
                  onChange={(e) => setFormData({ ...formData, criteria_2_score: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold"
                  required
                />
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  3. Hoạt động của HS (0-10đ)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.criteria_3_score}
                  onChange={(e) => setFormData({ ...formData, criteria_3_score: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ưu Điểm Nổi Bật Của Tiết Dạy
                </label>
                <textarea
                  rows={2}
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  placeholder="Học sinh tích cực thảo luận, đồ dùng trực quan sinh động..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Điểm Cần Rút Kinh Nghiệm / Góp Ý
                </label>
                <textarea
                  rows={2}
                  value={formData.improvements}
                  onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                  placeholder="Cần phân bố thời gian hợp lý hơn ở phần luyện tập..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700">Xếp loại đề xuất:</span>
                <select
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <option value="Xuất sắc">Xuất sắc</option>
                  <option value="Tốt">Tốt</option>
                  <option value="Khá">Khá</option>
                  <option value="Đạt">Đạt</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Gửi Đánh Giá'}
                </button>
              </div>
            </div>
          </form>
        ) : null}

        {/* Danh sách các phiếu đánh giá của đồng nghiệp */}
        <div className="space-y-3">
          {evaluations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              Chưa có giáo viên nào gửi phiếu nhận xét cho tiết dạy này.
            </div>
          ) : (
            evaluations.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                      {item.evaluator?.full_name?.charAt(0) || 'GV'}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800">
                        {item.evaluator?.full_name || 'Đồng nghiệp'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {item.evaluator?.specialty} &bullet; {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-brand-700">
                      {item.total_score} / 10 đ
                    </span>
                    <Badge variant="primary">{item.rank}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] p-2 bg-slate-50 rounded-xl text-center border border-slate-100">
                  <div>Kế hoạch: <strong>{item.criteria_1_score}đ</strong></div>
                  <div>Tổ chức: <strong>{item.criteria_2_score}đ</strong></div>
                  <div>Học sinh: <strong>{item.criteria_3_score}đ</strong></div>
                </div>

                {item.strengths && (
                  <div className="text-xs text-slate-600">
                    <span className="font-bold text-emerald-700 block text-[11px]">Ưu điểm:</span>
                    <p className="leading-relaxed">{item.strengths}</p>
                  </div>
                )}

                {item.improvements && (
                  <div className="text-xs text-slate-600">
                    <span className="font-bold text-amber-700 block text-[11px]">Rút kinh nghiệm:</span>
                    <p className="leading-relaxed">{item.improvements}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
