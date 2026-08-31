import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import { MessageSquare, Send, User, Trash2, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import Badge from '../common/Badge';

export default function TopicFeedbackModal({
  isOpen,
  onClose,
  topic,
  onAddFeedback,
  onDeleteFeedback
}) {
  const { profile, role: userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  const [observation, setObservation] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !topic) return null;

  const feedbacks = topic.feedbacks || [];

  const handleSendFeedback = (e) => {
    e.preventDefault();
    if (!observation.trim()) {
      alert('Vui lòng nhập nội dung quan sát học sinh.');
      return;
    }

    setSubmitting(true);
    const newFeedback = {
      id: `fb-${Date.now()}`,
      author_name: profile?.full_name || 'Đồng nghiệp trong tổ',
      author_specialty: profile?.specialty || 'Khoa học Tự nhiên',
      created_at: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      observation: observation.trim(),
      suggestion: suggestion.trim()
    };

    onAddFeedback(topic.id, newFeedback);
    setObservation('');
    setSuggestion('');
    setSubmitting(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="💬 Thảo Luận & Góp Ý Nghiên Cứu Bài Học"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Header Thông Tin Chuyên Đề */}
        <div className="p-4 bg-brand-50/70 border border-brand-100 rounded-2xl space-y-1.5 text-xs">
          <div className="flex items-center space-x-2">
            <Badge variant="primary">{topic.subject}</Badge>
            <span className="text-slate-400">• {topic.date}</span>
          </div>
          <h3 className="font-bold text-slate-800 text-sm leading-snug">{topic.title}</h3>
          <p className="text-slate-600">Thực hiện: <strong>{topic.author}</strong></p>
        </div>

        {/* Danh Sách Ý Kiến Thảo Luận */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            <span>Ý Kiến Góp Ý & Đúc Rút Kinh Nghiệm ({feedbacks.length})</span>
          </h4>

          {feedbacks.length === 0 ? (
            <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
              Chưa có ý kiến góp ý nào sau tiết dạy. Hãy là người đầu tiên chia sẻ quan sát của bạn!
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs transition-all hover:border-slate-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                        {fb.author_name?.charAt(0) || 'GV'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">{fb.author_name}</span>
                        <span className="text-[10px] text-slate-400 ml-2">({fb.author_specialty})</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{fb.created_at}</span>
                      </span>

                      {isAdmin && (
                        <button
                          onClick={() => onDeleteFeedback(topic.id, fb.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition-colors"
                          title="Xóa ý kiến này (Quyền Admin)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 pl-9">
                    <p className="text-slate-700 leading-relaxed">
                      <strong>👀 Quan sát học sinh:</strong> {fb.observation}
                    </p>
                    {fb.suggestion && (
                      <p className="text-brand-800 font-medium leading-relaxed bg-brand-50/60 p-2 rounded-xl border border-brand-100">
                        <strong>💡 Đề xuất cải thiện:</strong> {fb.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Khung Nhập Góp Ý Mới */}
        <form onSubmit={handleSendFeedback} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Gửi Quan Sát & Góp Ý Sau Tiết Dự Giờ</span>
          </h4>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              1. Quan Sát Hoạt Động Của Học Sinh (Học sinh gặp khó khăn gì, hào hứng lúc nào?) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="VD: Ở phút thứ 18, nhóm 3 gặp lúng túng khi nối dây mạch điện thí nghiệm..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              2. Đề Xuất Giải Pháp / Đúc Rút Kinh Nghiệm (Tùy chọn)
            </label>
            <textarea
              rows={2}
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="VD: Giáo viên nên chia nhỏ câu hỏi hướng dẫn trên phiếu học tập hoặc làm mẫu trước..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi Góp Ý Chuyên Môn</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
