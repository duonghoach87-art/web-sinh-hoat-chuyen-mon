import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  FileSignature,
  Stamp
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
    deputy_head_name: settings?.deputy_head_name || 'Cô Nguyễn Thị Hảo (Tổ phó KHTN)',
    address: settings?.address || 'Số 123 Đường Giáo Dục, Quận/Huyện...',
    phone_number: settings?.phone_number || '024.3838.xxxx',
    motto: settings?.motto || 'Đoàn kết - Sáng tạo - Đổi mới phương pháp dạy học',
    logo_url: settings?.logo_url || '',
    head_signature_url: settings?.head_signature_url || '',
    principal_signature_url: settings?.principal_signature_url || ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [headSigFile, setHeadSigFile] = useState(null);
  const [principalSigFile, setPrincipalSigFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        department_authority: settings.department_authority || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO',
        school_name: settings.school_name || 'TRƯỜNG THCS CHU VĂN AN',
        department_name: settings.department_name || 'TỔ KHOA HỌC TỰ NHIÊN',
        school_year: settings.school_year || '2025-2026',
        active_term: settings.active_term || 'Học kỳ 1',
        principal_name: settings.principal_name || 'Thầy Nguyễn Văn Quản (Hiệu trưởng)',
        head_teacher_name: settings.head_teacher_name || 'Thầy Dương Văn Hoạch (Tổ trưởng KHTN)',
        deputy_head_name: settings.deputy_head_name || 'Cô Nguyễn Thị Hảo (Tổ phó KHTN)',
        address: settings.address || 'Số 123 Đường Giáo Dục, Quận/Huyện...',
        phone_number: settings.phone_number || '024.3838.xxxx',
        motto: settings.motto || 'Đoàn kết - Sáng tạo - Đổi mới phương pháp dạy học',
        logo_url: settings.logo_url || '',
        head_signature_url: settings.head_signature_url || '',
        principal_signature_url: settings.principal_signature_url || ''
      });
    }
  }, [settings]);

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
      let headSigUrl = formData.head_signature_url;
      let principalSigUrl = formData.principal_signature_url;

      // 1. Tải ảnh logo nếu có
      if (logoFile) {
        const uploadRes = await uploadFileToSupabase(logoFile, 'khtn-avatars', 'school-logo');
        logoUrl = uploadRes.publicUrl;
      }

      // 2. Tải ảnh chữ ký Tổ trưởng
      if (headSigFile) {
        const uploadRes = await uploadFileToSupabase(headSigFile, 'khtn-avatars', 'signature-head');
        headSigUrl = uploadRes.publicUrl;
      }

      // 3. Tải ảnh chữ ký/dấu Hiệu trưởng
      if (principalSigFile) {
        const uploadRes = await uploadFileToSupabase(principalSigFile, 'khtn-avatars', 'signature-principal');
        principalSigUrl = uploadRes.publicUrl;
      }

      await updateSettings({
        ...formData,
        logo_url: logoUrl,
        head_signature_url: headSigUrl,
        principal_signature_url: principalSigUrl
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
            Thông Tin Trường, Tổ KHTN & Chữ Ký Điện Tử
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cập nhật tên trường, Hiệu trưởng, Tổ trưởng, Tổ phó và Chữ ký số tự động chèn vào các mẫu in báo cáo
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">Đã lưu và đồng bộ toàn bộ thông tin & chữ ký điện tử thành công!</span>
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

          {/* Nhóm 2: Lãnh Đạo Trường & Ban Điều Hành Tổ KHTN */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>2. Ban Giám Hiệu & Ban Điều Hành Tổ KHTN</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ Tên Hiệu Trưởng / BGH
                </label>
                <input
                  type="text"
                  name="principal_name"
                  value={formData.principal_name}
                  onChange={handleChange}
                  placeholder="Thầy Nguyễn Văn Quản (Hiệu trưởng)"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ Tên Tổ Phó KHTN
                </label>
                <input
                  type="text"
                  name="deputy_head_name"
                  value={formData.deputy_head_name}
                  onChange={handleChange}
                  placeholder="Cô Nguyễn Thị Hảo (Tổ phó)"
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Nhóm 3: Ký Tên Điện Tử & Con Dấu Số */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-2">
              <FileSignature className="w-4 h-4 text-brand-600" />
              <span>3. Chữ Ký Điện Tử & Con Dấu Đóng Trên Báo Cáo</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Chữ ký Tổ Trưởng */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <FileSignature className="w-4 h-4 text-brand-600" />
                    <span>Chữ Ký Điện Tử Tổ Trưởng</span>
                  </label>
                  {formData.head_signature_url && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                      Đã có chữ ký
                    </span>
                  )}
                </div>

                {formData.head_signature_url && (
                  <div className="h-20 bg-white border border-dashed border-slate-300 rounded-xl flex items-center justify-center p-2">
                    <img
                      src={formData.head_signature_url}
                      alt="Chữ ký Tổ Trưởng"
                      className="max-h-full object-contain"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={(e) => setHeadSigFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
                <p className="text-[10px] text-slate-400">Khuyên dùng ảnh định dạng PNG nền trong suốt</p>
              </div>

              {/* Chữ ký / Dấu Hiệu Trưởng */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Stamp className="w-4 h-4 text-rose-600" />
                    <span>Chữ Ký / Dấu Đỏ Ban Giám Hiệu</span>
                  </label>
                  {formData.principal_signature_url && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                      Đã có dấu/chữ ký
                    </span>
                  )}
                </div>

                {formData.principal_signature_url && (
                  <div className="h-20 bg-white border border-dashed border-slate-300 rounded-xl flex items-center justify-center p-2">
                    <img
                      src={formData.principal_signature_url}
                      alt="Chữ ký Hiệu Trưởng"
                      className="max-h-full object-contain"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={(e) => setPrincipalSigFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                />
                <p className="text-[10px] text-slate-400">Ảnh chữ ký kèm con dấu đỏ của nhà trường (tùy chọn)</p>
              </div>
            </div>
          </div>

          {/* Nhóm 4: Thông Tin Liên Hệ & Biểu Trưng */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>4. Địa Chỉ, Liên Hệ & Logo Trường</span>
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
