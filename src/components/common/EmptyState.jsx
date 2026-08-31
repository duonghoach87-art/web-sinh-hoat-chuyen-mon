import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({
  title = 'Chưa có dữ liệu',
  description = 'Hiện tại chưa có mục nào được tạo hoặc tìm thấy theo bộ lọc.',
  actionText,
  onAction,
  icon: Icon = FolderOpen
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-200 my-4">
      <div className="p-4 bg-brand-50 rounded-2xl text-brand-600 mb-3 shadow-xs">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
        >
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
