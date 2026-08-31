import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, DEPARTMENT_SUBJECTS, KHTN_SUB_SPECIALTIES } from '../../lib/constants';
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
  UserCheck,
  ChevronDown,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export default function MembersPage() {
  const { canManage, role: userRole, user: currentAuthUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [khtnDropdownOpen, setKhtnDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Modal State Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  // State xóa giáo viên
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [mainSubject, setMainSubject] = useState('Khoa học Tự nhiên');
  const [khtnSubSpecialty, setKhtnSubSpecialty] = useState('Khoa học Tự nhiên');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    specialty: 'Khoa học Tự nhiên',
    duties: 'Giáo viên giảng dạy',
    role: 'teacher',
    phone: '',
    is_active: true
  });

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setKhtnDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setMainSubject('Khoa học Tự nhiên');
    setKhtnSubSpecialty('Khoa học Tự nhiên');
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
    const spec = member.specialty || 'Khoa học Tự nhiên';
    if (['Khoa học Tự nhiên', 'Vật lý', 'Hóa học', 'Sinh học'].includes(spec)) {
      setMainSubject('Khoa học Tự nhiên');
      setKhtnSubSpecialty(spec);
    } else {
      setMainSubject(spec);
      setKhtnSubSpecialty('Khoa học Tự nhiên');
    }

    setFormData({
      full_name: member.full_name || '',
      email: member.email || '',
      specialty: spec,
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

      // Xác định chuyên môn cuối cùng
      const finalSpecialty = mainSubject === 'Khoa học Tự nhiên' ? khtnSubSpecialty : mainSubject;

      if (editingMember) {
        // Cập nhật
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name.trim(),
            specialty: finalSpecialty,
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
              full_name: formData.full_name.trim(),
              specialty: finalSpecialty,
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

  // Xác nhận và xóa giáo viên (Dành riêng cho Admin)
  const handleOpenDeleteConfirm = (member) => {
    if (member.id === currentAuthUser?.id) {
      alert('Không thể tự xóa tài khoản quản trị viên đang đăng nhập.');
      return;
    }
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!memberToDelete) return;
    try {
      setDeleting(true);
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', memberToDelete.id);

      if (error) throw error;

      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
      await fetchMembers();
    } catch (err) {
      console.error('Lỗi khi xóa giáo viên:', err);
      alert(`Không thể xóa giáo viên: ${err.message}`);
    } finally {
      setDeleting(false);
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

  // Đếm số lượng thành viên KHTN
  const khtnMembers = members.filter((m) =>
    ['Khoa học Tự nhiên', 'Vật lý', 'Hóa học', 'Sinh học'].includes(m.specialty)
  );

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.duties?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesSpecialty = true;
    if (selectedSpecialty === 'ALL') {
      matchesSpecialty = true;
    } else if (selectedSpecialty === 'KHTN_ALL') {
      matchesSpecialty = ['Khoa học Tự nhiên', 'Vật lý', 'Hóa học', 'Sinh học'].includes(m.specialty);
    } else {
      matchesSpecialty = m.specialty === selectedSpecialty;
    }

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
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm theo họ tên, email hoặc nhiệm vụ..."
          className="w-full md:max-w-xs"
        />

        {/* Lọc theo chuyên môn: Môn Khoa Học Tự Nhiên có Menu Dropdown cho Vật Lý, Hóa Học, Sinh Học */}
        <div className="flex items-center space-x-2 overflow-x-visible w-full md:w-auto pb-1 md:pb-0">
          {/* Nút Tất cả */}
          <button
            onClick={() => setSelectedSpecialty('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedSpecialty === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tất cả ({members.length})
          </button>

          {/* Menu Dropdown Khoa Học Tự Nhiên (Vật Lý, Hóa Học, Sinh Học) */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setKhtnDropdownOpen(!khtnDropdownOpen)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                ['KHTN_ALL', 'Khoa học Tự nhiên', 'Vật lý', 'Hóa học', 'Sinh học'].includes(selectedSpecialty)
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>
                {selectedSpecialty === 'Vật lý'
                  ? 'KHTN • Vật lý'
                  : selectedSpecialty === 'Hóa học'
                  ? 'KHTN • Hóa học'
                  : selectedSpecialty === 'Sinh học'
                  ? 'KHTN • Sinh học'
                  : `Khoa học Tự nhiên (${khtnMembers.length})`}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${khtnDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {khtnDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Phân Môn Khoa Học Tự Nhiên
                </div>
                <button
                  onClick={() => {
                    setSelectedSpecialty('KHTN_ALL');
                    setKhtnDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-brand-50 flex items-center justify-between ${
                    selectedSpecialty === 'KHTN_ALL' ? 'text-brand-700 font-bold bg-brand-50/60' : 'text-slate-700'
                  }`}
                >
                  <span>Tất cả môn KHTN</span>
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full">{khtnMembers.length}</span>
                </button>
                {KHTN_SUB_SPECIALTIES.map((sub) => {
                  const count = members.filter((m) => m.specialty === sub.value).length;
                  return (
                    <button
                      key={sub.value}
                      onClick={() => {
                        setSelectedSpecialty(sub.value);
                        setKhtnDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-brand-50 flex items-center justify-between ${
                        selectedSpecialty === sub.value ? 'text-brand-700 font-bold bg-brand-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{sub.label}</span>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Các môn khác trong tổ KHTN */}
          {['Toán học', 'Tin học', 'Công nghệ'].map((spec) => {
            const count = members.filter((m) => m.specialty === spec).length;
            return (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedSpecialty === spec
                    ? 'bg-slate-800 text-white shadow-xs'
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
                      <span>Chuyên môn: <strong>{member.specialty || 'Khoa học Tự nhiên'}</strong></span>
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
                            ? 'text-slate-400 hover:text-amber-600 border-slate-200 hover:bg-amber-50'
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

                      {/* Nút Xóa Thành Viên - Dành Riêng Cho Quản Trị Viên (Admin) */}
                      {userRole === 'admin' && (
                        <button
                          onClick={() => handleOpenDeleteConfirm(member)}
                          className="p-1.5 text-rose-500 hover:text-white rounded-lg border border-rose-200 hover:bg-rose-600 transition-colors"
                          title="Xóa giáo viên khỏi tổ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Thêm/Sửa Giáo Viên (Tích Hợp Chọn Phân Môn KHTN) */}
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
              placeholder="VD: Cô Nguyễn Thị Hảo"
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
              placeholder="giaovien@khtn.edu.vn"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-slate-100"
              required
            />
          </div>

          {/* Chọn Môn Chính & Phân Môn KHTN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Môn Giảng Dạy</label>
              <select
                value={mainSubject}
                onChange={(e) => setMainSubject(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {DEPARTMENT_SUBJECTS.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            {/* Nếu là môn Khoa Học Tự Nhiên -> Hiện Dropdown chọn Phân môn: Vật Lý, Hóa Học, Sinh Học */}
            {mainSubject === 'Khoa học Tự nhiên' ? (
              <div className="animate-in fade-in">
                <label className="block text-xs font-bold text-brand-700 mb-1 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Phân Môn KHTN Chuyên Sâu</span>
                </label>
                <select
                  value={khtnSubSpecialty}
                  onChange={(e) => setKhtnSubSpecialty(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-50/50 border border-brand-300 rounded-xl text-xs font-bold text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {KHTN_SUB_SPECIALTIES.map((sub) => (
                    <option key={sub.value} value={sub.value}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nhiệm Vụ / Chức Vụ</label>
                <input
                  type="text"
                  value={formData.duties}
                  onChange={(e) => setFormData({ ...formData, duties: e.target.value })}
                  placeholder="VD: Giáo viên bộ môn"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            )}
          </div>

          {mainSubject === 'Khoa học Tự nhiên' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nhiệm Vụ / Chức Vụ</label>
              <input
                type="text"
                value={formData.duties}
                onChange={(e) => setFormData({ ...formData, duties: e.target.value })}
                placeholder="VD: Tổ phó / Thư ký / Giáo viên bộ môn"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          )}

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

      {/* Modal Xác Nhận Xóa Giáo Viên Dành Cho Admin */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMemberToDelete(null);
        }}
        onConfirm={handleExecuteDelete}
        title="Xác Nhận Xóa Giáo Viên Khỏi Tổ"
        message={`Bạn có chắc chắn muốn xóa tài khoản của giáo viên "${memberToDelete?.full_name}" (${memberToDelete?.email}) khỏi danh sách Tổ Khoa học Tự nhiên không? Hành động này sẽ gỡ bỏ dữ liệu tài khoản.`}
        confirmText={deleting ? 'Đang xóa...' : 'Đồng ý xóa'}
        type="danger"
      />
    </div>
  );
}
