import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'blue', description, onClick }) {
  const colorSchemes = {
    blue: {
      bg: 'bg-brand-50',
      text: 'text-brand-700',
      border: 'border-brand-100',
      iconBg: 'bg-brand-500 text-white'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-500 text-white'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100',
      iconBg: 'bg-amber-500 text-white'
    },
    sky: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-100',
      iconBg: 'bg-sky-500 text-white'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between ${
        onClick ? 'cursor-pointer hover:border-brand-300' : ''
      }`}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        {description && <p className="text-xs text-slate-400">{description}</p>}
      </div>
      {Icon && (
        <div className={`p-3 rounded-xl ${scheme.iconBg} shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
