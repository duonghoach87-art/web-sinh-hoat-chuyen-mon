import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import {
  Atom,
  Play,
  ExternalLink,
  Plus,
  Trash2,
  Maximize2,
  X,
  Sparkles,
  FlaskConical,
  Dna,
  Zap,
  Calculator
} from 'lucide-react';

export default function VirtualLabsPage() {
  const { canManage } = useAuth();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  // Simulation Interactive Modal State
  const [activeLab, setActiveLab] = useState(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingLab, setDeletingLab] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'physics',
    grade_level: 6,
    link_url: '',
    iframe_code: ''
  });

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('virtual_labs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLabs(data || []);
    } catch (error) {
      console.error('Lỗi tải danh mục thí nghiệm ảo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      description: '',
      subject: 'physics',
      grade_level: 6,
      link_url: '',
      iframe_code: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveLab = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.link_url.trim()) return;

    try {
      setSaving(true);
      const newRecord = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        subject: formData.subject,
        grade_level: parseInt(formData.grade_level) || null,
        link_url: formData.link_url.trim(),
        iframe_code: formData.iframe_code.trim() || null
      };

      let { error } = await supabase.from('virtual_labs').insert([newRecord]);

      // Dự phòng nếu Supabase chưa mở constraint check cho môn toán ('math')
      if (
        error &&
        (error.message?.includes('virtual_labs_subject_check') ||
          error.code === '23514')
      ) {
        const fallbackRecord = {
          ...newRecord,
          subject: 'general',
          description: `[Môn Toán] ${newRecord.description}`.trim()
        };
        const retry = await supabase.from('virtual_labs').insert([fallbackRecord]);
        if (retry.error) throw retry.error;
        error = null;
      } else if (error) {
        throw error;
      }

      setIsModalOpen(false);
      await fetchLabs();
    } catch (err) {
      console.error('Lỗi khi lưu thí nghiệm ảo:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLab = async () => {
    if (!deletingLab) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from('virtual_labs')
        .delete()
        .eq('id', deletingLab.id);

      if (error) throw error;
      setDeletingLab(null);
      await fetchLabs();
    } catch (err) {
      console.error('Lỗi khi xóa thí nghiệm:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredLabs = labs.filter((lab) => {
    const matchesSearch =
      lab.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject =
      selectedSubject === 'ALL' || lab.subject === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  const getSubjectMeta = (subj) => {
    switch (subj) {
      case 'math':
        return { label: 'Toán Học', icon: Calculator, color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'physics':
        return { label: 'Vật Lý', icon: Zap, color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'chemistry':
        return { label: 'Hóa Học', icon: FlaskConical, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'biology':
        return { label: 'Sinh Học', icon: Dna, color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'Khoa Học Tự Nhiên', icon: Atom, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-brand-600 mb-1">
            <Atom className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Học Liệu Số & Thực Hành</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Thí Nghiệm Ảo & Mô Phỏng PhET KHTN
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thư viện mô phỏng thí nghiệm trực quan môn Vật lý, Hóa học, Sinh học trình chiếu trực tiếp trên lớp học
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thí Nghiệm Mới</span>
          </button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm theo tên thí nghiệm, mô phỏng..."
          className="w-full sm:max-w-md"
        />

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedSubject('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedSubject === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tất cả Môn ({labs.length})
          </button>
          <button
            onClick={() => setSelectedSubject('math')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedSubject === 'math'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Toán học
          </button>
          <button
            onClick={() => setSelectedSubject('physics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedSubject === 'physics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Vật lý
          </button>
          <button
            onClick={() => setSelectedSubject('chemistry')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedSubject === 'chemistry'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Hóa học
          </button>
          <button
            onClick={() => setSelectedSubject('biology')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedSubject === 'biology'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Sinh học
          </button>
        </div>
      </div>

      {/* Labs Card Grid */}
      {loading ? (
        <LoadingSpinner text="Đang tải danh mục thí nghiệm ảo PhET..." />
      ) : filteredLabs.length === 0 ? (
        <EmptyState
          title="Chưa có thí nghiệm nào"
          description="Hiện chưa có mô phỏng thí nghiệm nào phù hợp."
          actionText={canManage ? 'Thêm thí nghiệm mới' : undefined}
          onAction={canManage ? handleOpenAddModal : undefined}
          icon={Atom}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map((lab) => {
            const meta = getSubjectMeta(lab.subject);
            const SubjIcon = meta.icon;

            return (
              <div
                key={lab.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Visual Header */}
                  <div className="h-40 bg-gradient-to-br from-slate-900 via-navy-900 to-brand-950 p-5 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md bg-white/20 text-white border-white/20`}>
                        <SubjIcon className="w-3.5 h-3.5 mr-1" />
                        <span>{meta.label}</span>
                      </span>
                      {lab.grade_level && (
                        <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md">
                          Khối {lab.grade_level}
                        </span>
                      )}
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-base font-bold text-white leading-snug group-hover:text-brand-300 transition-colors">
                        {lab.title}
                      </h3>
                    </div>

                    <Atom className="w-36 h-36 text-white/5 absolute -right-6 -bottom-6 pointer-events-none group-hover:rotate-45 transition-transform duration-700" />
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-2">
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {lab.description || 'Mô phỏng thí nghiệm tương tác trực quan phục vụ bài học Khoa học Tự nhiên THCS.'}
                    </p>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => setActiveLab(lab)}
                    className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center justify-center space-x-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Thực Hành / Trình Chiếu</span>
                  </button>

                  <a
                    href={lab.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                    title="Mở trong tab mới"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {canManage && (
                    <button
                      onClick={() => setDeletingLab(lab)}
                      className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
                      title="Xóa thí nghiệm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simulator Modal (Interactive Fullscreen Player) */}
      {activeLab && (
        <div className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-slate-950/90 backdrop-blur-md">
          {/* Top Bar */}
          <div className="h-14 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center space-x-3">
              <Atom className="w-5 h-5 text-brand-400" />
              <span className="font-bold text-sm truncate">{activeLab.title}</span>
            </div>

            <div className="flex items-center space-x-3">
              <a
                href={activeLab.link_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mở ngoài</span>
              </a>
              <button
                onClick={() => setActiveLab(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* iFrame Container */}
          <div className="flex-1 bg-black w-full h-full relative">
            <iframe
              src={activeLab.link_url}
              className="w-full h-full border-0"
              title={activeLab.title}
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Modal Thêm Thí Nghiệm */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm Thí Nghiệm Ảo / Mô Phỏng Mới"
      >
        <form onSubmit={handleSaveLab} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên Thí Nghiệm / Mô Phỏng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Mô phỏng PhET: Định luật Ôm và Mạch điện"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Môn</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="math">Toán học</option>
                <option value="physics">Vật lý</option>
                <option value="chemistry">Hóa học</option>
                <option value="biology">Sinh học</option>
                <option value="general">Khoa học Tự nhiên chung</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Khối Lớp Phù Hợp</label>
              <select
                value={formData.grade_level}
                onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="6">Khối 6</option>
                <option value="7">Khối 7</option>
                <option value="8">Khối 8</option>
                <option value="9">Khối 9</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Đường Dẫn Trực Tiếp (URL Mô Phỏng PhET) <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              placeholder="https://phet.colorado.edu/sims/html/.../latest/..._all.html"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô Tả & Hướng Dẫn Thực Hiện</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả mục tiêu bài học, các biến số tương tác trong thí nghiệm..."
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
              {saving ? 'Đang lưu...' : 'Lưu Thí Nghiệm'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingLab}
        onClose={() => setDeletingLab(null)}
        onConfirm={handleDeleteLab}
        title="Xóa thí nghiệm ảo"
        message={`Bạn có chắc chắn muốn xóa thí nghiệm "${deletingLab?.title}" không?`}
        isLoading={saving}
      />
    </div>
  );
}
