import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { SPECIALTIES, ROLE_LABELS } from '../../lib/constants';
import { uploadFileToSupabase } from '../../utils/fileUploader';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchBar from '../../components/common/SearchBar';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  BookOpen,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  UserCheck
} from 'lucide-react';

export default function MembersPage() {
  const { canManage, role: userRole } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    specialty: 'Khoa học Tự nhiên',
    duties: 'Giáo viên giảng dạy',
    role: 'teacher',
    phone: '',
    is_active: true
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true })
        .order('full_name', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách giáo viên:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      full_name: '',
      email: '',
      specialty: 'Khoa học Tự nhiên',
      duties: 'Giáo viên giảng dạy',
      role: 'teacher',
      phone: '',
      is_active: true
    });
    setAvatarFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    setFormData({
      full_name: member.full_name || '',
      email: member.email || '',
      specialty: member.specialty || 'Khoa học Tự nhiên',
      duties: member.duties || 'Giáo viên giảng dạy',
      role: member.role || 'teacher',
      phone: member.phone || '',
      is_active: member.is_active ?? true
    });
    setAvatarFile(null);
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) return;

    try {
      setSaving(true);
      let avatarUrl = editingMember?.avatar_url || null;

      if (avatarFile) {
        const uploadRes = await uploadFileToSupabase(avatarFile, 'khtn-avatars', 'profiles');
        avatarUrl = uploadRes.publicUrl;
      }

      if (editingMember) {
        // Cập nhật
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name.trim(),
            specialty: formData.specialty,
            duties: formData.duties,
            role: formData.role,
            phone: formData.phone,
            is_active: formData.is_active,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingMember.id);

        if (error) throw error;
      } else {
        // Thêm mới profile thủ công
        const newId = crypto.randomUUID();
        const { error } = await supabase
          .from('profiles')
          .insert([
            {
              id: newId,
              email: formData.email.trim(),
              full_name: formData.fullName.trim(),
              specialty: formData.specialty,
              duties: formData.duties,
              role: formData.role,
              phone: formData.phone,
              is_active: formData.is_active,
              avatar_url: avatarUrl
            }
          ]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      await fetchMembers();
    } catch (err) {
      console.error('Lỗi khi lưu thông tin giáo viên:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (member) => {
    if (!canManage) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !member.is_active })
        .eq('id', member.id);

      if (error) throw error;
      await fetchMembers();
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.duties?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === 'ALL' || m.specialty === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="space-y-6">
      {/* Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-brand-600 mb-1">
            <Users className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Nhân Sự & Đội Ngũ</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Danh Sách Giáo Viên Tổ Khoa Học Tự Nhiên
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng số: <strong>{members.length}</strong> giáo viên trong tổ chuyên môn
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Giáo Viên Mới</span>
          </button>
        )}
      </div>

      {/* Bộ Lọc & Tìm Kiếm */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm theo họ tên, email hoặc nhiệm vụ..."
          className="w-full sm:max-w-md"
        />

        {/* Lọc theo chuyên môn */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedSpecialty('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedSpecialty === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tất cả ({members.length})
          </button>
          {SPECIALTIES.map((spec) => {
            const count = members.filter((m) => m.specialty === spec).length;
            return (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  selectedSpecialty === spec
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {spec} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Danh Sách Giáo Viên */}
      {loading ? (
        <LoadingSpinner text="Đang tải danh sách giáo viên..." />
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          title="Không tìm thấy giáo viên"
          description="Chưa có dữ liệu giáo viên phù hợp với từ khóa hoặc bộ lọc chuyên môn."
          actionText={canManage ? 'Thêm giáo viên mới' : undefined}
          onAction={canManage ? handleOpenAddModal : undefined}
          icon={Users}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member) => {
            const roleInfo = ROLE_LABELS[member.role] || ROLE_LABELS.teacher;
            return (
              <div
                key={member.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                  !member.is_active ? 'opacity-60 border-slate-200 bg-slate-50/50' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-base shrink-0 overflow-hidden shadow-2xs">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          member.full_name?.charAt(0).toUpperCase() || 'GV'
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 hover:text-brand-600 transition-colors">
                          {member.full_name}
                        </h3>
                        <p className="text-xs text-brand-700 font-semibold mt-0.5">
                          {member.duties || 'Giáo viên'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${roleInfo.color}`}
                    >
                      {member.role === 'head_teacher' ? 'Tổ Trưởng' : member.role === 'admin' ? 'BGH/Admin' : 'Giáo Viên'}
                    </span>
                  </div>

                  <div className="space-y-2 py-3 border-t border-b border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Chuyên môn: <strong>{member.specialty || 'KHTN'}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    {member.is_active ? (
                      <span className="flex items-center space-x-1 text-emerald-600 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đang công tác</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-slate-400 font-semibold text-[11px]">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Đã luân chuyển</span>
                      </span>
                    )}
                  </div>

                  {canManage && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleToggleActive(member)}
                        title={member.is_active ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt lại'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          member.is_active
                            ? 'text-slate-400 hover:text-rose-600 border-slate-200 hover:bg-rose-50'
                            : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(member)}
                        className="p-1.5 text-slate-600 hover:text-brand-600 rounded-lg border border-slate-200 hover:bg-brand-50 transition-colors"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Thêm/Sửa Giáo Viên */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Chỉnh Sửa Thông Tin Giáo Viên' : 'Thêm Giáo Viên Mới Vào Tổ'}
      >
        <form onSubmit={handleSaveMember} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và Tên Giáo Viên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              disabled={!!editingMember}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-slate-100"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chuyên Môn</label>
              <select
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Nhiệm Vụ / Chức Vụ</label>
              <input
                type="text"
                value={formData.duties}
                onChange={(e) => setFormData({ ...formData, duties: e.target.value })}
                placeholder="VD: Tổ trưởng / Thư ký"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0987xxxxxx"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vai Trò Hệ Thống</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="teacher">Giáo viên (teacher)</option>
                <option value="head_teacher">Tổ trưởng/Tổ phó (head_teacher)</option>
                <option value="admin">BGH/Quản trị viên (admin)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ảnh Đại Diện</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="is_active_check"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
            />
            <label htmlFor="is_active_check" className="text-xs font-medium text-slate-700">
              Đang công tác tại Tổ chuyên môn
            </label>
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
              {saving ? 'Đang lưu...' : 'Lưu Thông Tin'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
