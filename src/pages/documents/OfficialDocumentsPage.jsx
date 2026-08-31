import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { DOCUMENT_CATEGORIES, ISSUING_AUTHORITIES } from '../../lib/constants';
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
  FileText,
  Plus,
  Eye,
  Download,
  Trash2,
  Calendar,
  Building,
  Hash,
  Upload,
  FileCheck
} from 'lucide-react';

export default function OfficialDocumentsPage() {
  const { canManage, user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Preview & Delete State
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [deletingDoc, setDeletingDoc] = useState(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    document_number: '',
    category: 'Công văn',
    issuing_authority: 'Phòng GD&ĐT',
    issue_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('official_documents')
        .select('*, profiles(full_name)')
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Lỗi tải danh sách văn bản:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      document_number: '',
      category: 'Công văn',
      issuing_authority: 'Phòng GD&ĐT',
      issue_date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSaveDocument = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setSaving(true);
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      if (selectedFile) {
        const uploadRes = await uploadFileToSupabase(
          selectedFile,
          'khtn-documents',
          'van-ban'
        );
        fileUrl = uploadRes.publicUrl;
        fileName = uploadRes.fileName;
        fileSize = uploadRes.fileSize;
      }

      const { error } = await supabase.from('official_documents').insert([
        {
          title: formData.title.trim(),
          document_number: formData.document_number.trim(),
          category: formData.category,
          issuing_authority: formData.issuing_authority,
          issue_date: formData.issue_date,
          description: formData.description,
          file_url: fileUrl,
          file_name: fileName,
          uploaded_by: user?.id
        }
      ]);

      if (error) throw error;

      setIsModalOpen(false);
      await fetchDocuments();
    } catch (err) {
      console.error('Lỗi khi lưu văn bản:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deletingDoc) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from('official_documents')
        .delete()
        .eq('id', deletingDoc.id);

      if (error) throw error;
      setDeletingDoc(null);
      await fetchDocuments();
    } catch (err) {
      console.error('Lỗi khi xóa văn bản:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.issuing_authority?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-brand-600 mb-1">
            <FileText className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Hành Chính & Chỉ Đạo</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Văn Bản Cấp Trên & Chỉ Thị Ngành
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lưu trữ, tra cứu các Chỉ thị, Nghị quyết, Công văn chỉ đạo từ Sở, Phòng GD&ĐT và BGH
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Văn Bản Mới</span>
          </button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm theo tên văn bản, số hiệu hoặc cơ quan ban hành..."
          className="w-full sm:max-w-md"
        />

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tất cả ({documents.length})
          </button>
          {DOCUMENT_CATEGORIES.map((cat) => {
            const count = documents.filter((d) => d.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Document Table / List */}
      {loading ? (
        <LoadingSpinner text="Đang tải danh mục văn bản..." />
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          title="Không tìm thấy văn bản"
          description="Chưa có văn bản nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm."
          actionText={canManage ? 'Thêm văn bản mới' : undefined}
          onAction={canManage ? handleOpenAddModal : undefined}
          icon={FileText}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">Số Hiệu / Trích Yếu</th>
                  <th className="py-3.5 px-4">Loại Văn Bản</th>
                  <th className="py-3.5 px-4">Cơ Quan Ban Hành</th>
                  <th className="py-3.5 px-4">Ngày Ban Hành</th>
                  <th className="py-3.5 px-4 text-right">Tệp & Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 max-w-md">
                      <div className="space-y-1">
                        {doc.document_number && (
                          <div className="inline-flex items-center space-x-1 font-mono font-bold text-brand-700 text-[11px] bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                            <Hash className="w-3 h-3" />
                            <span>{doc.document_number}</span>
                          </div>
                        )}
                        <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">
                          {doc.title}
                        </h4>
                        {doc.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1">{doc.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <Badge variant="primary">{doc.category}</Badge>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-slate-600 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.issuing_authority}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(doc.issue_date)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        {doc.file_url ? (
                          <>
                            <button
                              onClick={() => {
                                setPreviewUrl(doc.file_url);
                                setPreviewTitle(doc.title);
                              }}
                              className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg border border-brand-200 transition-colors flex items-center space-x-1 text-xs font-semibold px-2.5"
                              title="Xem trực tiếp"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem</span>
                            </button>
                            <a
                              href={doc.file_url}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                              title="Tải về máy"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Không có file đính kèm</span>
                        )}

                        {canManage && (
                          <button
                            onClick={() => setDeletingDoc(doc)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                            title="Xóa văn bản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Thêm Văn Bản */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm Văn Bản Cấp Trên Mới"
      >
        <form onSubmit={handleSaveDocument} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Trích Yếu / Tiêu Đề Văn Bản <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Quyết định ban hành kế hoạch thời gian năm học 2025-2026..."
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số Hiệu Văn Bản</label>
              <input
                type="text"
                value={formData.document_number}
                onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                placeholder="VD: 123/QĐ-UBND"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Loại Văn Bản</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cơ Quan Ban Hành</label>
              <select
                value={formData.issuing_authority}
                onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {ISSUING_AUTHORITIES.map((auth) => (
                  <option key={auth} value={auth}>
                    {auth}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày Ban Hành</label>
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tệp Đính Kèm (PDF / Word)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi Chú / Tóm Tắt Nội Dung</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ghi chú nội dung trọng tâm..."
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
              {saving ? 'Đang lưu...' : 'Lưu Văn Bản'}
            </button>
          </div>
        </form>
      </Modal>

      {/* PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        fileUrl={previewUrl}
        title={previewTitle}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingDoc}
        onClose={() => setDeletingDoc(null)}
        onConfirm={handleDeleteDocument}
        title="Xóa văn bản"
        message={`Bạn có chắc chắn muốn xóa văn bản "${deletingDoc?.title}" không?`}
        isLoading={saving}
      />
    </div>
  );
}
