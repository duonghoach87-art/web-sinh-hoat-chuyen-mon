import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { uploadFileToSupabase } from '../../utils/fileUploader';
import {
  Sliders,
  Building,
  School,
  Calendar,
  User,
  Phone,
  MapPin,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, loading } = useSettings();
  const { canManage } = useAuth();

  const [formData, setFormData] = useState({
    department_authority: settings?.department_authority || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO',
    school_name: settings?.school_name || 'TRƯỜNG THCS CHU VĂN AN',
    department_name: settings?.department_name || 'TỔ KHOA HỌC TỰ NHIÊN',
    school_year: settings?.school_year || '2025-2026',
    active_term: settings?.active_term || 'Học kỳ 1',
    principal_name: settings?.principal_name || 'Thầy Nguyễn Văn Quản (Hiệu trưởng)',
    head_teacher_name: settings?.head_teacher_name || 'Thầy Dương Văn Hoạch (Tổ trưởng KHTN)',
    address: settings?.address || 'Số 123 Đường Giáo Dục, Quận/Huyện...',
    phone_number: settings?.phone_number || '024.3838.xxxx',
    motto: settings?.motto || 'Đoàn kết - Sáng tạo - Đổi mới phương pháp dạy học',
    logo_url: settings?.logo_url || ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canManage) {
      alert('Chỉ Ban Giám Hiệu hoặc Tổ Trưởng mới có quyền thay đổi thông tin hệ thống.');
      return;
    }

    try {
      setSaving(true);
      setSavedSuccess(false);
      let logoUrl = formData.logo_url;

      if (logoFile) {
        const uploadRes = await uploadFileToSupabase(logoFile, 'khtn-avatars', 'school-logo');
        logoUrl = uploadRes.publicUrl;
      }

      await updateSettings({
        ...formData,
        logo_url: logoUrl
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Lỗi lưu cài đặt:', err);
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-brand-600 mb-1">
            <Sliders className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Cấu Hình Toàn Hệ Thống</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Thông Tin Trường & Tổ Khoa Học Tự Nhiên
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cập nhật tên trường, hiệu trưởng, tổ trưởng và năm học áp dụng đồng bộ cho Header, Footer và các mẫu Báo cáo in ấn
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">Đã lưu và đồng bộ toàn bộ cài đặt trường học thành công!</span>
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Nhóm 1: Cơ Quan & Đơn Vị */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-2">
              <Building className="w-4 h-4 text-brand-600" />
              <span>1. Cơ Quan Chủ Quản & Tên Trường</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cơ Quan Cấp Trên (Phòng/Sở GD&ĐT)
                </label>
                <input
                  type="text"
                  name="department_authority"
                  value={formData.department_authority}
                  onChange={handleChange}
                  placeholder="PHÒNG GIÁO DỤC VÀ ĐÀO TẠO..."
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Trường THCS
                </label>
                <input
                  type="text"
                  name="school_name"
                  value={formData.school_name}
                  onChange={handleChange}
                  placeholder="TRƯỜNG THCS CHU VĂN AN"
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Tổ Chuyên Môn
                </label>
                <input
                  type="text"
                  name="department_name"
                  value={formData.department_name}
                  onChange={handleChange}
                  placeholder="TỔ KHOA HỌC TỰ NHIÊN"
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Năm Học & Học Kỳ Hoạt Động
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="school_year"
                    value={formData.school_year}
                    onChange={handleChange}
                    placeholder="2025-2026"
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white"
                  />
                  <select
                    name="active_term"
                    value={formData.active_term}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white"
                  >
                    <option value="Học kỳ 1">Học kỳ 1</option>
                    <option value="Học kỳ 2">Học kỳ 2</option>
                    <option value="Cả năm học">Cả năm học</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Nhóm 2: Lãnh Đạo & Nhân Sự Chịu Trách Nhiệm */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>2. Đại Diện Lãnh Đạo & Ký Duyệt Báo Cáo</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ Tên Hiệu Trưởng / BGH
                </label>
                <input
                  type="text"
                  name="principal_name"
                  value={formData.principal_name}
                  onChange={handleChange}
                  placeholder="Thầy Nguyễn Văn A (Hiệu trưởng)"
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ Tên Tổ Trưởng KHTN
                </label>
                <input
                  type="text"
                  name="head_teacher_name"
                  value={formData.head_teacher_name}
                  onChange={handleChange}
                  placeholder="Thầy Dương Văn Hoạch (Tổ trưởng)"
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Nhóm 3: Thông Tin Liên Hệ & Biểu Trưng */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>3. Địa Chỉ, Liên Hệ & Logo Trường</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Địa Chỉ Trường</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Số 123 Đường Giáo Dục, Quận/Huyện..."
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="024.3838.xxxx"
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Khẩu Hiệu / Phương Châm Hành Động</label>
              <input
                type="text"
                name="motto"
                value={formData.motto}
                onChange={handleChange}
                placeholder="Đoàn kết - Sáng tạo - Đổi mới phương pháp dạy học"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Logo Biểu Trưng Trường (Tùy chọn)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/25 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang lưu cấu hình...' : 'Lưu Thay Đổi Cài Đặt'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
