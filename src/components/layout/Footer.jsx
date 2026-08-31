import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { School, ShieldCheck, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-6 px-4 sm:px-6 text-slate-500 text-xs print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-slate-700 font-bold">
            <School className="w-4 h-4 text-brand-600 shrink-0" />
            <span>{settings?.school_name || 'TRƯỜNG THCS'} • {settings?.department_name || 'TỔ KHOA HỌC TỰ NHIÊN'}</span>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-4 text-[11px] text-slate-400">
            {settings?.address && (
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{settings.address}</span>
              </span>
            )}
            {settings?.phone_number && (
              <span className="flex items-center space-x-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{settings.phone_number}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
          <span>Thông tư 15/2026/TT-BGDĐT</span>
          <span>&bull;</span>
          <div className="flex items-center space-x-1 text-emerald-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Supabase RLS Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
