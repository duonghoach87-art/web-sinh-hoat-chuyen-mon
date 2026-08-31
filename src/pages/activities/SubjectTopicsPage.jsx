import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  ArrowRight,
  Trash2,
  PlusCircle,
  ShieldAlert,
  FilePlus,
  Clock,
  MessageSquare
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal';
import AddTopicModal from '../../components/activities/AddTopicModal';
import TopicFeedbackModal from '../../components/activities/TopicFeedbackModal';

const INITIAL_TOPICS = [
  {
    id: 'topic-1',
    type: 'lesson_study',
    grade: 7,
    subject: 'Khoa học Tự nhiên 7',
    title: 'Nghiên cứu bài học: Trao đổi nước và các chất dinh dưỡng ở thực vật',
    author: 'Tổ KHTN (Thầy Tuấn & Cô Hảo thực hiện)',
    date: '15/10/2025',
    summary: 'Ứng dụng phương pháp dạy học khám phá kết hợp thí nghiệm ảo quan sát dòng mạch gỗ và mạch rây ở thực vật.',
    status: 'Đã hoàn thành',
    file_url: null,
    file_name: null,
    feedbacks: [
      {
        id: 'fb-1',
        author_name: 'Cô Nguyễn Thị Hảo',
        author_specialty: 'Khoa học Tự nhiên',
        created_at: '15/10/2025 15:30',
        observation: 'Học sinh rất hào hứng khi được thao tác trên mô phỏng dòng vận chuyển nước qua rễ cây.',
        suggestion: 'Nên dành thêm 3 phút để đại diện nhóm học sinh yếu lên thuyết trình kết quả.'
      }
    ]
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
    status: 'Đang triển khai',
    file_url: null,
    file_name: null,
    feedbacks: []
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
    status: 'Đã hoàn thành',
    file_url: null,
    file_name: null,
    feedbacks: []
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
    status: 'Đã hoàn thành',
    file_url: null,
    file_name: null,
    feedbacks: []
  }
];

