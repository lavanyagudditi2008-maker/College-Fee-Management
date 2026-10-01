import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Layers,
  Megaphone,
  CheckCheck,
  MailOpen,
  Mail,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../utils/formatters';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    markNotifAsRead,
    markAllNotifsAsRead,
    unreadNotifsCount,
  } = useApp();

  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredNotifs = notifications.filter(
    (n) => filterType === 'ALL' || n.type === filterType
  );

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT_CONFIRMATION':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'DUE_DATE_ALERT':
      case 'FEE_REMINDER':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'PAYMENT_FAILURE':
        return <AlertTriangle className="h-5 w-5 text-rose-600" />;
      case 'FEE_STRUCTURE_UPDATE':
        return <Layers className="h-5 w-5 text-blue-600" />;
      default:
        return <Megaphone className="h-5 w-5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Notifications & Fee Alerts
          </h1>
          <p className="text-xs text-slate-500">
            Real-time updates regarding due dates, payment confirmations, and published fee structures
          </p>
        </div>

        {unreadNotifsCount > 0 && (
          <button
            onClick={markAllNotifsAsRead}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <CheckCheck className="h-4 w-4 text-blue-600" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { id: 'ALL', label: 'All Alerts' },
          { id: 'DUE_DATE_ALERT', label: 'Due Date Alerts' },
          { id: 'FEE_REMINDER', label: 'Fee Reminders' },
          { id: 'PAYMENT_CONFIRMATION', label: 'Payment Receipts' },
          { id: 'FEE_STRUCTURE_UPDATE', label: 'Fee Schedules' },
          { id: 'ANNOUNCEMENT', label: 'Announcements' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilterType(t.id)}
            className={`rounded-full px-3.5 py-1.5 font-semibold transition-all ${
              filterType === t.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden divide-y divide-slate-100">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Bell className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            No notifications found under this category.
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotifAsRead(n.id)}
              className={`p-5 transition-colors cursor-pointer hover:bg-slate-50/80 flex items-start gap-4 ${
                !n.isRead ? 'bg-blue-50/40' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                {getNotifIcon(n.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs ${!n.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                    {n.title}
                  </h4>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                    {formatDateTime(n.date)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                <div className="pt-1 flex items-center gap-3">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {n.type.replace(/_/g, ' ')}
                  </span>
                  {!n.isRead ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600">
                      <Mail className="h-3 w-3" /> Unread
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <MailOpen className="h-3 w-3" /> Read
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
