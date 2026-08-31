import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Đang kiểm tra quyền truy cập..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 m-6 shadow-sm">
        <h3 className="text-lg font-bold text-rose-600 mb-2">Quyền Truy Cập Bị Giới Hạn</h3>
        <p className="text-sm text-slate-600">
          Chức năng này chỉ dành cho Ban Giám Hiệu hoặc Tổ Trưởng chuyên môn.
        </p>
      </div>
    );
  }

  return children;
}
