import React from 'react';
import {
  LayoutDashboard,
  User,
  Layers,
  CalendarDays,
  Clock,
  CreditCard,
  History,
  Receipt,
  Bell,
  Users,
  BookOpen,
  Building2,
  FileSpreadsheet,
  Award,
  AlertCircle,
  Home,
  Bus,
  BarChart3,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LucideIcon } from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { role, activePage, setActivePage, logout, unreadNotifsCount } = useApp();

  const handleNavClick = (pageId: string) => {
    setActivePage(pageId);
    onCloseMobile();
  };

  // Nav definitions per role
  const studentNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Full Profile & All Fees', icon: User },
    { id: 'fee-structure', label: 'Fee Structure', icon: Layers },
    { id: 'semester-fees', label: 'Semester Fees', icon: CalendarDays },
    { id: 'pending-fees', label: 'Pending Fees', icon: Clock },
    { id: 'make-payment', label: 'Make Payment', icon: CreditCard },
    { id: 'payment-history', label: 'Payment History', icon: History },
    { id: 'fee-receipts', label: 'Fee Receipts', icon: Receipt },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount },
  ];

  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'fee-structures', label: 'Fee Structures', icon: Layers },
    { id: 'student-fees', label: 'Student Fees', icon: FileSpreadsheet },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'pending-fees', label: 'Pending Fees', icon: Clock },
    { id: 'scholarships', label: 'Scholarships', icon: Award },
    { id: 'late-fees', label: 'Late Fees', icon: AlertCircle },
    { id: 'hostel', label: 'Hostel Fees', icon: Home },
    { id: 'transport', label: 'Transport Fees', icon: Bus },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'admin-notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const accountsNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'student-fees', label: 'Student Fees', icon: FileSpreadsheet },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'pending-fees', label: 'Pending Fees', icon: Clock },
    { id: 'fee-receipts', label: 'Receipts', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'admin-notifications', label: 'Notifications', icon: Bell },
  ];

  const items =
    role === 'STUDENT'
      ? studentNavItems
      : role === 'ADMIN'
      ? adminNavItems
      : accountsNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`no-print fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between pb-3 lg:hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
            <button onClick={onCloseMobile} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Portal View</p>
            <p className="text-xs font-bold text-slate-800">
              {role === 'STUDENT' ? 'Student Self-Service' : role === 'ADMIN' ? 'Administration ERP' : 'Accounts & Finance'}
            </p>
          </div>

          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive ? 'bg-white text-blue-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="border-t border-slate-200 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
