import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
  FileText,
  FileCheck2,
  GraduationCap,
  Download,
  Eye,
  Calendar,
  Atom,
  ArrowRight
} from 'lucide-react';
import Badge from '../../components/common/Badge';

export default function SubjectTopicsPage() {
  const [activeTab, setActiveTab] = useState('lesson_study'); // 'lesson_study' | 'quality_improvement'

  const lessonStudySteps = [
    {
      step: 'Bước 1',
      title: 'Xác định mục tiêu & Thiết kế bài học minh họa',
      desc: 'Tổ chuyên môn cùng nghiên cứu chương trình môn học KHTN, lựa chọn bài học khó hoặc có nhiều ứng dụng thực tế. Cùng thảo luận xây dựng giáo án, đồ dùng trực quan, dự kiến các tình huống khó khăn của học sinh.',
      color: 'bg-blue-500'
    },
    {
      step: 'Bước 2',
      title: 'Tiến hành dạy minh họa & Dự giờ quan sát',
      desc: 'Một giáo viên đại diện thực hiện tiết dạy trên lớp. Các giáo viên khác dự giờ không đánh giá cho điểm người dạy mà tập trung quan sát kỹ hoạt động học tập, nét mặt, sự hợp tác và vướng mắc của từng nhóm học sinh.',
      color: 'bg-emerald-500'
    },
    {
      step: 'Bước 3',
      title: 'Suy ngẫm & Thảo luận về việc học của học sinh',
      desc: 'Người dạy chia sẻ cảm nhận và mục tiêu đạt được. Người dự đưa ra các minh chứng quan sát được (học sinh nào gặp khó khăn, thời điểm nào học sinh hứng thú nhất, nguyên nhân vì sao) và đề xuất giải pháp cải thiện.',
      color: 'bg-amber-500'
    },
    {
      step: 'Bước 4',
      title: 'Vận dụng kết quả vào các tiết dạy hàng ngày',
      desc: 'Mỗi thầy cô trong tổ đúc rút kinh nghiệm, điều chỉnh phương pháp tổ chức hoạt động thí nghiệm, đặt câu hỏi gợi mở để áp dụng linh hoạt vào các lớp mình đang phụ trách giảng dạy.',
      color: 'bg-indigo-500'
    }
  ];

  const sampleTopics = [
    {
      id: 'topic-1',
      type: 'lesson_study',
      grade: 7,
      subject: 'Khoa học Tự nhiên 7',
      title: 'Nghiên cứu bài học: Trao đổi nước và các chất dinh dưỡng ở thực vật',
      author: 'Tổ KHTN (Thầy Tuấn & Cô Hảo thực hiện)',
      date: '15/10/2025',
      summary: 'Ứng dụng phương pháp dạy học khám phá kết hợp thí nghiệm ảo quan sát dòng mạch gỗ và mạch rây ở thực vật.',
      status: 'Đã hoàn thành'
    },
    {
      id: 'topic-2',
      type: 'lesson_study',
      grade: 8,
      subject: 'Khoa học Tự nhiên 8',
      title: 'Nghiên cứu bài học: Định luật bảo toàn khối lượng & Phương trình hóa học',
      author: 'Nhóm Hóa học KHTN',
      date: '20/11/2025',
      summary: 'Thiết kế hoạt động nhóm đo khối lượng trước và sau phản ứng của dung dịch BaCl2 với Na2SO4.',
      status: 'Đang triển khai'
    },
    {
      id: 'topic-3',
      type: 'quality_improvement',
      grade: 6,
      subject: 'Khoa học Tự nhiên 6',
      title: 'Chuyên đề: Đổi mới kiểm tra đánh giá theo định hướng phát triển năng lực KHTN 6',
      author: 'Tổ Chuyên Môn KHTN',
      date: '05/09/2025',
      summary: 'Xây dựng ngân hàng câu hỏi trắc nghiệm khách quan kết hợp câu hỏi mở thực tiễn gắn với đời sống hàng ngày.',
      status: 'Đã hoàn thành'
    },
    {
      id: 'topic-4',
      type: 'quality_improvement',
      grade: 9,
      subject: 'Khoa học Tự nhiên 9',
      title: 'Chuyên đề: Ứng dụng mô phỏng thí nghiệm ảo PhET và STEM trong giảng dạy KHTN',
      author: 'Cô Nguyễn Thị Hảo',
      date: '12/12/2025',
      summary: 'Hướng dẫn giáo viên cách nhúng trực tiếp các mô phỏng PhET mạch điện và khúc xạ ánh sáng vào bài giảng điện tử.',
      status: 'Đã hoàn thành'
    }
  ];

  const filteredTopics = sampleTopics.filter((t) => t.type === activeTab);

  return (
    <div className="space-y-8">
      {/* Header Page */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-2 text-brand-600 mb-2">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Đổi Mới Phương Pháp</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
          Sinh Hoạt Chuyên Đề & Nghiên Cứu Bài Học (Lesson Study)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed max-w-3xl">
          Phân hệ chuyên đề được thiết kế 2 nhánh trọng tâm theo quy định của Bộ Giáo dục & Đào tạo nhằm nâng cao năng lực sư phạm và chất lượng dạy học môn Khoa học Tự nhiên THCS.
        </p>

        {/* Tab Switcher */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-100 pb-4">
          <button
            onClick={() => setActiveTab('lesson_study')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'lesson_study'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Nghiên Cứu Bài Học (Lesson Study)</span>
          </button>
          <button
            onClick={() => setActiveTab('quality_improvement')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'quality_improvement'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. Chuyên Đề Nâng Cao Chất Lượng & STEM</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Lesson Study Protocol */}
      {activeTab === 'lesson_study' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-brand-600" />
              <span>Quy Trình 4 Bước Sinh Hoạt Chuyên Môn Theo Nghiên Cứu Bài Học</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {lessonStudySteps.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className={`inline-block text-[11px] font-bold text-white px-2.5 py-0.5 rounded-lg ${item.color}`}>
                      {item.step}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 leading-snug">{item.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Quality Improvement Guidelines */}
      {activeTab === 'quality_improvement' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>Định Hướng Chuyên Đề Nâng Cao Chất Lượng Dạy Học & Giáo Dục STEM KHTN</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Chuyên đề cấp tổ và liên trường nhằm tháo gỡ khó khăn về các nội dung tích hợp liên môn (Lý - Hóa - Sinh), hướng dẫn sử dụng trang thiết bị thí nghiệm hiện đại và triển khai ngày hội STEM Khoa học Tự nhiên cấp trường.
          </p>
        </div>
      )}

      {/* Hồ sơ các chuyên đề đã thực hiện */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center justify-between">
          <span>Hồ Sơ & Minh Chứng Chuyên Đề Đã Đăng Ký ({filteredTopics.length})</span>
        </h3>

        <div className="space-y-4">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-brand-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center space-x-2">
                  <Badge variant={topic.type === 'lesson_study' ? 'primary' : 'success'}>
                    {topic.subject}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-400">• {topic.date}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">{topic.title}</h4>
                <p className="text-xs text-slate-600">{topic.summary}</p>
                <div className="text-[11px] text-slate-500 font-medium pt-1">
                  Người thực hiện: <strong>{topic.author}</strong>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <Badge variant="success">{topic.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
