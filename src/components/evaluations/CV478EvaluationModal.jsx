import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  CV478_SECTIONS,
  calculateCV478Rank,
  getCriterionLevel,
  getOverallLessonLevel
} from '../../lib/cv478Criteria';
import { formatDate } from '../../utils/formatDate';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import PrintCV478Modal from './PrintCV478Modal';
import {
  FileText,
  Star,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Award,
  Users,
  ChevronDown,
  ChevronUp,
  Printer,
  PlusCircle,
  HelpCircle,
  Clock,
  Trash2,
  BookOpen,
  Calendar,
  Layers,
  UserCheck,
  FileCheck2,
  Percent
} from 'lucide-react';

export default function CV478EvaluationModal({
  isOpen,
  onClose,
  registration,
  onEvaluated
}) {
  const { user, profile, role: userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  const [evaluations, setEvaluations] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState('');
  const [expandedRubricId, setExpandedRubricId] = useState(null);

  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [selectedEvaluationForPrint, setSelectedEvaluationForPrint] = useState(null);
  const [isAggregatedPrint, setIsAggregatedPrint] = useState(false);

  // Khởi tạo điểm mặc định tối đa (20/20đ) cho 12 tiêu chí
  const initialScores = {
    c1: 1.0, c2: 2.0, c3: 1.0, c4: 2.0,
    c5: 2.0, c6: 1.0, c7: 2.0, c8: 2.0,
    c9: 2.0, c10: 2.0, c11: 2.0, c12: 1.0
  };

  const [criteriaScores, setCriteriaScores] = useState(initialScores);
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [generalComment, setGeneralComment] = useState('');

  const fetchData = async () => {
    if (!registration?.id) return;
    try {
      setLoading(true);
      const [evalRes, teacherRes] = await Promise.all([
        supabase
          .from('lesson_evaluations')
          .select('*, evaluator:evaluator_id(full_name, specialty, avatar_url)')
          .eq('registration_id', registration.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('id, full_name, specialty')
          .order('full_name', { ascending: true })
      ]);

      if (evalRes.data) {
        setEvaluations(evalRes.data);
      }
      if (teacherRes.data) {
        setTeachers(teacherRes.data);
      }
    } catch (err) {
      console.warn('Lỗi nạp dữ liệu đánh giá:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && registration?.id) {
      setSelectedEvaluatorId(user?.id || '');
      fetchData();
      setShowForm(false);
      setExpandedRubricId(null);
      setCriteriaScores(initialScores);
      setStrengths('');
      setImprovements('');
      setGeneralComment('');
    }
  }, [isOpen, registration?.id]);

  if (!isOpen || !registration) return null;

  // Tính tổng điểm từ 12 tiêu chí
  const totalScore = Object.values(criteriaScores || {}).reduce(
    (sum, score) => sum + (parseFloat(score) || 0),
    0
  );
  const scorePercentage = ((totalScore / 20.0) * 100).toFixed(1);
  const overallLessonLevel = getOverallLessonLevel(totalScore);
  const currentRank = calculateCV478Rank(totalScore);

  // Xử lý bấm chọn Mức (Mức 1, Mức 2, Mức 3)
  const handleSelectLevel = (crit, level) => {
    const targetScore = crit.rubric[`level${level}`]?.defaultScore ?? crit.maxScore;
    setCriteriaScores((prev) => ({ ...prev, [crit.id]: targetScore }));
  };

  // Xử lý chọn điểm thành phần (bội số 0.25)
  const handleSelectScore = (critId, score) => {
    setCriteriaScores((prev) => ({ ...prev, [critId]: parseFloat(score) || 0 }));
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    const evaluatorIdToUse = selectedEvaluatorId || user?.id;
    if (!evaluatorIdToUse || !registration?.id) {
      alert('Vui lòng chọn Giáo viên đánh giá.');
      return;
    }

    try {
      setSaving(true);
      const newEval = {
        registration_id: registration.id,
        evaluator_id: evaluatorIdToUse,
        criteria_1_score: criteriaScores.c1,
        criteria_2_score: criteriaScores.c2,
        criteria_3_score: criteriaScores.c3,
        total_score: parseFloat(totalScore.toFixed(2)),
        rank: currentRank,
        strengths: strengths.trim(),
        improvements: improvements.trim(),
        general_comment: generalComment.trim()
      };

      // Thử lưu với rank chuẩn CV 478
      let { error } = await supabase.from('lesson_evaluations').insert([newEval]);

      // Nếu Supabase chưa cập nhật check constraint thì tự động chuyển đổi dự phòng
      if (
        error &&
        (error.message?.includes('lesson_evaluations_rank_check') ||
          error.code === '23514')
      ) {
        const fallbackRankMap = {
          Giỏi: 'Tốt',
          Khá: 'Khá',
          'Trung bình': 'Đạt',
          'Không đạt': 'Chưa đạt'
        };
        const fallbackRank = fallbackRankMap[currentRank] || 'Tốt';
        const retryRes = await supabase
          .from('lesson_evaluations')
          .insert([{ ...newEval, rank: fallbackRank }]);

        if (retryRes.error) throw retryRes.error;
      } else if (error) {
        throw error;
      }

      setShowForm(false);
      await fetchData();
      if (onEvaluated) onEvaluated();
    } catch (err) {
      console.error('Lỗi khi lưu phiếu đánh giá:', err);
      alert(`Không thể lưu đánh giá: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvaluation = async (evalId) => {
    if (!confirm('Bạn có chắc muốn xóa phiếu đánh giá này không?')) return;
    try {
      const { error } = await supabase
        .from('lesson_evaluations')
        .delete()
        .eq('id', evalId);
      if (error) throw error;
      await fetchData();
      if (onEvaluated) onEvaluated();
    } catch (err) {
      alert(`Lỗi khi xóa: ${err.message}`);
    }
  };

  const avgScore =
    evaluations.length > 0
      ? (
          evaluations.reduce((sum, e) => sum + (parseFloat(e.total_score) || 0), 0) /
          evaluations.length
        ).toFixed(2)
      : '0.00';

  const aggregatedRank = calculateCV478Rank(avgScore);

  const handleOpenPrintIndividual = (evalItem) => {
    setSelectedEvaluationForPrint(evalItem);
    setIsAggregatedPrint(false);
    setIsPrintOpen(true);
  };

  const handleOpenPrintAggregated = () => {
    setSelectedEvaluationForPrint({
      total_score: parseFloat(avgScore),
      rank: aggregatedRank,
      strengths: 'Tổng hợp ưu điểm theo hội đồng đánh giá',
      improvements: 'Tổng hợp các điểm cần cải thiện theo các phiếu dự giờ'
    });
    setIsAggregatedPrint(true);
    setIsPrintOpen(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hồ Sơ Đăng Ký & Đánh Giá Giờ Dạy (Công Văn 478 / Sở GD&ĐT Lai Châu)"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
        {/* ================= KHỐI THÔNG TIN CHI TIẾT ĐĂNG KÝ TIẾT DẠY ================= */}
        <div className="p-5 bg-gradient-to-br from-brand-50/70 via-slate-50 to-white border border-brand-200/80 rounded-2xl space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-brand-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {registration.subject || 'Khoa học Tự nhiên'}
                </span>
                <span className="px-2.5 py-0.5 bg-slate-200 text-slate-800 rounded-full text-[10px] font-bold">
                  Khối {registration.grade_level} • Lớp {registration.classroom}
                </span>
                <Badge
                  variant={
                    registration.status === 'approved'
                      ? 'success'
                      : registration.status === 'pending'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {registration.status === 'approved'
                    ? 'Đã Phê Duyệt'
                    : registration.status === 'pending'
                    ? 'Chờ Duyệt'
                    : 'Từ Chối'}
                </Badge>
              </div>

              <h3 className="text-lg font-black text-slate-900 leading-tight pt-1">
                {registration.topic_title}
              </h3>
            </div>

            {/* Thống kê tiến độ hội đồng đánh giá (Tối thiểu 3 giáo viên) */}
            <div className="text-right shrink-0 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-1.5 justify-end">
                <Users className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-black text-slate-800">
                  {evaluations.length} / 3 Phiếu Đánh Giá
                </span>
              </div>
              <p className="text-[10px] mt-0.5 font-medium">
                {evaluations.length >= 3 ? (
                  <span className="text-emerald-600 font-bold">✓ Đủ chỉ tiêu quy định (≥ 3 GV)</span>
                ) : (
                  <span className="text-amber-600 font-bold">Cần thêm {3 - evaluations.length} GV dự giờ</span>
                )}
              </p>
            </div>
          </div>

          {/* Lưới chi tiết thời gian & phân công */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-brand-100 text-xs text-slate-700">
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Giáo Viên Dạy</span>
              <strong className="text-slate-800">{registration.profiles?.full_name || 'Giáo viên'}</strong>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Ngày Dạy</span>
              <strong className="text-brand-700">{formatDate(registration.teaching_date)}</strong>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Tiết Dạy</span>
              <strong>Tiết {registration.period_number} (PPCT: {registration.curriculum_period || 1})</strong>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Hình Thức</span>
              <strong className="text-slate-800">
                {registration.type === 'thao_giang'
                  ? 'Thao giảng cấp Tổ'
                  : registration.type === 'chuyen_de'
                  ? 'Dạy Chuyên đề'
                  : 'Hội giảng'}
              </strong>
            </div>
          </div>

          {/* Điểm Trung Bình Cộng & Xếp Loại Chung Của Hội Đồng */}
          {evaluations.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-brand-100 bg-white/90 p-3 rounded-xl border border-slate-200/70">
              <div className="flex items-center space-x-3">
                <div className="px-3 py-1.5 bg-brand-50 border border-brand-200 rounded-xl text-xs">
                  <span>Điểm TBC ({evaluations.length} GV): </span>
                  <strong className="text-sm font-black text-brand-700">{avgScore} / 20.00 đ</strong>
                </div>
                <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <span>Xếp loại chung: </span>
                  <strong className="text-sm font-black text-emerald-700 uppercase">{aggregatedRank}</strong>
                </div>
              </div>

              <button
                onClick={handleOpenPrintAggregated}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Tổng Hợp Đánh Giá (CV 478)</span>
              </button>
            </div>
          )}
        </div>

        {/* Nút Chuyển Đổi Mở Form Đánh Giá Cá Nhân */}
        {!showForm ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <FileCheck2 className="w-4 h-4 text-brand-600" />
              <span>Hội Đồng Dự Giờ Đánh Giá ({evaluations.length} Phiếu)</span>
            </h4>

            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tôi Muốn Gửi Phiếu Đánh Giá Tiết Này</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center bg-brand-50/70 p-3.5 rounded-xl border border-brand-200">
            <span className="text-xs font-bold text-brand-900 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Biểu Mẫu Chấm Điểm 12 Tiêu Chí (Theo Phụ Lục II - CV 478)</span>
            </span>
            <button
              onClick={() => setShowForm(false)}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline"
            >
              Quay lại danh sách phiếu
            </button>
          </div>
        )}

        {/* ================= BIỂU MẪU ĐÁNH GIÁ 12 TIÊU CHÍ PHỤ LỤC II ================= */}
        {showForm && (
          <form onSubmit={handleSaveEvaluation} className="space-y-6 animate-in fade-in">
            {/* Thanh chọn Giáo Viên Đánh Giá & Điểm Số Tức Thời */}
            <div className="sticky top-0 z-20 bg-slate-900 text-white p-4 rounded-2xl shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Tổng Điểm Bài Dạy</span>
                    <p className="text-2xl font-black text-emerald-400">
                      {totalScore.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ 20.00 đ ({scorePercentage}%)</span>
                    </p>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Mức Đánh Giá Bài Dạy</span>
                    <p className="text-sm font-bold text-brand-300">
                      {overallLessonLevel === 3
                        ? 'Mức 3 (80-100%)'
                        : overallLessonLevel === 2
                        ? 'Mức 2 (65-80%)'
                        : overallLessonLevel === 1
                        ? 'Mức 1 (50-65%)'
                        : 'Dưới Mức Đánh Giá'}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Xếp Loại Tự Động</span>
                    <p className="text-base font-extrabold text-amber-300 uppercase">{currentRank}</p>
                  </div>
                </div>

                {/* Chọn Người Đánh Giá */}
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-brand-400" />
                  <span className="text-xs text-slate-300 font-medium">Người đánh giá:</span>
                  <select
                    value={selectedEvaluatorId}
                    onChange={(e) => setSelectedEvaluatorId(e.target.value)}
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                    required
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} ({t.specialty || 'Tổ KHTN'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3 Khối Nội Dung Tiêu Chí */}
            <div className="space-y-5">
              {CV478_SECTIONS.map((section) => (
                <div
                  key={section.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                >
                  <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 uppercase">
                      {section.name}
                    </span>
                    <span className="text-[11px] font-bold text-brand-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                      Tối đa: {section.maxScore.toFixed(2)} đ
                    </span>
                  </div>

                  <div className="p-4 space-y-4 divide-y divide-slate-100">
                    {section.criteria.map((crit) => {
                      const currentScore = criteriaScores[crit.id] ?? crit.maxScore;
                      const activeLevel = getCriterionLevel(currentScore, crit.maxScore);
                      const isExpanded = expandedRubricId === crit.id;

                      const scoreOptions = [];
                      for (let s = 0.25; s <= crit.maxScore; s += 0.25) {
                        scoreOptions.push(parseFloat(s.toFixed(2)));
                      }

                      return (
                        <div key={crit.id} className="pt-3 first:pt-0 space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="space-y-1 max-w-xl">
                              <p className="text-xs font-bold text-slate-800">
                                Tiêu chí {crit.number}: {crit.title}
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedRubricId(isExpanded ? null : crit.id)
                                }
                                className="text-[11px] text-brand-600 hover:text-brand-800 font-semibold flex items-center space-x-1"
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>
                                  {isExpanded
                                    ? 'Ẩn hướng dẫn Phụ lục II'
                                    : 'Xem hướng dẫn chi tiết 3 Mức (Phụ lục II)'}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            {/* Bộ Chọn Mức 1 - Mức 2 - Mức 3 Tương Ứng Tỷ Lệ % */}
                            <div className="flex items-center space-x-1.5 shrink-0">
                              {[1, 2, 3].map((lvl) => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => handleSelectLevel(crit, lvl)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                                    activeLevel === lvl
                                      ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                  title={`Chọn Mức ${lvl} (${lvl === 3 ? '80-100%' : lvl === 2 ? '65-80%' : '50-65%'})`}
                                >
                                  Mức {lvl}
                                </button>
                              ))}

                              {/* Ô Chọn Điểm Số (Bội số 0.25) */}
                              <select
                                value={currentScore}
                                onChange={(e) =>
                                  handleSelectScore(crit.id, e.target.value)
                                }
                                className="px-2 py-1 bg-white border border-brand-300 rounded-lg text-xs font-bold text-brand-900 focus:ring-2 focus:ring-brand-500"
                              >
                                {scoreOptions.map((sc) => (
                                  <option key={sc} value={sc}>
                                    {sc.toFixed(2)} đ
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Khung Hướng Dẫn Verbatim Phụ Lục II Khi Mở Rộng */}
                          {isExpanded && (
                            <div className="p-3.5 bg-brand-50/50 rounded-xl border border-brand-200 text-[11px] space-y-2 animate-in fade-in">
                              <p className="font-bold text-brand-900 uppercase text-[10px]">
                                📖 Hướng Dẫn Đánh Giá Tiêu Chí {crit.number} (Trích Phụ Lục II - CV 478)
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                <div
                                  onClick={() => handleSelectLevel(crit, 1)}
                                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                                    activeLevel === 1
                                      ? 'bg-white border-brand-500 shadow-xs ring-1 ring-brand-400'
                                      : 'bg-white/60 border-slate-200 hover:bg-white'
                                  }`}
                                >
                                  <div className="font-bold text-slate-800 mb-1 flex items-center justify-between">
                                    <span>Mức 1 ({crit.rubric.level1.scoreRange})</span>
                                    {activeLevel === 1 && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                                    )}
                                  </div>
                                  <p className="text-slate-600 text-[10px] leading-relaxed">
                                    {crit.rubric.level1.desc}
                                  </p>
                                </div>

                                <div
                                  onClick={() => handleSelectLevel(crit, 2)}
                                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                                    activeLevel === 2
                                      ? 'bg-white border-brand-500 shadow-xs ring-1 ring-brand-400'
                                      : 'bg-white/60 border-slate-200 hover:bg-white'
                                  }`}
                                >
                                  <div className="font-bold text-slate-800 mb-1 flex items-center justify-between">
                                    <span>Mức 2 ({crit.rubric.level2.scoreRange})</span>
                                    {activeLevel === 2 && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                                    )}
                                  </div>
                                  <p className="text-slate-600 text-[10px] leading-relaxed">
                                    {crit.rubric.level2.desc}
                                  </p>
                                </div>

                                <div
                                  onClick={() => handleSelectLevel(crit, 3)}
                                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                                    activeLevel === 3
                                      ? 'bg-white border-brand-500 shadow-xs ring-1 ring-brand-400'
                                      : 'bg-white/60 border-slate-200 hover:bg-white'
                                  }`}
                                >
                                  <div className="font-bold text-slate-800 mb-1 flex items-center justify-between">
                                    <span>Mức 3 ({crit.rubric.level3.scoreRange})</span>
                                    {activeLevel === 3 && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                                    )}
                                  </div>
                                  <p className="text-slate-600 text-[10px] leading-relaxed">
                                    {crit.rubric.level3.desc}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Nhận Xét Ưu Điểm & Tồn Tại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ưu Điểm Nổi Bật Của Giờ Dạy
                </label>
                <textarea
                  rows={3}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="VD: Tiến trình bài dạy rõ ràng, học sinh tích cực thảo luận nhóm..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tồn Tại & Điểm Cần Cải Thiện
                </label>
                <textarea
                  rows={3}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="VD: Cần phân bổ thời gian hợp lý hơn cho phần vận dụng..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Nút Submit */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
              >
                {saving ? 'Đang lưu phiếu...' : 'Hoàn Tất & Gửi Phiếu Đánh Giá'}
              </button>
            </div>
          </form>
        )}

        {/* ================= DANH SÁCH CÁC PHIẾU ĐÁNH GIÁ ĐÃ CÓ (3 GIÁO VIÊN) ================= */}
        {!showForm && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400">Đang tải phiếu đánh giá...</div>
            ) : evaluations.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Chưa có giáo viên nào gửi phiếu đánh giá cho tiết dạy này.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-brand-600 font-bold hover:underline"
                >
                  Bấm vào đây để trở thành người đầu tiên gửi phiếu đánh giá
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evaluations.map((evalItem) => (
                  <div
                    key={evalItem.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-brand-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                            {evalItem.evaluator?.full_name?.charAt(0) || 'GV'}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-800">
                              {evalItem.evaluator?.full_name}
                            </h5>
                            <span className="text-[10px] text-slate-400">
                              {evalItem.evaluator?.specialty || 'Tổ KHTN'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-brand-700">
                            {evalItem.total_score} / 20 đ
                          </span>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase">
                            {evalItem.rank === 'Tốt'
                              ? 'Giỏi'
                              : evalItem.rank === 'Đạt'
                              ? 'Trung bình'
                              : evalItem.rank === 'Chưa đạt'
                              ? 'Không đạt'
                              : evalItem.rank}
                          </p>
                        </div>
                      </div>

                      {evalItem.strengths && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl">
                          <strong>Ưu điểm:</strong> {evalItem.strengths}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(evalItem.created_at)}</span>
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenPrintIndividual(evalItem)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          title="In phiếu này (Phụ Lục I)"
                        >
                          <Printer className="w-3 h-3" />
                          <span>In Phiếu</span>
                        </button>

                        {(isAdmin || evalItem.evaluator_id === user?.id) && (
                          <button
                            onClick={() => handleDeleteEvaluation(evalItem.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                            title="Xóa phiếu đánh giá"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal In Phụ Lục I */}
      <PrintCV478Modal
        isOpen={isPrintOpen}
        onClose={() => {
          setIsPrintOpen(false);
          setSelectedEvaluationForPrint(null);
        }}
        registration={registration}
        evaluation={selectedEvaluationForPrint}
        isAggregated={isAggregatedPrint}
        evaluations={evaluations}
      />
    </Modal>
  );
}
