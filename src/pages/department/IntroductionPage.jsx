import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Users,
  Award,
  ShieldCheck,
  FileSpreadsheet,
  Target,
  Calendar,
  School,
  FileText,
  Laptop,
  Check,
  Sparkles,
  Layers,
  FileCheck2,
  FolderOpen
} from 'lucide-react';

export default function IntroductionPage() {
  // 7 Nhiệm vụ của Tổ chuyên môn chuẩn xác theo Điều 13 Thông tư 15/2026/TT-BGDĐT
  const dutiesList = [
    {
      number: '01',
      title: 'Tham gia xây dựng kế hoạch giáo dục của nhà trường',
      desc: 'Phối hợp cùng Ban Giám hiệu và các tổ chuyên môn khác trong việc xây dựng và hoàn thiện kế hoạch giáo dục tổng thể của nhà trường phù hợp với điều kiện thực tế.'
    },
    {
      number: '02',
      title: 'Thực hiện chủ động, linh hoạt kế hoạch giáo dục của tổ',
      desc: 'Tổ chức thực hiện chủ động và linh hoạt kế hoạch giáo dục của tổ chuyên môn theo đúng kế hoạch giáo dục của nhà trường đã được phê duyệt.'
    },
    {
      number: '03',
      title: 'Đề xuất lựa chọn học liệu, tài liệu, xuất bản phẩm tham khảo',
      desc: 'Nghiên cứu, đề xuất lựa chọn sách giáo khoa, học liệu số, thiết bị dạy học và xuất bản phẩm tham khảo phục vụ dạy học môn Khoa học Tự nhiên theo đúng quy định của Bộ GD&ĐT.'
    },
    {
      number: '04',
      title: 'Đề xuất phân công giáo viên giảng dạy & chủ nhiệm',
      desc: 'Tham mưu, đề xuất với Hiệu trưởng về phương án phân công giáo viên giảng dạy các phân môn (Vật lý, Hóa học, Sinh học) và phân công giáo viên làm công tác chủ nhiệm lớp.'
    },
    {
      number: '05',
      title: 'Tham gia đánh giá, xếp loại giáo viên theo Chuẩn nghề nghiệp',
      desc: 'Tham gia đánh giá, xếp loại giáo viên trong tổ theo chuẩn nghề nghiệp giáo viên cơ sở giáo dục phổ thông và quy chế thi đua khen thưởng của ngành.'
    },
    {
      number: '06',
      title: 'Tham gia bồi dưỡng chuyên môn, nghiệp vụ định kỳ',
      desc: 'Chủ động tham gia các chương trình tập huấn, bồi dưỡng chuyên môn nghiệp vụ theo kế hoạch của tổ và của nhà trường; đẩy mạnh sinh hoạt chuyên môn theo nghiên cứu bài học (Lesson Study) và giáo dục STEM/STEAM.'
    },
    {
      number: '07',
      title: 'Thực hiện các nhiệm vụ khác do Hiệu trưởng phân công',
      desc: 'Sẵn sàng tiếp nhận và triển khai các nhiệm vụ đột xuất, các công tác chuyên môn khác theo sự chỉ đạo và phân công của Ban Giám hiệu nhà trường.'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Giới Thiệu Cập Nhật Thông Tư 15/2026/TT-BGDĐT */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex items-center space-x-2 text-brand-600 mb-3">
          <School className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
            Căn Cứ Pháp Lý Mới • Thông tư số 15/2026/TT-BGDĐT
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Chức Năng, Nhiệm Vụ & Tổ Chức Hoạt Động Tổ Chuyên Môn Khoa Học Tự Nhiên
        </h1>
        <p className="text-slate-600 text-sm mt-3 leading-relaxed">
          Tổ Khoa học Tự nhiên là tổ chức chuyên môn trực thuộc Ban Giám hiệu trường phổ thông, quản lý và tổ chức thực hiện các hoạt động giáo dục thuộc các phân môn <strong>Vật lý, Hóa học, Sinh học</strong> và môn tích hợp <strong>Khoa học Tự nhiên</strong> (Khối 6, 7, 8, 9) theo chương trình GDPT 2018.
        </p>
      </div>

      {/* 2 Cột: Cơ Cấu Hoạt Động (Điều 13) & Mục Tiêu GDPT 2018 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Khối Cơ cấu & Sinh hoạt Điều 13 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 text-slate-800 font-bold text-base">
            <div className="p-2 bg-brand-50 rounded-xl text-brand-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>Tổ Chức & Nguyên Tắc Làm Việc (Điều 13)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Căn cứ <strong>Điều 13 Điều lệ trường phổ thông</strong> ban hành kèm theo <strong>Thông tư số 15/2026/TT-BGDĐT</strong> ngày 24/3/2026 của Bộ Giáo dục và Đào tạo:
          </p>
          <ul className="space-y-3 text-xs text-slate-700">
            <li className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Thành phần:</strong> Gồm các giáo viên giảng dạy môn/phân môn KHTN và viên chức làm công tác thiết bị, thí nghiệm.</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Cơ cấu lãnh đạo:</strong> Tổ chuyên môn có Tổ trưởng; nếu có từ 07 thành viên trở lên có 01 Tổ phó (bổ nhiệm theo quy định viên chức quản lý).</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Chế độ sinh hoạt:</strong> Chủ động, linh hoạt tổ chức sinh hoạt chuyên môn ít nhất <strong>01 lần trong 02 tuần</strong> và có thể họp đột xuất khi cần.</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Nguyên tắc hoạt động:</strong> Thực hiện theo nguyên tắc dân chủ, tôn trọng, chia sẻ, học tập và giúp đỡ lẫn nhau.</span>
            </li>
          </ul>
        </div>

        {/* Khối Mục tiêu & Trọng tâm GDPT 2018 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 text-slate-800 font-bold text-base">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Target className="w-5 h-5" />
            </div>
            <span>Mục Tiêu Chuyên Môn & Trọng Tâm</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Thực hiện định hướng đổi mới phương pháp dạy học theo Chương trình Giáo dục phổ thông 2018 (GDPT 2018):
          </p>
          <ul className="space-y-3 text-xs text-slate-700">
            <li className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Phát triển năng lực tìm hiểu thế giới tự nhiên, tư duy logic và kỹ năng thực hành thí nghiệm cho học sinh.</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Tăng cường hoạt động trải nghiệm thực tế, giáo dục STEM/STEAM liên môn và nghiên cứu KHKT.</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Khai thác hiệu quả phòng thực hành, đồ dùng dạy học và nền tảng thí nghiệm ảo mô phỏng (PhET).</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Đổi mới kiểm tra đánh giá thường xuyên, định kỳ theo ma trận và đặc tả chuẩn kiến thức kỹ năng.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Khối Điểm Mới: Tinh Giản Hồ Sơ Sổ Sách & Chuyển Đổi Số (Điều 21) */}
      <div className="bg-gradient-to-br from-brand-50/80 via-slate-50 to-white rounded-3xl border border-brand-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 text-brand-900 font-extrabold text-base">
          <div className="p-2 bg-brand-600 text-white rounded-xl">
            <Laptop className="w-5 h-5" />
          </div>
          <span>Quy Định Tinh Giản Hồ Sơ & Chuyển Đổi Số Giáo Dục (Điều 21 - TT 15)</span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">
          Thông tư số 15/2026/TT-BGDĐT đã tinh giản mạnh mẽ hệ thống sổ sách hành chính và ưu tiên tuyệt đối việc sử dụng <strong>Hồ sơ điện tử trực tuyến</strong>:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <div className="flex items-center space-x-1.5 text-brand-700 font-bold text-xs">
              <FolderOpen className="w-4 h-4" />
              <span>Hồ Sơ Của Tổ Chuyên Môn</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tinh giản chỉ còn <strong>01 loại sổ duy nhất là "Sổ ghi chép nội dung các hoạt động của tổ"</strong> (kế hoạch tổ được tích hợp vào kế hoạch chung của trường).
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-xs">
              <FileCheck2 className="w-4 h-4" />
              <span>Hồ Sơ Của Giáo Viên</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Chỉ gồm <strong>Kế hoạch bài dạy (Giáo án)</strong> và <strong>Sổ chủ nhiệm</strong> (đối với giáo viên được phân công làm công tác chủ nhiệm lớp).
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <div className="flex items-center space-x-1.5 text-indigo-700 font-bold text-xs">
              <Laptop className="w-4 h-4" />
              <span>Hồ Sơ Điện Tử Trực Tuyến</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Hệ thống website quản lý này đáp ứng yêu cầu số hóa, lưu trữ biên bản, đề thi, phiếu đánh giá điện tử có <strong>giá trị pháp lý tương đương hồ sơ giấy</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Danh sách 7 Nhiệm vụ Trọng tâm của Tổ Chuyên Môn (Điều 13) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-brand-600" />
          <span>7 Nhiệm Vụ Cốt Lõi Của Tổ Chuyên Môn (Theo Điều 13 - TT 15/2026/TT-BGDĐT)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dutiesList.map((duty, index) => (
            <div
              key={index}
              className={`p-4 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                index === 6
                  ? 'md:col-span-2 bg-gradient-to-r from-brand-50/60 to-slate-50 border-brand-200'
                  : 'bg-slate-50/70 border-slate-200/80 hover:border-brand-300 hover:bg-white'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {duty.number}
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800 leading-snug">{duty.title}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{duty.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
