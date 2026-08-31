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
  School
} from 'lucide-react';

export default function IntroductionPage() {
  const dutiesList = [
    {
      title: 'Xây dựng kế hoạch giáo dục của tổ chuyên môn',
      desc: 'Chủ động xây dựng và thực hiện kế hoạch giáo dục của tổ theo chương trình môn học Khoa học Tự nhiên cấp THCS, định hướng phát triển phẩm chất và năng lực học sinh.'
    },
    {
      title: 'Đổi mới phương pháp dạy học và kiểm tra đánh giá',
      desc: 'Thực hiện đổi mới phương pháp giảng dạy, ứng dụng công nghệ thông tin, khai thác hiệu quả thiết bị dạy học và thí nghiệm ảo mô phỏng.'
    },
    {
      title: 'Tổ chức sinh hoạt chuyên môn định kỳ',
      desc: 'Tổ chức sinh hoạt chuyên môn ít nhất 02 tuần một lần và sinh hoạt chuyên đề theo hướng nghiên cứu bài học (Lesson Study) nhằm nâng cao chất lượng dạy học.'
    },
    {
      title: 'Tham gia đánh giá, xếp loại giáo viên',
      desc: 'Thực hiện đánh giá, xếp loại giáo viên trong tổ theo chuẩn nghề nghiệp giáo viên cơ sở giáo dục phổ thông và quy chế thi đua của nhà trường.'
    },
    {
      title: 'Bồi dưỡng học sinh giỏi & Phụ đạo học sinh',
      desc: 'Phát hiện, bồi dưỡng học sinh có năng khiếu khoa học tự nhiên tham gia các kỳ thi chọn học sinh giỏi, nghiên cứu khoa học kỹ thuật (KHKT).'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Giới Thiệu */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-3 text-brand-600 mb-3">
          <School className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Quy Định & Pháp Lý &bullet; Thông tư 32/2020/TT-BGDĐT
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
          Chức Năng, Nhiệm Vụ & Tổ Chức Tổ Chuyên Môn Khoa Học Tự Nhiên
        </h1>
        <p className="text-slate-600 text-sm mt-3 leading-relaxed">
          Tổ Khoa học Tự nhiên là đơn vị chuyên môn trực thuộc Ban Giám hiệu trường THCS, quản lý và tổ chức thực hiện các hoạt động giáo dục thuộc các phân môn <strong>Vật lý, Hóa học, Sinh học</strong> và môn tích hợp <strong>Khoa học Tự nhiên</strong> (Khối 6, 7, 8, 9).
        </p>
      </div>

      {/* Căn Cứ Pháp Lý & Cơ Cấu Tổ Chức */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 text-slate-800 font-bold text-base">
            <div className="p-2 bg-brand-50 rounded-xl text-brand-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>Quy Định Tổ Chuyên Môn (Điều 14)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Căn cứ theo Điều 14 Điều lệ trường THCS, THPT và trường phổ thông có nhiều cấp học ban hành kèm theo <strong>Thông tư số 32/2020/TT-BGDĐT</strong> ngày 15/9/2020 của Bộ Giáo dục và Đào tạo:
          </p>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Tổ chuyên môn có tổ trưởng, từ 07 thành viên trở lên có 01 tổ phó.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Tổ chuyên môn sinh hoạt ít nhất 01 lần trong 02 tuần và có thể họp đột xuất.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Quản lý hồ sơ chuyên môn, kế hoạch bài dạy theo quy định của Bộ GD&ĐT.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 text-slate-800 font-bold text-base">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Target className="w-5 h-5" />
            </div>
            <span>Mục Tiêu & Trọng Tâm Chuyên Môn</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Thực hiện chương trình Giáo dục phổ thông 2018 (GDPT 2018), Tổ KHTN tập trung vào các định hướng:
          </p>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Phát triển tư duy logic, năng lực tìm hiểu thế giới tự nhiên và thực hành thí nghiệm.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Tăng cường hoạt động trải nghiệm, giáo dục STEM/STEAM liên môn.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Số hóa hồ sơ, biên bản sinh hoạt chuyên môn và quản lý đề kiểm tra trực tuyến.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Danh sách 5 Nhiệm vụ Trọng tâm của Tổ Chuyên Môn */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-brand-600" />
          <span>5 Nhiệm Vụ Cốt Lõi Của Tổ Chuyên Môn KHTN</span>
        </h3>

        <div className="space-y-4">
          {dutiesList.map((duty, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start space-x-4 hover:border-brand-300 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                0{index + 1}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">{duty.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{duty.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
