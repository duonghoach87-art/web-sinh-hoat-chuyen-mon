import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { ROLE_LABELS } from '../../lib/constants';
import NotificationDropdown from './NotificationDropdown';
import {
  Menu,
  User,
  LogOut,
  School,
  ChevronDown,
  Sliders
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, profile, role, logout, canManage } = useAuth();
  const { settings } = useSettings();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleInfo = ROLE_LABELS[role] || ROLE_LABELS.teacher;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 transition-all print:hidden">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile Toggle & School Branding */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform overflow-hidden">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt="Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <School className="w-5 h-5" />
              )}
            </div>
            <div className="hidden sm:block text-left">
              <h1 className="text-sm font-bold text-slate-800 tracking-tight leading-none group-hover:text-brand-600 transition-colors">
                {settings?.department_name || 'TỔ KHOA HỌC TỰ NHIÊN'}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {settings?.school_name || 'Trường THCS'} • Năm học {settings?.school_year || '2025-2026'}
              </p>
            </div>
          </Link>
        </div>

        {/* Right: Notifications, User Profile & Actions */}
        <div className="flex items-center space-x-3">
          {user && <NotificationDropdown />}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-sm overflow-hidden shrink-0 shadow-2xs">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profile?.full_name?.charAt(0).toUpperCase() || 'GV'
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {profile?.full_name || user.email}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {profile?.duties || roleInfo.label}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
              </button>

              {/* User Dropdown */}
              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{profile?.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-2">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleInfo.color}`}
                        >
                          {roleInfo.label}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/members"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Thông tin thành viên tổ</span>
                    </Link>

                    {canManage && (
                      <Link
                        to="/settings"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                      >
                        <Sliders className="w-4 h-4" />
                        <span>Cài đặt trường & tổ</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-brand-600/20 transition-all"
            >
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
