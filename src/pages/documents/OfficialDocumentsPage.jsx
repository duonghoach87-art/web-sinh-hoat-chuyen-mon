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
  FileCheck,
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';

export default function OfficialDocumentsPage() {
  const { canManage, role, user } = useAuth();
  const isAdmin = role === 'admin';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Preview & Delete State
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [viewingDoc, setViewingDoc] = useState(null); // Modal xem chi tiết văn bản
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
        .select('*')
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
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
      }

      const { error } = await supabase.from('official_documents').insert([
        {
          title: formData.title.trim(),
          document_number: formData.document_number.trim(),
          category: formData.category,
          issuing_authority: formData.issuing_authority,
          issue_date: formData.issue_date,
          description: formData.description.trim(),
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
          uploaded_by: user?.id
        }
      ]);

      if (error) throw error;

      setIsModalOpen(false);
      await fetchDocuments();
    } catch (err) {
      console.error('Lỗi khi lưu văn bản:', err);
      alert(`Không thể lưu văn bản: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deletingDoc) return;
    if (!isAdmin) {
      alert('Chỉ Quản trị viên (Admin - Thầy Hoạch) mới có quyền xóa văn bản này.');
      return;
    }

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

  const handleOpenDocViewer = (doc) => {
    if (doc.file_url) {
      setPreviewUrl(doc.file_url);
      setPreviewTitle(`${doc.document_number ? doc.document_number + ' - ' : ''}${doc.title}`);
    } else {
      setViewingDoc(doc);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const term = (searchTerm || '').toLowerCase().trim();
    const title = (doc.title || '').toLowerCase();
    const number = (doc.document_number || '').toLowerCase();
    const authority = (doc.issuing_authority || '').toLowerCase();

    const matchesSearch =
      !term ||
      title.includes(term) ||
      number.includes(term) ||
      authority.includes(term);

    const matchesCategory =
      selectedCategory === 'ALL' || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-brand-600 mb-1">
            <FileText className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Hành Chính & Chỉ Đạo
            </span>
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

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm theo tên văn bản, số hiệu hoặc cơ quan ban hành..."
          className="w-full md:max-w-md"
        />

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tất cả ({documents.length})
          </button>
          {DOCUMENT_CATEGORIES.map((cat) => {
            const count = documents.filter((d) => d.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
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

      {/* Table Danh Sách Văn Bản */}
      {loading ? (
        <LoadingSpinner text="Đang tải danh mục văn bản..." />
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          title="Không tìm thấy văn bản nào"
          description="Chưa có văn bản phù hợp với từ khóa tìm kiếm hoặc danh mục đã chọn."
          actionText={canManage ? 'Thêm văn bản mới' : undefined}
          onAction={canManage ? handleOpenAddModal : undefined}
          icon={FileText}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Số Hiệu / Trích Yếu</th>
                  <th className="py-3.5 px-4">Loại Văn Bản</th>
                  <th className="py-3.5 px-4">Cơ Quan Ban Hành</th>
                  <th className="py-3.5 px-4">Ngày Ban Hành</th>
                  <th className="py-3.5 px-4 text-right">Tệp & Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                    onClick={() => handleOpenDocViewer(doc)}
                  >
                    <td className="py-4 px-4 max-w-md">
                      <div className="space-y-1">
                        {doc.document_number && (
                          <div className="inline-flex items-center space-x-1 font-mono font-bold text-brand-700 text-[11px] bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                            <Hash className="w-3 h-3" />
                            <span>{doc.document_number}</span>
                          </div>
                        )}
                        <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 hover:text-brand-600 transition-colors">
                          {doc.title}
                        </h4>
                        {doc.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {doc.description}
                          </p>
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
                    <td
                      className="py-4 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end space-x-2">
                        {/* NÚT CON MẮT XEM TÀI LIỆU (LUÔN HIỂN THỊ CHO TẤT CẢ GIÁO VIÊN) */}
                        <button
                          onClick={() => handleOpenDocViewer(doc)}
                          className="p-1.5 text-brand-600 hover:text-white bg-brand-50 hover:bg-brand-600 rounded-lg border border-brand-200 hover:border-brand-600 transition-all flex items-center space-x-1.5 text-xs font-bold px-3 shadow-2xs"
                          title="Xem chi tiết và tài liệu văn bản"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem</span>
                        </button>

                        {/* Nút Tải về máy nếu có file đính kèm */}
                        {doc.file_url && (
                          <a
                            href={doc.file_url}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors flex items-center space-x-1 px-2.5 font-semibold text-xs"
                            title="Tải tệp văn bản về máy"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Tải về</span>
                          </a>
                        )}

                        {/* NÚT XÓA - DÀNH RIÊNG CHO QUẢN TRỊ VIÊN (ADMIN - THẦY HOẠCH), GIÁO VIÊN KHÔNG ĐƯỢC XÓA */}
                        {isAdmin && (
                          <button
                            onClick={() => setDeletingDoc(doc)}
                            className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg border border-rose-200 hover:border-rose-600 transition-colors shadow-2xs"
                            title="Xóa văn bản (Quyền Admin)"
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

      {/* Modal Thêm Văn Bản Mới */}
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
              placeholder="VD: Quyết định ban hành kế hoạch thời gian năm học 2026-2027..."
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Tệp Đính Kèm (PDF / Word / Ảnh)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
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

      {/* Modal Xem Chi Tiết Văn Bản (Khi chưa có file đính kèm hoặc xem tóm tắt) */}
      {viewingDoc && (
        <Modal
          isOpen={!!viewingDoc}
          onClose={() => setViewingDoc(null)}
          title="Chi Tiết Văn Bản Chỉ Đạo"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-brand-50/70 border border-brand-200 rounded-2xl space-y-2">
              {viewingDoc.document_number && (
                <div className="inline-flex items-center space-x-1 font-mono font-bold text-brand-800 bg-white px-2.5 py-0.5 rounded-md border border-brand-200">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Số: {viewingDoc.document_number}</span>
                </div>
              )}
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {viewingDoc.title}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Loại Văn Bản</span>
                <span className="font-bold text-slate-800">{viewingDoc.category}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Cơ Quan Ban Hành</span>
                <span className="font-bold text-slate-800">{viewingDoc.issuing_authority}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Ngày Ban Hành</span>
              <span className="font-bold text-brand-700">{formatDate(viewingDoc.issue_date)}</span>
            </div>

            {viewingDoc.description ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Nội Dung Tóm Tắt / Ghi Chú</span>
                <p className="text-slate-700 leading-relaxed">{viewingDoc.description}</p>
              </div>
            ) : null}

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center space-x-2 text-amber-800">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Văn bản này hiện chưa đính kèm tệp số hóa (.pdf / .docx). Quý thầy cô xem thông tin trích yếu ở trên.</span>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Xem Trực Tiếp Tệp PDF / Ảnh */}
      <PdfViewerModal
        isOpen={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        fileUrl={previewUrl}
        title={previewTitle}
      />

      {/* Modal Xác Nhận Xóa Văn Bản (Chỉ dành cho Admin) */}
      <ConfirmModal
        isOpen={!!deletingDoc}
        onClose={() => setDeletingDoc(null)}
        onConfirm={handleDeleteDocument}
        title="Xóa Văn Bản Cấp Trên"
        message={`Bạn có chắc chắn muốn xóa văn bản "${deletingDoc?.title}" khỏi hệ thống không? Hành động này dành riêng cho Quản trị viên (Admin - Thầy Hoạch).`}
        isLoading={saving}
        type="danger"
      />
    </div>
  );
}
