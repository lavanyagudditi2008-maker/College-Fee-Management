import React, { useState } from 'react';
import {
  Bell,
  GraduationCap,
  LogOut,
  Menu,
  Shield,
  User,
  CheckCheck,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../utils/formatters';
import { dataService } from '../../services/dataService';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    role,
    currentStudent,
    logout,
    settings,
    notifications,
    unreadNotifsCount,
    markNotifAsRead,
    markAllNotifsAsRead,
    switchRoleQuick,
    resetAllData,
    setActivePage,
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const studentsList = dataService.getStudents();

  return (
    <header className="no-print sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white shadow-xs">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">
                {settings.collegeName}
              </span>
              <span className="hidden sm:inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                ERP Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Academic Year: <span className="font-semibold text-slate-700">{settings.currentAcademicYear}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Demo Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
            title="Switch Demo Role & Student"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="hidden md:inline text-slate-500">Demo Role:</span>
            <span className="font-bold text-blue-900">
              {role === 'STUDENT' ? (currentStudent ? currentStudent.name.split(' ')[0] : 'Student') : role}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Demo Persona
                </p>
                <p className="text-xs text-slate-500">1-click switch between realistic accounts:</p>
              </div>

              <div className="py-1 space-y-1">
                <button
                  onClick={() => {
                    switchRoleQuick('ADMIN');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium hover:bg-slate-50 ${
                    role === 'ADMIN' ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span>Administrator (Full Access)</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">admin</span>
                </button>

                <button
                  onClick={() => {
                    switchRoleQuick('ACCOUNTS');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium hover:bg-slate-50 ${
                    role === 'ACCOUNTS' ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-600" />
                    <span>Accounts Staff</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">accounts</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-2 pb-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Demo Students
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {studentsList.slice(0, 5).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        switchRoleQuick('STUDENT', s.regNumber);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs hover:bg-slate-50 ${
                        role === 'STUDENT' && currentStudent?.id === s.id
                          ? 'bg-blue-50 text-blue-900 font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate pr-1">
                        <p className="truncate font-semibold">{s.name}</p>
                        <p className="text-[10px] text-slate-400">Sem {s.currentSemester} &bull; {s.regNumber}</p>
                      </div>
                      {s.regNumber === '2026CSE002' && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                          Scholarship
                        </span>
                      )}
                      {s.regNumber === '2026ECE001' && (
                        <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                          Overdue
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2 px-1">
                <button
                  onClick={() => {
                    resetAllData();
                    setShowRoleMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset to Fresh Demo Data
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowRoleMenu(false);
            }}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Notifications
                  </span>
                  {unreadNotifsCount > 0 && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                      {unreadNotifsCount} new
                    </span>
                  )}
                </div>
                {unreadNotifsCount > 0 && (
                  <button
                    onClick={markAllNotifsAsRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotifAsRead(n.id)}
                      className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 ${
                        !n.isRead ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{n.message}</p>
                      <p className="mt-1.5 text-[10px] font-mono text-slate-400">
                        {formatDateTime(n.date)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100 p-2 text-center bg-slate-50/50">
                <button
                  onClick={() => {
                    setActivePage('notifications');
                    setShowNotifMenu(false);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View All Notifications &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Identity Chip & Logout */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <div
            onClick={() => role === 'STUDENT' && setActivePage('profile')}
            className={`hidden sm:block text-right ${
              role === 'STUDENT' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
            }`}
            title={role === 'STUDENT' ? 'View Full Profile & All Fees' : undefined}
          >
            <p className="text-xs font-bold text-slate-900 flex items-center justify-end gap-1">
              {role === 'STUDENT'
                ? currentStudent?.name || 'Student'
                : role === 'ADMIN'
                ? 'System Administrator'
                : 'Accounts Officer'}
            </p>
            <p className="text-[10px] text-slate-500">
              {role === 'STUDENT' ? `${currentStudent?.regNumber} • Full Profile & All Fees` : 'Staff ERP'}
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors"
            title="Log Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
