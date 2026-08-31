import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, ChevronRight, Award, BookOpen } from 'lucide-react';

const DEFAULT_MILESTONES = [
  {
    id: 1,
    title: 'Hội Giảng Chào Mừng 20/11',
    category: 'Phong trào thi đua',
    targetDate: `${new Date().getFullYear()}-11-20T07:30:00`,
    icon: Award,
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 2,
    title: 'Kiểm Tra Đánh Giá Cuối Học Kỳ I',
    category: 'Chuyên môn & Khảo thí',
    targetDate: `${new Date().getFullYear()}-12-25T07:30:00`,
    icon: BookOpen,
    color: 'from-brand-600 to-blue-700'
  },
  {
    id: 3,
    title: 'Sinh Hoạt Chuyên Đề Lesson Study Tổ KHTN',
    category: 'Sinh hoạt chuyên môn',
    targetDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-28T14:00:00`,
    icon: Sparkles,
    color: 'from-emerald-600 to-teal-700'
  }
];

export default function EventCountdownCard() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  });

  const activeEvent = DEFAULT_MILESTONES[selectedIdx];

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      let target = new Date(activeEvent.targetDate).getTime();

      // Nếu ngày trong quá khứ, cộng thêm 1 năm để đếm tiếp cho năm học sau
      if (target < now) {
        const nextYearTarget = new Date(activeEvent.targetDate);
        nextYearTarget.setFullYear(nextYearTarget.getFullYear() + 1);
        target = nextYearTarget.getTime();
      }

      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [selectedIdx, activeEvent.targetDate]);

  const IconComp = activeEvent.icon;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 transition-all hover:shadow-md">
      {/* Header Widget */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-700">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Đồng Hồ Đếm Ngược Sự Kiện Chuyên Môn
            </h3>
            <p className="text-[11px] text-slate-400">Mốc thời gian quan trọng trong năm học</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          {DEFAULT_MILESTONES.map((ev, idx) => (
            <button
              key={ev.id}
              onClick={() => setSelectedIdx(idx)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                selectedIdx === idx
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Mục {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Countdown Display */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center space-x-3.5 w-full md:w-auto">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeEvent.color} text-white flex items-center justify-center shadow-md shrink-0`}>
            <IconComp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
              {activeEvent.category}
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-slate-800 mt-1">
              {activeEvent.title}
            </h4>
          </div>
        </div>

        {/* 4 Time Digits */}
        <div className="grid grid-cols-4 gap-2 w-full md:w-auto">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 text-center min-w-[62px]">
            <span className="block text-lg sm:text-xl font-black text-brand-700 font-mono">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngày</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 text-center min-w-[62px]">
            <span className="block text-lg sm:text-xl font-black text-slate-800 font-mono">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giờ</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 text-center min-w-[62px]">
            <span className="block text-lg sm:text-xl font-black text-slate-800 font-mono">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phút</span>
          </div>

          <div className="bg-brand-50 border border-brand-200/60 rounded-2xl p-2.5 text-center min-w-[62px]">
            <span className="block text-lg sm:text-xl font-black text-brand-600 font-mono animate-pulse">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">Giây</span>
          </div>
        </div>
      </div>
    </div>
  );
}
