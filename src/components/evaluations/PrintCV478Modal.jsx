import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { CV478_SECTIONS } from '../../lib/cv478Criteria';
import { formatDate } from '../../utils/formatDate';
import { Printer, X, FileText, Download } from 'lucide-react';

export default function PrintCV478Modal({
  isOpen,
  onClose,
  registration,
  evaluation,
  isAggregated = false,
  evaluations = []
}) {
  const { settings } = useSettings();

  if (!isOpen || !registration) return null;

  const handlePrint = () => {
    window.print();
  };

  const today = new Date();
  const dayStr = today.getDate();
  const monthStr = today.getMonth() + 1;
  const yearStr = today.getFullYear();

  // Điểm từng tiêu chí (nếu in phiếu cá nhân hoặc phiếu tổng hợp)
  const scores = evaluation?.criteria_scores || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity print:hidden"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-2 sm:p-6 print:p-0">
        <div className="relative flex flex-col w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 print:border-0 print:shadow-none print:max-w-none print:w-full print:rounded-none">
          {/* Action Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-brand-400" />
              <span className="font-bold text-sm">
                {isAggregated ? 'Bản In Tổng Hợp Đánh Giá Giờ Dạy (CV 478)' : 'Phiếu Đánh Giá, Xếp Loại Bài Dạy (Phụ Lục I - CV 478)'}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl text-xs font-bold text-white transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Bấm In / Lưu PDF</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Sheet (Theo Mẫu Phụ Lục I Công Văn 478/SGDĐT-GDTrH-TX&CN) */}
          <div className="p-8 sm:p-12 text-slate-900 font-serif leading-relaxed bg-white max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-8">
            {/* Header Quốc Huy & Đơn Vị */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-300 text-xs font-sans">
              <div className="text-center space-y-0.5">
                <p className="uppercase text-[11px] font-medium tracking-wide">
                  {settings?.department_authority || 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO'}
                </p>
                <p className="uppercase font-bold text-xs">
                  {settings?.school_name || 'TRƯỜNG THCS CHU VĂN AN'}
                </p>
                <p className="font-semibold text-brand-900 uppercase text-[11px]">
                  {settings?.department_name || 'TỔ KHOA HỌC TỰ NHIÊN'}
                </p>
                <div className="w-16 h-0.5 bg-slate-800 mx-auto mt-1" />
              </div>

              <div className="text-center space-y-0.5">
                <p className="uppercase font-bold text-xs tracking-tight">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </p>
                <p className="font-semibold text-xs italic">
                  Độc lập - Tự do - Hạnh phúc
                </p>
                <div className="w-28 h-0.5 bg-slate-800 mx-auto mt-1" />
                <p className="text-[10px] text-slate-600 italic pt-1 font-serif">
                  ......, ngày {dayStr} tháng {monthStr} năm {yearStr}
                </p>
              </div>
            </div>

            {/* Tiêu Đề Văn Bản Phụ Lục I */}
            <div className="text-center my-6 space-y-1">
              <p className="text-xs font-sans font-bold uppercase text-slate-500">Phụ lục I</p>
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide">
                PHIẾU ĐÁNH GIÁ, XẾP LOẠI BÀI DẠY
              </h2>
              <p className="text-[11px] font-sans italic text-slate-500">
                (Kèm theo Công văn số 478/SGDĐT-GDTrH-TX&CN ngày 22 tháng 3 năm 2021 của Sở GD&ĐT Lai Châu)
              </p>
            </div>

            {/* Thông Tin Tiết Dạy */}
            <div className="text-xs space-y-1.5 font-sans mb-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p><strong>Tên bài dạy:</strong> {registration.topic_title}</p>
                <p><strong>Môn học:</strong> {registration.subject || 'Khoa học Tự nhiên'}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <p><strong>Lớp:</strong> {registration.classroom}</p>
                <p><strong>Tiết PPCT:</strong> {registration.period_number}</p>
                <p><strong>Ngày dạy:</strong> {formatDate(registration.teaching_date)}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                <p><strong>Giáo viên thực hiện:</strong> {registration.profiles?.full_name}</p>
                <p>
                  <strong>Người đánh giá:</strong>{' '}
                  {isAggregated
                    ? `Hội đồng dự giờ (${evaluations.length} giáo viên)`
                    : evaluation?.evaluator?.full_name || 'Giáo viên dự giờ'}
                </p>
              </div>
            </div>

            {/* Bảng 12 Tiêu Chí Đánh Giá (Phụ Lục I) */}
            <table className="w-full text-left border-collapse border border-slate-400 text-[11px] font-sans">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-slate-400 p-2 w-1/4">Nội dung</th>
                  <th className="border border-slate-400 p-2">Tiêu chí</th>
                  <th className="border border-slate-400 p-2 w-20">Điểm tối đa</th>
                  <th className="border border-slate-400 p-2 w-20">Điểm đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {CV478_SECTIONS.map((sec) =>
                  sec.criteria.map((cr, cIdx) => (
                    <tr key={cr.id}>
                      {cIdx === 0 && (
                        <td
                          rowSpan={sec.criteria.length}
                          className="border border-slate-400 p-2 font-bold align-top bg-slate-50/50"
                        >
                          {sec.name}
                        </td>
                      )}
                      <td className="border border-slate-400 p-2">
                        {cr.number}. {cr.title}
                      </td>
                      <td className="border border-slate-400 p-2 text-center font-semibold">
                        {cr.maxScore.toFixed(2)}
                      </td>
                      <td className="border border-slate-400 p-2 text-center font-bold text-brand-800">
                        {(scores[cr.id] !== undefined ? parseFloat(scores[cr.id]).toFixed(2) : cr.maxScore.toFixed(2))}
                      </td>
                    </tr>
                  ))
                )}
                <tr className="bg-slate-100 font-bold">
                  <td colSpan={2} className="border border-slate-400 p-2.5 text-right uppercase">
                    Tổng điểm
                  </td>
                  <td className="border border-slate-400 p-2.5 text-center">20,00</td>
                  <td className="border border-slate-400 p-2.5 text-center text-sm font-black text-brand-700">
                    {(evaluation?.total_score || 18.5).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Xếp Loại & Ý Kiến Nhận Xét */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-sans space-y-2">
              <div className="flex items-center justify-between">
                <p>
                  <strong>Xếp loại tiết dạy:</strong>{' '}
                  <span className="font-bold text-sm text-brand-700 uppercase">
                    {evaluation?.rank === 'Tốt'
                      ? 'Giỏi'
                      : evaluation?.rank === 'Đạt'
                      ? 'Trung bình'
                      : evaluation?.rank === 'Chưa đạt'
                      ? 'Không đạt'
                      : evaluation?.rank || 'Giỏi'}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  (Theo chuẩn mức xếp loại Công văn 478)
                </p>
              </div>

              {evaluation?.strengths && (
                <p><strong>• Ưu điểm:</strong> {evaluation.strengths}</p>
              )}
              {evaluation?.improvements && (
                <p><strong>• Tồn tại / Cần khắc phục:</strong> {evaluation.improvements}</p>
              )}
            </div>

            {/* Chữ Ký Người Đánh Giá */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs font-sans">
              <div>
                <p className="uppercase font-bold">GIÁO VIÊN DẠY</p>
                <p className="italic text-[11px] text-slate-500">(Ký và ghi rõ họ tên)</p>
                <div className="h-16" />
                <p className="font-bold">{registration.profiles?.full_name}</p>
              </div>

              <div>
                <p className="uppercase font-bold">NGƯỜI ĐÁNH GIÁ, XẾP LOẠI</p>
                <p className="italic text-[11px] text-slate-500">(Ký và ghi rõ họ tên)</p>
                <div className="h-16" />
                <p className="font-bold">
                  {isAggregated
                    ? settings?.head_teacher_name || 'Tổ trưởng KHTN'
                    : evaluation?.evaluator?.full_name || 'Giáo viên dự giờ'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
