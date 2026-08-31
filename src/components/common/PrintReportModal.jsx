import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { formatDate } from '../../utils/formatDate';
import { Printer, Download, X, FileText, CheckSquare, Square, FileSignature } from 'lucide-react';

export default function PrintReportModal({
  isOpen,
  onClose,
  title = 'Báo Cáo Chuyên Môn',
  docType = 'minutes', // 'minutes' | 'emulation' | 'plan' | 'schedule' | 'evaluation'
  data = null
}) {
  const { settings } = useSettings();
  const [showSignatures, setShowSignatures] = useState(true);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const today = new Date();
  const dayStr = today.getDate();
  const monthStr = today.getMonth() + 1;
  const yearStr = today.getFullYear();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity print:hidden"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-2 sm:p-6 print:p-0">
        <div className="relative flex flex-col w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 print:border-0 print:shadow-none print:max-w-none print:w-full print:rounded-none">
          {/* Action Toolbar (Hidden during Print) */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-900 text-white print:hidden">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-brand-400" />
              <span className="font-bold text-sm">Xem Trước Bản In & Xuất PDF</span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Toggle Chữ ký số */}
              <button
                type="button"
                onClick={() => setShowSignatures(!showSignatures)}
                className="flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                {showSignatures ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>Chèn chữ ký điện tử / dấu số</span>
              </button>

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

          {/* Printable Document Sheet (Chuẩn Thể thức Văn bản Hành chính) */}
          <div className="p-8 sm:p-12 text-slate-900 font-serif leading-relaxed bg-white max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-8">
            {/* Header Quốc Huy & Đơn Vị */}
            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-300 text-xs">
              <div className="text-center font-sans space-y-0.5">
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

              <div className="text-center font-sans space-y-0.5">
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

            {/* Document Content Based on Type */}
            {docType === 'minutes' && (
              <div className="mt-8 space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-bold uppercase tracking-wide">
                    BIÊN BẢN SINH HOẠT TỔ CHUYÊN MÔN
                  </h2>
                  <p className="text-sm font-semibold italic">
                    {data.title}
                  </p>
                </div>

                <div className="text-sm space-y-2 font-sans">
                  <p><strong>1. Thời gian:</strong> Ngày {formatDate(data.meeting_date)}</p>
                  <p><strong>2. Địa điểm:</strong> {data.location || 'Phòng Hội đồng Sư phạm'}</p>
                  <p><strong>3. Thành phần tham dự:</strong></p>
                  <ul className="list-disc pl-6 space-y-1 text-xs">
                    <li>Chủ trì: {data.chairperson || settings?.head_teacher_name || 'Tổ trưởng chuyên môn'}</li>
                    <li>Thư ký: {data.secretary || settings?.deputy_head_name || 'Thư ký cuộc họp'}</li>
                    <li>Số lượng thành viên có mặt: {data.attendees_count || 11}/11 đồng chí giáo viên.</li>
                  </ul>

                  <p className="pt-2"><strong>4. Nội dung diễn biến cuộc họp:</strong></p>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs whitespace-pre-line leading-relaxed font-serif">
                    {data.content || 'Nội dung sinh hoạt theo kế hoạch chuyên môn định kỳ.'}
                  </div>

                  <p className="pt-2"><strong>5. Kết luận và phân công nhiệm vụ:</strong></p>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs whitespace-pre-line leading-relaxed font-serif">
                    {data.conclusions || 'Tổ thống nhất 100% các nội dung đã triển khai.'}
                  </div>
                </div>
              </div>
            )}

            {docType === 'emulation' && (
              <div className="mt-8 space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-bold uppercase tracking-wide">
                    BẢNG TỔNG HỢP ĐIỂM THI ĐUA GIÁO VIÊN
                  </h2>
                  <p className="text-sm font-semibold italic">
                    Kỳ đánh giá: {data.periodValue} • Năm học {settings?.school_year}
                  </p>
                </div>

                <table className="w-full text-left border-collapse border border-slate-400 text-xs font-sans mt-4">
                  <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                      <th className="border border-slate-400 p-2">STT</th>
                      <th className="border border-slate-400 p-2">Họ và Tên</th>
                      <th className="border border-slate-400 p-2">Chuyên môn</th>
                      <th className="border border-slate-400 p-2">Hồ sơ (40%)</th>
                      <th className="border border-slate-400 p-2">Thao giảng (40%)</th>
                      <th className="border border-slate-400 p-2">Phong trào (20%)</th>
                      <th className="border border-slate-400 p-2">Tổng điểm</th>
                      <th className="border border-slate-400 p-2">Xếp loại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items?.map((item, idx) => (
                      <tr key={idx} className="text-center">
                        <td className="border border-slate-400 p-2">{idx + 1}</td>
                        <td className="border border-slate-400 p-2 text-left font-semibold">
                          {item.profiles?.full_name}
                        </td>
                        <td className="border border-slate-400 p-2">{item.profiles?.specialty}</td>
                        <td className="border border-slate-400 p-2">{item.professional_score}</td>
                        <td className="border border-slate-400 p-2">{item.teaching_score}</td>
                        <td className="border border-slate-400 p-2">{item.activity_score}</td>
                        <td className="border border-slate-400 p-2 font-bold">{item.total_score}</td>
                        <td className="border border-slate-400 p-2 font-bold">{item.rank}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {docType === 'schedule' && (
              <div className="mt-8 space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-bold uppercase tracking-wide">
                    LỊCH PHÂN CÔNG THAO GIẢNG & DỰ GIỜ TỔ KHTN
                  </h2>
                  <p className="text-sm font-semibold italic">
                    Năm học: {settings?.school_year}
                  </p>
                </div>

                <table className="w-full text-left border-collapse border border-slate-400 text-xs font-sans mt-4">
                  <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                      <th className="border border-slate-400 p-2">STT</th>
                      <th className="border border-slate-400 p-2">Giáo Viên Dạy</th>
                      <th className="border border-slate-400 p-2">Tên Bài Dạy</th>
                      <th className="border border-slate-400 p-2">Ngày Dạy</th>
                      <th className="border border-slate-400 p-2">Tiết/Lớp</th>
                      <th className="border border-slate-400 p-2">Hình Thức</th>
                      <th className="border border-slate-400 p-2">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items?.map((item, idx) => (
                      <tr key={idx} className="text-center">
                        <td className="border border-slate-400 p-2">{idx + 1}</td>
                        <td className="border border-slate-400 p-2 text-left font-semibold">
                          {item.profiles?.full_name}
                        </td>
                        <td className="border border-slate-400 p-2 text-left">{item.topic_title}</td>
                        <td className="border border-slate-400 p-2">{formatDate(item.teaching_date)}</td>
                        <td className="border border-slate-400 p-2">Tiết {item.period_number} - Lớp {item.classroom}</td>
                        <td className="border border-slate-400 p-2">{item.type}</td>
                        <td className="border border-slate-400 p-2 font-semibold">
                          {item.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer Signatures Block with Digital Signature Stamp */}
            <div className={`grid ${docType === 'emulation' ? 'grid-cols-3' : 'grid-cols-2'} gap-6 pt-12 text-center text-xs font-sans`}>
              {/* Cột 1: Người lập biểu / Thư ký */}
              <div>
                <p className="uppercase font-bold">THƯ KÝ / NGƯỜI LẬP</p>
                <p className="italic text-[11px] text-slate-500">(Ký và ghi rõ họ tên)</p>
                <div className="h-20 flex items-center justify-center">
                  {/* Placeholder khoảng trống chữ ký */}
                </div>
                <p className="font-bold">{data.secretary || settings?.deputy_head_name || 'Cô Nguyễn Thị Hảo'}</p>
              </div>

              {/* Cột 2: Tổ Trưởng Chuyên Môn */}
              <div>
                <p className="uppercase font-bold">TỔ TRƯỞNG CHUYÊN MÔN</p>
                <p className="italic text-[11px] text-slate-500">(Ký và ghi rõ họ tên)</p>
                <div className="h-20 flex items-center justify-center overflow-hidden">
                  {showSignatures && settings?.head_signature_url ? (
                    <img
                      src={settings.head_signature_url}
                      alt="Chữ ký Tổ Trưởng"
                      className="max-h-16 object-contain"
                    />
                  ) : null}
                </div>
                <p className="font-bold">{settings?.head_teacher_name || 'Thầy Dương Văn Hoạch'}</p>
              </div>

              {/* Cột 3 (Đối với bảng thi đua / kế hoạch năm): Ban Giám Hiệu Phê Duyệt */}
              {docType === 'emulation' && (
                <div>
                  <p className="uppercase font-bold">BAN GIÁM HIỆU DUYỆT</p>
                  <p className="italic text-[11px] text-slate-500">(Ký và đóng dấu)</p>
                  <div className="h-20 flex items-center justify-center overflow-hidden">
                    {showSignatures && settings?.principal_signature_url ? (
                      <img
                        src={settings.principal_signature_url}
                        alt="Dấu / Chữ ký Hiệu Trưởng"
                        className="max-h-16 object-contain"
                      />
                    ) : null}
                  </div>
                  <p className="font-bold">{settings?.principal_name || 'Thầy Hiệu Trưởng'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
