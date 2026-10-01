/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ReceiptModal } from './components/common/ReceiptModal';
import { PaymentModal } from './components/common/PaymentModal';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfile } from './pages/student/StudentProfile';
import { FeeStructurePage } from './pages/student/FeeStructurePage';
import { SemesterFeesPage } from './pages/student/SemesterFeesPage';
import { PendingFeesPage } from './pages/student/PendingFeesPage';
import { MakePaymentPage } from './pages/student/MakePaymentPage';
import { PaymentHistoryPage } from './pages/student/PaymentHistoryPage';
import { FeeReceiptsPage } from './pages/student/FeeReceiptsPage';
import { NotificationsPage } from './pages/student/NotificationsPage';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentsManagement } from './pages/admin/StudentsManagement';
import { CourseManagement } from './pages/admin/CourseManagement';
import { DepartmentManagement } from './pages/admin/DepartmentManagement';
import { FeeStructureManagement } from './pages/admin/FeeStructureManagement';
import { StudentFeeManagement } from './pages/admin/StudentFeeManagement';
import { PaymentManagement } from './pages/admin/PaymentManagement';
import { PendingFeeManagement } from './pages/admin/PendingFeeManagement';
import { ScholarshipManagement } from './pages/admin/ScholarshipManagement';
import { LateFeeManagement } from './pages/admin/LateFeeManagement';
import { HostelTransportManagement } from './pages/admin/HostelTransportManagement';
import { ReportsPage } from './pages/admin/ReportsPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

const AppContent: React.FC = () => {
  const { role, activePage, selectedReceipt, closeReceiptModal } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If user is not authenticated or explicitly at login
  if (!role || activePage === 'login') {
    return <LoginPage />;
  }

  const renderPage = () => {
    // Student Routes
    if (role === 'STUDENT') {
      switch (activePage) {
        case 'dashboard':
          return <StudentDashboard />;
        case 'profile':
          return <StudentProfile />;
        case 'fee-structure':
          return <FeeStructurePage />;
        case 'semester-fees':
          return <SemesterFeesPage />;
        case 'pending-fees':
          return <PendingFeesPage />;
        case 'make-payment':
          return <MakePaymentPage />;
        case 'payment-history':
          return <PaymentHistoryPage />;
        case 'fee-receipts':
          return <FeeReceiptsPage />;
        case 'notifications':
          return <NotificationsPage />;
        default:
          return <StudentDashboard />;
      }
    }

    // Admin & Accounts Staff Routes
    switch (activePage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'students':
        return <StudentsManagement />;
      case 'courses':
        return <CourseManagement />;
      case 'departments':
        return <DepartmentManagement />;
      case 'fee-structures':
        return <FeeStructureManagement />;
      case 'student-fees':
        return <StudentFeeManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'pending-fees':
        return <PendingFeeManagement />;
      case 'scholarships':
        return <ScholarshipManagement />;
      case 'late-fees':
        return <LateFeeManagement />;
      case 'hostel':
      case 'transport':
        return <HostelTransportManagement />;
      case 'reports':
        return <ReportsPage />;
      case 'admin-notifications':
        return <AdminNotificationsPage />;
      case 'fee-receipts':
        return <FeeReceiptsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen((o) => !o)} />

      {/* Main Workspace with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <ReceiptModal receipt={selectedReceipt} onClose={closeReceiptModal} />
      <PaymentModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