export default function SubjectTopicsPage() {
  const { role: userRole, canManage } = useAuth();
  const isAdmin = userRole === 'admin';

  const [activeTab, setActiveTab] = useState('lesson_study'); // 'lesson_study' | 'quality_improvement'
  const [topics, setTopics] = useState(() => {
    try {
      const saved = localStorage.getItem('khtn_subject_topics');
      return saved ? JSON.parse(saved) : INITIAL_TOPICS;
    } catch {
      return INITIAL_TOPICS;
    }
  });

  // Modal State Thêm Minh Chứng
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Modal State Góp Ý Chuyên Môn
  const [selectedTopicForFeedback, setSelectedTopicForFeedback] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Modal State Xóa Minh Chứng (Chỉ dành cho Admin)
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('khtn_subject_topics', JSON.stringify(topics));
    } catch (e) {
      console.warn('Không thể lưu topics vào localStorage:', e);
    }
  }, [topics]);

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

  const filteredTopics = topics.filter((t) => t.type === activeTab);

  const handleSaveNewTopic = (createdTopic) => {
    setTopics([createdTopic, ...topics]);
  };

  const handleOpenFeedbackModal = (topic) => {
    setSelectedTopicForFeedback(topic);
    setIsFeedbackModalOpen(true);
  };

  const handleAddFeedback = (topicId, feedback) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          const currentFeedbacks = t.feedbacks || [];
          return {
            ...t,
            feedbacks: [feedback, ...currentFeedbacks]
          };
        }
        return t;
      })
    );

    // Cập nhật selectedTopic nếu đang mở
    setSelectedTopicForFeedback((prev) => {
      if (prev && prev.id === topicId) {
        return {
          ...prev,
          feedbacks: [feedback, ...(prev.feedbacks || [])]
        };
      }
      return prev;
    });
  };

  const handleDeleteFeedback = (topicId, feedbackId) => {
    if (!isAdmin) return;
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          return {
            ...t,
            feedbacks: (t.feedbacks || []).filter((fb) => fb.id !== feedbackId)
          };
        }
        return t;
      })
    );

    setSelectedTopicForFeedback((prev) => {
      if (prev && prev.id === topicId) {
        return {
          ...prev,
          feedbacks: (prev.feedbacks || []).filter((fb) => fb.id !== feedbackId)
        };
      }
      return prev;
    });
  };

  const handleOpenDeleteConfirm = (topic) => {
    if (!isAdmin) {
      alert('Chỉ Quản trị viên (Admin - Thầy Hoạch) mới có quyền xóa minh chứng chuyên đề.');
      return;
    }
    setTopicToDelete(topic);
    setIsDeleteModalOpen(true);
  };

  const handleExecuteDelete = () => {
    if (!topicToDelete) return;
    setTopics(topics.filter((t) => t.id !== topicToDelete.id));
    setIsDeleteModalOpen(false);
    setTopicToDelete(null);
    setDeleteSuccess(true);
    setTimeout(() => setDeleteSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header Page */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
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
          </div>

          {canManage && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all shrink-0 self-start sm:self-auto"
            >
              <FilePlus className="w-4 h-4" />
              <span>Đăng Ký Chuyên Đề Mới</span>
            </button>
          )}
        </div>

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

      {deleteSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">Đã xóa hồ sơ minh chứng chuyên đề thành công khỏi hệ thống!</span>
        </div>
      )}

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <span>Hồ Sơ & Minh Chứng Chuyên Đề Đã Đăng Ký ({filteredTopics.length})</span>
          </h3>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            {isAdmin ? (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-semibold flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin có quyền quản lý & xóa minh chứng</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Chế độ xem minh chứng (Chỉ đọc)</span>
              </span>
            )}
          </div>
        </div>

        {filteredTopics.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
            Chưa có hồ sơ minh chứng chuyên đề nào trong mục này.
          </div>
        ) : (
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
                  <p className="text-xs text-slate-600 leading-relaxed">{topic.summary}</p>
                  <div className="text-[11px] text-slate-500 font-medium pt-1 flex items-center space-x-3">
                    <span>Người thực hiện: <strong>{topic.author}</strong></span>
                    {topic.file_name && (
                      <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Có tệp giáo án: {topic.file_name}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                  <Badge variant={topic.status === 'Đã hoàn thành' ? 'success' : 'warning'}>
                    {topic.status}
                  </Badge>

                  {/* Nút Xem & Thảo Luận Góp Ý Sau Tiết Dạy */}
                  <button
                    onClick={() => handleOpenFeedbackModal(topic)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition-all border border-brand-200/60 shadow-2xs"
                    title="Xem thảo luận và đóng góp ý kiến"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Góp ý ({(topic.feedbacks || []).length})</span>
                  </button>

                  {/* Nút Tải Giáo Án Đính Kèm Nếu Có */}
                  {topic.file_url && (
                    <a
                      href={topic.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-all border border-emerald-200"
                      title="Tải giáo án / bài giảng minh họa"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải giáo án</span>
                    </a>
                  )}

                  {/* Nút Xóa Minh Chứng - DÀNH RIÊNG CHO QUẢN TRỊ VIÊN (ADMIN - THẦY HOẠCH) */}
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenDeleteConfirm(topic)}
                      className="p-2 text-rose-500 hover:text-white bg-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-all shadow-2xs"
                      title="Xóa minh chứng chuyên đề này (Quyền Admin)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Thêm Chuyên Đề Mới (Hỗ trợ tải tệp giáo án) */}
      <AddTopicModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewTopic}
        activeTab={activeTab}
      />

      {/* Modal Thảo Luận & Góp Ý Sau Tiết Dạy Nghiên Cứu Bài Học */}
      <TopicFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setSelectedTopicForFeedback(null);
        }}
        topic={selectedTopicForFeedback}
        onAddFeedback={handleAddFeedback}
        onDeleteFeedback={handleDeleteFeedback}
      />

      {/* Modal Xác Nhận Xóa Minh Chứng (Chỉ dành cho Admin) */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTopicToDelete(null);
        }}
        onConfirm={handleExecuteDelete}
        title="Xác Nhận Xóa Hồ Sơ Minh Chứng Chuyên Đề"
        message={`Bạn có chắc chắn muốn xóa hồ sơ minh chứng chuyên đề: "${topicToDelete?.title}" khỏi hệ thống không? Hành động này dành riêng cho Quản trị viên (Admin - Thầy Hoạch).`}
        confirmText="Đồng ý xóa"
        type="danger"
      />
    </div>
  );
}
