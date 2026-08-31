import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import IntroductionPage from '../pages/department/IntroductionPage';
import MembersPage from '../pages/department/MembersPage';
import OfficialDocumentsPage from '../pages/documents/OfficialDocumentsPage';
import DepartmentPlansPage from '../pages/documents/DepartmentPlansPage';
import MeetingMinutesPage from '../pages/activities/MeetingMinutesPage';
import SubjectTopicsPage from '../pages/activities/SubjectTopicsPage';
import TeachingRegistrationsPage from '../pages/activities/TeachingRegistrationsPage';
import ExamBankPage from '../pages/resources/ExamBankPage';
import VirtualLabsPage from '../pages/resources/VirtualLabsPage';
import EmulationPage from '../pages/emulation/EmulationPage';
import SettingsPage from '../pages/settings/SettingsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main Application with Sidebar & Topbar Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="intro" element={<IntroductionPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="official-documents" element={<OfficialDocumentsPage />} />
        <Route path="department-plans" element={<DepartmentPlansPage />} />
        <Route path="meeting-minutes" element={<MeetingMinutesPage />} />
        <Route path="subject-topics" element={<SubjectTopicsPage />} />
        <Route path="teaching-registrations" element={<TeachingRegistrationsPage />} />
        <Route path="exam-bank" element={<ExamBankPage />} />
        <Route path="virtual-labs" element={<VirtualLabsPage />} />
        <Route path="emulation" element={<EmulationPage />} />
        <Route
          path="settings"
          element={
            <ProtectedRoute allowedRoles={['admin', 'head_teacher']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
