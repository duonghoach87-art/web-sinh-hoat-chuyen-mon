import React from 'react';
import { Award, TrendingUp, Users, Sparkles, Trophy } from 'lucide-react';

export default function EmulationChart({ emulations = [], periodValue = 'Tháng 9' }) {
  if (!emulations.length) return null;

  // Tính toán thống kê xếp loại
  const total = emulations.length;
  const ranksCount = {
    'Xuất sắc': emulations.filter((e) => e.rank === 'Xuất sắc').length,
    'Tốt': emulations.filter((e) => e.rank === 'Tốt').length,
    'Khá': emulations.filter((e) => e.rank === 'Khá').length,
    'Đạt': emulations.filter((e) => e.rank === 'Đạt' || e.rank === 'Chưa đạt').length
  };

  const avgScore = (
    emulations.reduce((acc, curr) => acc + (parseFloat(curr.total_score) || 0), 0) / total
  ).toFixed(1);

  // Top 3 Giáo viên
  const topTeachers = [...emulations]
    .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      {/* 1. Điểm Trung Bình & Phân Bổ Xếp Loại */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Điểm Trung Bình Tổ
            </span>
            <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
              {periodValue}
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-800">{avgScore}</span>
            <span className="text-xs text-slate-400 font-medium">/ 100 điểm</span>
          </div>
        </div>

        {/* Thanh phân bổ tỷ lệ xếp loại */}
        <div className="space-y-2 mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">
            Cơ Cấu Xếp Loại ({total} Giáo Viên)
          </span>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Xuất sắc</span>
              </span>
              <span className="font-bold text-slate-700">
                {ranksCount['Xuất sắc']} ({Math.round((ranksCount['Xuất sắc'] / total) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(ranksCount['Xuất sắc'] / total) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-brand-700 font-semibold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                <span>Loại Tốt</span>
              </span>
              <span className="font-bold text-slate-700">
                {ranksCount['Tốt']} ({Math.round((ranksCount['Tốt'] / total) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(ranksCount['Tốt'] / total) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-blue-700 font-semibold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Loại Khá</span>
              </span>
              <span className="font-bold text-slate-700">
                {ranksCount['Khá']} ({Math.round((ranksCount['Khá'] / total) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(ranksCount['Khá'] / total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bục Vinh Danh Top 3 Giáo Viên Tiêu Biểu */}
      <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-navy-900 to-brand-950 text-white p-5 rounded-2xl shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-sm text-white">Bục Vinh Danh Giáo Viên Tiêu Biểu</h4>
          </div>
          <span className="text-[11px] font-semibold text-brand-200 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-md">
            Top Thành Tích {periodValue}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 items-end pt-2 pb-1">
          {/* Hạng 2 */}
          {topTeachers[1] && (
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center border-2 border-slate-300 shadow-md mb-2">
                2
              </div>
              <span className="text-xs font-bold truncate max-w-[110px] text-slate-200">
                {topTeachers[1].profiles?.full_name}
              </span>
              <span className="text-[10px] text-slate-400">
                {topTeachers[1].profiles?.specialty}
              </span>
              <div className="mt-2 w-full bg-slate-700/60 rounded-t-xl py-3 border-t border-slate-500 font-bold text-xs text-amber-300">
                {topTeachers[1].total_score} đ
              </div>
            </div>
          )}

          {/* Hạng 1 (Quán Quân) */}
          {topTeachers[0] && (
            <div className="flex flex-col items-center text-center -mt-3">
              <div className="relative mb-2">
                <div className="w-12 h-12 rounded-full bg-amber-400 text-amber-950 font-black text-base flex items-center justify-center border-2 border-amber-200 shadow-lg ring-4 ring-amber-400/20">
                  1
                </div>
                <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <span className="text-xs font-extrabold truncate max-w-[120px] text-amber-300">
                {topTeachers[0].profiles?.full_name}
              </span>
              <span className="text-[10px] text-slate-300">
                {topTeachers[0].profiles?.specialty}
              </span>
              <div className="mt-2 w-full bg-amber-500/20 rounded-t-xl py-5 border-t border-amber-400 font-black text-sm text-amber-300">
                {topTeachers[0].total_score} đ
              </div>
            </div>
          )}

          {/* Hạng 3 */}
          {topTeachers[2] && (
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-amber-700/60 text-amber-200 font-bold text-sm flex items-center justify-center border-2 border-amber-600/50 shadow-md mb-2">
                3
              </div>
              <span className="text-xs font-bold truncate max-w-[110px] text-slate-200">
                {topTeachers[2].profiles?.full_name}
              </span>
              <span className="text-[10px] text-slate-400">
                {topTeachers[2].profiles?.specialty}
              </span>
              <div className="mt-2 w-full bg-slate-800/60 rounded-t-xl py-2 border-t border-slate-600 font-bold text-xs text-amber-300">
                {topTeachers[2].total_score} đ
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
