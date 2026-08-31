import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import AppRoutes from './routes/AppRoutes';

function DocumentTitleSync() {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings?.school_name) {
      document.title = `${settings.department_name || 'Tổ Khoa Học Tự Nhiên'} • ${settings.school_name}`;
    } else {
      document.title = 'Cổng Thông Tin & Quản Lý Tổ Chuyên Môn KHTN - Cấp THCS';
    }
  }, [settings?.school_name, settings?.department_name]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <DocumentTitleSync />
          <AppRoutes />
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
