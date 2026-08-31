import React, { useState } from 'react';
import { uploadFileToSupabase } from '../../utils/fileUploader';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';

export default function AddTopicModal({ isOpen, onClose, onSave, activeTab }) {
  const [topicData, setTopicData] = useState({
    title: '',
    subject: activeTab === 'lesson_study' ? 'Khoa học Tự nhiên 7' : 'Khoa học Tự nhiên',
    grade: 7,
    author: '',
    date: new Date().toLocaleDateString('vi-VN'),
    summary: '',
    status: 'Đang triển khai',
    type: activeTab
  });

  const [attachedFile, setAttachedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!topicData.title.trim() || !topicData.author.trim()) {
      setError('Vui lòng điền đầy đủ Tên chuyên đề và Người thực hiện.');
      return;
    }

    try {
      setUploading(true);
      let fileUrl = null;
      let fileName = null;

      if (attachedFile) {
        const uploadRes = await uploadFileToSupabase(attachedFile, 'khtn-documents', 'lesson-study-plans');
        fileUrl = uploadRes.publicUrl;
        fileName = attachedFile.name;
      }

      const createdTopic = {
        ...topicData,
        id: `topic-${Date.now()}`,
        file_url: fileUrl,
        file_name: fileName,
        feedbacks: []
      };

      onSave(createdTopic);
      onClose();
    } catch (err) {
      console.error('Lỗi khi tải tệp hoặc lưu chuyên đề:', err);
      setError(`Lỗi: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeTab === 'lesson_study' ? 'Đăng Ký Chuyên Đề Nghiên Cứu Bài Học Mới' : 'Đăng Ký Chuyên Đề Nâng Cao Chất Lượng & STEM'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Tên Chuyên Đề / Bài Học Minh Họa <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={topicData.title}
            onChange={(e) => setTopicData({ ...topicData, title: e.target.value })}
            placeholder="VD: Nghiên cứu bài học: Trao đổi nước & chất dinh dưỡng ở thực vật"
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Môn / Phân Môn & Khối Lớp</label>
            <select
              value={topicData.subject}
              onChange={(e) => setTopicData({ ...topicData, subject: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Khoa học Tự nhiên 6">Khoa học Tự nhiên 6</option>
              <option value="Khoa học Tự nhiên 7">Khoa học Tự nhiên 7</option>
              <option value="Khoa học Tự nhiên 8">Khoa học Tự nhiên 8</option>
              <option value="Khoa học Tự nhiên 9">Khoa học Tự nhiên 9</option>
              <option value="Toán học">Toán học</option>
              <option value="Tin học">Tin học</option>
              <option value="Công nghệ">Công nghệ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Người / Nhóm Thực Hiện <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={topicData.author}
              onChange={(e) => setTopicData({ ...topicData, author: e.target.value })}
              placeholder="VD: Nhóm Sinh học KHTN (Thầy Tuấn & Cô Hảo)"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Tóm Tắt Mục Tiêu & Phương Pháp Đổi Mới</label>
          <textarea
            rows={3}
            value={topicData.summary}
            onChange={(e) => setTopicData({ ...topicData, summary: e.target.value })}
            placeholder="Mô tả phương pháp tổ chức hoạt động nhóm, sử dụng thí nghiệm ảo hoặc giáo cụ trực quan..."
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Đính Kèm Tệp Giáo Án Minh Họa (Word / PDF / PowerPoint) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Đính Kèm Giáo Án Minh Họa (.docx, .pdf, .pptx)</span>
            <span className="text-[10px] text-slate-400 font-normal">Tùy chọn</span>
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
            onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
          />
          {attachedFile && (
            <div className="mt-2 flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
              <FileText className="w-4 h-4" />
              <span className="font-semibold">{attachedFile.name}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Thời Gian Triển Khai</label>
            <input
              type="text"
              value={topicData.date}
              onChange={(e) => setTopicData({ ...topicData, date: e.target.value })}
              placeholder="VD: 25/11/2026"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Trạng Thái</label>
            <select
              value={topicData.status}
              onChange={(e) => setTopicData({ ...topicData, status: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Đang triển khai">Đang triển khai</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
          >
            {uploading ? 'Đang tải tệp & lưu...' : 'Lưu & Đăng Ký'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
