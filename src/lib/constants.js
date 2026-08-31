// CÁC HẰNG SỐ VÀ CẤU HÌNH HỆ THỐNG QUẢN LÝ TỔ CHUYÊN MÔN KHTN

export const ROLES = {
  ADMIN: 'admin',
  HEAD_TEACHER: 'head_teacher',
  TEACHER: 'teacher'
};

export const ROLE_LABELS = {
  admin: { label: 'Ban Giám Hiệu / Quản trị', color: 'bg-red-100 text-red-700 border-red-200' },
  head_teacher: { label: 'Tổ Trưởng / Tổ Phó', color: 'bg-brand-100 text-brand-700 border-brand-200' },
  teacher: { label: 'Giáo Viên Tổ KHTN', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
};

// CÁC MÔN HỌC CHÍNH TRONG TỔ KHOA HỌC TỰ NHIÊN (THCS)
export const DEPARTMENT_SUBJECTS = [
  'Khoa học Tự nhiên',
  'Toán học',
  'Tin học',
  'Công nghệ'
];

// CÁC PHÂN MÔN CHUYÊN SÂU TRONG MÔN KHOA HỌC TỰ NHIÊN
export const KHTN_SUB_SPECIALTIES = [
  { value: 'Khoa học Tự nhiên', label: 'Khoa học Tự nhiên (Chung)' },
  { value: 'Vật lý', label: 'Phân môn Vật lý' },
  { value: 'Hóa học', label: 'Phân môn Hóa học' },
  { value: 'Sinh học', label: 'Phân môn Sinh học' }
];

export const SPECIALTIES = [
  'Khoa học Tự nhiên',
  'Vật lý',
  'Hóa học',
  'Sinh học',
  'Toán học',
  'Tin học',
  'Công nghệ'
];

export const GRADE_LEVELS = [
  { value: 6, label: 'Khối 6' },
  { value: 7, label: 'Khối 7' },
  { value: 8, label: 'Khối 8' },
  { value: 9, label: 'Khối 9' }
];

export const DOCUMENT_CATEGORIES = [
  'Chỉ thị',
  'Nghị quyết',
  'Thông tư',
  'Quyết định',
  'Kế hoạch',
  'Công văn',
  'Hướng dẫn nhiệm vụ năm học',
  'Văn bản khác'
];

export const ISSUING_AUTHORITIES = [
  'Bộ Giáo dục & Đào tạo',
  'Sở Giáo dục & Đào tạo',
  'Phòng Văn hóa',
  'UBND xã Sì Lở Lầu',
  'Ban Giám hiệu Nhà trường',
  'Tổ Chuyên môn KHTN'
];

export const PLAN_TYPES = {
  yearly: { label: 'Kế hoạch Năm học', badge: 'bg-blue-100 text-blue-800' },
  term: { label: 'Kế hoạch Học kỳ', badge: 'bg-cyan-100 text-cyan-800' },
  monthly: { label: 'Kế hoạch Tháng', badge: 'bg-sky-100 text-sky-800' },
  weekly: { label: 'Kế hoạch Tuần', badge: 'bg-slate-100 text-slate-800' }
};

export const MEETING_TYPES = {
  regular: { label: 'Họp Tổ Định Kỳ', badge: 'bg-blue-100 text-blue-800' },
  lesson_study: { label: 'Nghiên Cứu Bài Học (Lesson Study)', badge: 'bg-emerald-100 text-emerald-800' },
  quality_improvement: { label: 'Chuyên Đề Nâng Cao Chất Lượng', badge: 'bg-amber-100 text-amber-800' }
};

export const EXAM_TYPES = {
  regular: { label: 'Thường xuyên', badge: 'bg-slate-100 text-slate-800 border-slate-200' },
  mid_term_1: { label: 'Giữa kì I', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  final_term_1: { label: 'Học kì I', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  mid_term_2: { label: 'Giữa kì II', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  final_term_2: { label: 'Học kì II', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  // Tương thích ngược
  mid_term: { label: 'Giữa kì I', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  final_term: { label: 'Học kì I', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
};

export const TEACHING_REG_TYPES = {
  thao_giang: { label: 'Thao giảng cấp Tổ', badge: 'bg-sky-100 text-sky-800' },
  chuyen_de: { label: 'Dạy Chuyên đề', badge: 'bg-indigo-100 text-indigo-800' },
  hoi_giang: { label: 'Hội giảng cấp Trường/Huyện', badge: 'bg-emerald-100 text-emerald-800' },
  du_gio: { label: 'Dự giờ đồng nghiệp', badge: 'bg-slate-100 text-slate-800' }
};

export const REGISTRATION_STATUS = {
  pending: { label: 'Chờ duyệt', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  approved: { label: 'Đã duyệt', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  rejected: { label: 'Từ chối / Yêu cầu đổi', badge: 'bg-rose-100 text-rose-800 border-rose-300' }
};

export const EMULATION_RANKS = ['Xuất sắc', 'Tốt', 'Khá', 'Đạt', 'Chưa đạt'];
