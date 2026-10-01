import React, { useState } from 'react';
import {
  Bell,
  Send,
  CheckCircle2,
  Users,
  Building2,
  BookOpen,
  Calendar,
  User,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { formatDateTime } from '../../utils/formatters';

export const AdminNotificationsPage: React.FC = () => {
  const { refreshData } = useApp();

  const students = dataService.getStudents();
  const courses = dataService.getCourses();
  const departments = dataService.getDepartments();
  const allNotifications = dataService.getNotifications();

  const [recipientType, setRecipientType] = useState<'ALL' | 'STUDENT' | 'COURSE' | 'DEPARTMENT' | 'SEMESTER'>('ALL');
  const [targetId, setTargetId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notifType, setNotifType] = useState<'FEE_REMINDER' | 'DUE_DATE_ALERT' | 'FEE_STRUCTURE_UPDATE' | 'ANNOUNCEMENT'>('FEE_REMINDER');
  const [dispatchedSuccess, setDispatchedSuccess] = useState<string | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    dataService.addNotification({
      recipientType,
      recipientTargetId: recipientType === 'ALL' ? undefined : targetId,
      title,
      message,
      type: notifType,
    });

    refreshData();
    setDispatchedSuccess(`Notification broadcast successfully to target audience!`);
    setTitle('');
    setMessage('');
    setTimeout(() => setDispatchedSuccess(null), 4000);
  };

  const applyTemplate = (tplTitle: string, tplMsg: string, type: any) => {
    setTitle(tplTitle);
    setMessage(tplMsg);
    setNotifType(type);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Notifications & Broadcast Dispatcher
          </h1>
          <p className="text-xs text-slate-500">
            Publish official fee reminders, deadline announcements, and targeted student notices
          </p>
        </div>
      </div>

      {dispatchedSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{dispatchedSuccess}</span>
        </div>
      )}

      {/* Dispatch Form Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Send className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Compose New Broadcast Notice</h3>
        </div>

        {/* Quick Sample Templates */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Quick Institutional Templates:
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() =>
                applyTemplate(
                  'Semester Fee Payment Deadline is 15 October 2026',
                  'Dear Students, please be informed that the last date for payment of odd semester tuition fees without penalty is 15 October 2026. Please complete payments online.',
                  'DUE_DATE_ALERT'
                )
              }
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-200 transition-colors"
            >
              Deadline 15 Oct Notice
            </button>
            <button
              type="button"
              onClick={() =>
                applyTemplate(
                  'Late Fee Penalty Applicable Post Grace Period',
                  'Notice: Any fee payments made past the scheduled due date and grace period will attract late fee surcharges as per institutional bylaws.',
                  'FEE_REMINDER'
                )
              }
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-200 transition-colors"
            >
              Late Fee Rule Notice
            </button>
            <button
              type="button"
              onClick={() =>
                applyTemplate(
                  'Revised Fee Structure Published for 2026-2027',
                  'The revised fee schedule approved by the College Finance Committee has been published on the student portal.',
                  'FEE_STRUCTURE_UPDATE'
                )
              }
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-200 transition-colors"
            >
              Fee Structure Published
            </button>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4 text-xs">
          {/* Target Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
              <select
                value={recipientType}
                onChange={(e) => {
                  setRecipientType(e.target.value as any);
                  setTargetId('');
                }}
                className="w-full rounded-lg border border-slate-300 p-2.5 font-medium"
              >
                <option value="ALL">All Enrolled Students (College-wide)</option>
                <option value="COURSE">Specific Degree Course</option>
                <option value="DEPARTMENT">Specific Department</option>
                <option value="SEMESTER">Specific Semester</option>
                <option value="STUDENT">Individual Student</option>
              </select>
            </div>

            {recipientType === 'COURSE' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Course</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 font-medium"
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {recipientType === 'DEPARTMENT' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Department</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 font-medium"
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {recipientType === 'SEMESTER' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Semester</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 font-medium"
                >
                  <option value="">-- Choose Semester --</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s.toString()}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {recipientType === 'STUDENT' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Student</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 font-medium"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.regNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Notice Headline *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Semester 5 Fee Payment Portal Open"
                className="w-full rounded-lg border border-slate-300 p-2.5 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alert Classification</label>
              <select
                value={notifType}
                onChange={(e) => setNotifType(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 p-2.5 font-medium"
              >
                <option value="FEE_REMINDER">FEE REMINDER</option>
                <option value="DUE_DATE_ALERT">DUE DATE ALERT</option>
                <option value="FEE_STRUCTURE_UPDATE">FEE STRUCTURE UPDATE</option>
                <option value="ANNOUNCEMENT">COLLEGE ANNOUNCEMENT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Detailed Message *</label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter full notice copy to be delivered to student portal..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-800"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
              Dispatch Notification
            </button>
          </div>
        </form>
      </div>

      {/* Recent Dispatches Log */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Recent Broadcast Log</h3>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {allNotifications.slice(0, 5).map((n) => (
            <div key={n.id} className="py-3 flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900">{n.title}</p>
                <p className="text-slate-600 mt-0.5">{n.message}</p>
                <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  Target: {n.recipientType}
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 shrink-0">
                {formatDateTime(n.date)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
