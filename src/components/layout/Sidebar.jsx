import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import {
  LayoutDashboard,
  Info,
  Users,
  FileText,
  CalendarDays,
  FileCheck2,
  BookOpen,
  GraduationCap,
  FolderArchive,
  Atom,
  Award,
  ChevronRight,
  Sliders
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { canManage } = useAuth();
  const { settings } = useSettings();

  const navigationGroups = [
    {
      group: 'Tổng Quan',
      items: [
        { name: 'Bảng Điều Khiển', path: '/', icon: LayoutDashboard }
      ]
    },
    {
      group: 'Tổ Chuyên Môn & Nhân Sự',
      items: [
        { name: 'Giới Thiệu Tổ KHTN (TT 32)', path: '/intro', icon: Info },
        { name: 'Danh Sách Giáo Viên', path: '/members', icon: Users }
      ]
    },
    {
      group: 'Hành Chính & Kế Hoạch',
      items: [
        { name: 'Văn Bản Cấp Trên', path: '/official-documents', icon: FileText },
        { name: 'Kế Hoạch Của Tổ', path: '/department-plans', icon: CalendarDays }
      ]
    },
    {
      group: 'Sinh Hoạt & Thao Giảng',
      items: [
        { name: 'Biên Bản Họp Tổ', path: '/meeting-minutes', icon: FileCheck2 },
        { name: 'Sinh Hoạt Chuyên Đề', path: '/subject-topics', icon: BookOpen },
        { name: 'Đăng Ký Thao Giảng', path: '/teaching-registrations', icon: GraduationCap }
      ]
    },
    {
      group: 'Kho Học Liệu & Đề Thi',
      items: [
        { name: 'Ngân Hàng Đề & Ma Trận', path: '/exam-bank', icon: FolderArchive },
        { name: 'Thí Nghiệm Ảo PhET KHTN', path: '/virtual-labs', icon: Atom }
      ]
    },
    {
      group: 'Đánh Giá & Thi Đua',
      items: [
        { name: 'Thi Đua Tổ Chuyên Môn', path: '/emulation', icon: Award }
      ]
    },
    ...(canManage
      ? [
          {
            group: 'Quản Trị Hệ Thống',
            items: [
              { name: 'Cài Đặt Trường & Tổ', path: '/settings', icon: Sliders }
            ]
          }
        ]
      : [])
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden print:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 print:hidden`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Atom className="w-5 h-5 text-brand-200" />
            </div>
            <span className="font-bold text-sm tracking-wide text-white">
              KHOA HỌC TỰ NHIÊN
            </span>
          </div>
        </div>

        {/* Navigation Groups List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {group.group}
              </div>
              <div className="space-y-0.5 mt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                            : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                        }`
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Status - Đồng bộ trực tiếp với Cài Đặt (school_year) */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-center">
          <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Hệ Thống Trực Tuyến {settings?.school_year || '2026-2027'}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
