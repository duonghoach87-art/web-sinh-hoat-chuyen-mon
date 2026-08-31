import React from 'react';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

export default function PdfViewerModal({ isOpen, onClose, fileUrl, title = 'Xem Trước Tài Liệu' }) {
  if (!isOpen || !fileUrl) return null;

  const isPdf = fileUrl.toLowerCase().endsWith('.pdf') || fileUrl.includes('.pdf');
  const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative flex flex-col w-full max-w-5xl h-[88vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Header Toolbar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
            <div className="flex items-center space-x-3 overflow-hidden">
              <FileText className="w-5 h-5 text-brand-400 shrink-0" />
              <span className="font-semibold text-sm truncate">{title}</span>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <a
                href={fileUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-200 transition-colors"
                title="Tải tệp tin về máy"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Tải về</span>
              </a>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 rounded-lg text-xs font-medium text-white transition-colors"
                title="Mở trong tab mới"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Tab mới</span>
              </a>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Viewer Container */}
          <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center">
            {isPdf ? (
              <iframe
                src={`${fileUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0"
                title={title}
              />
            ) : isImage ? (
              <div className="p-4 max-h-full overflow-auto flex items-center justify-center">
                <img
                  src={fileUrl}
                  alt={title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                />
              </div>
            ) : (
              <div className="text-center p-8 max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 m-4">
                <FileText className="w-16 h-16 text-brand-500 mx-auto mb-4" />
                <h4 className="text-base font-bold text-slate-800 mb-2">Tệp định dạng Word / Văn bản</h4>
                <p className="text-xs text-slate-500 mb-5">
                  Định dạng này không hỗ trợ xem trực tiếp trên trình duyệt. Quý thầy cô vui lòng tải về hoặc mở trực tiếp trên máy tính.
                </p>
                <a
                  href={fileUrl}
                  download
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải file xuống máy</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
