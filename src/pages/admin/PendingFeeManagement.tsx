import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Bell,
  CheckCircle2,
  Mail,
  Send,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { FeeStatusBadge } from '../../components/common/FeeStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const PendingFeeManagement: React.FC = () => {
  const { refreshData } = useApp();

  const students = dataService.getStudents();
  const courses = dataService.getCourses();
  const departments = dataService.getDepartments();

  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  // Compute student summaries and filter ONLY students with pending balance > 0
  const studentsWithDues = students
    .map((std) => {
      const summary = dataService.getStudentFeeSummary(std.id);
      const course = courses.find((c) => c.id === std.courseId);
      const dept = departments.find((d) => d.id === std.departmentId);
      return {
        student: std,
        course,
        dept,
        summary,
      };
    })
    .filter((item) => item.summary.outstandingAmount > 0)
    .sort((a, b) => b.summary.outstandingAmount - a.summary.outstandingAmount);

  const filtered = studentsWithDues.filter((item) => {
    const s = item.student;
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.course?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = courseFilter === 'ALL' || s.courseId === courseFilter;
    const matchesDept = deptFilter === 'ALL' || s.departmentId === deptFilter;

    return matchesSearch && matchesCourse && matchesDept;
  });

  const totalOutstandingSum = filtered.reduce(
    (sum, item) => sum + item.summary.outstandingAmount,
    0
  );

  const handleSendReminder = (item: typeof studentsWithDues[0]) => {
    dataService.addNotification({
      recipientType: 'STUDENT',
      recipientTargetId: item.student.id,
      title: `Overdue Fee Settlement Notice: ${formatCurrency(item.summary.outstandingAmount)}`,
      message: `Dear ${item.student.name}, please clear your outstanding semester balance of ${formatCurrency(
        item.summary.outstandingAmount
      )} at the earliest. Late fee penalties are actively accruing.`,
      type: 'FEE_REMINDER',
    });
    refreshData();
    setAlertSuccess(`Reminder dispatched to ${item.student.name}`);
    setTimeout(() => setAlertSuccess(null), 3000);
  };

  const handleSendBulkReminder = () => {
    filtered.forEach((item) => {
      dataService.addNotification({
        recipientType: 'STUDENT',
        recipientTargetId: item.student.id,
        title: `Urgent Institutional Fee Clearance Notice`,
        message: `Notice from Kalasalingam Academy Accounts Office: Outstanding fee balance of ${formatCurrency(
          item.summary.outstandingAmount
        )} is pending. Please visit the online payment portal or accounts office immediately.`,
        type: 'FEE_REMINDER',
      });
    });
    refreshData();
    setAlertSuccess(`Bulk reminders sent to all ${filtered.length} students with outstanding fees!`);
    setTimeout(() => setAlertSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Pending & Overdue Fee Management
          </h1>
          <p className="text-xs text-slate-500">
            Monitor students with unsettled fees, prioritize recovery by highest balance, and issue payment alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-900 shadow-2xs">
            <span>Outstanding Pool: </span>
            <span className="font-mono text-base font-bold text-rose-700 ml-1">
              {formatCurrency(totalOutstandingSum)}
            </span>
          </div>

          {filtered.length > 0 && (
            <button
              onClick={handleSendBulkReminder}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
            >
              <Send className="h-3.5 w-3.5" />
              Remind All ({filtered.length})
            </button>
          )}
        </div>
      </div>

      {alertSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{alertSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search students with pending fees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-2" />
            <h4 className="text-base font-bold text-slate-900">Zero Outstanding Dues</h4>
            <p className="text-xs text-slate-400">All student accounts under this filter are fully settled.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Reg No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Course & Dept</th>
                  <th className="py-3 px-2 text-center">Sem</th>
                  <th className="py-3 px-3 text-right">Net Fee</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Pending Fee</th>
                  <th className="py-3 px-3 text-right">Late Fee</th>
                  <th className="py-3 px-3 text-right">Total Payable</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map(({ student, course, dept, summary }) => (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                      {student.regNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {student.name}
                    </td>
                    <td className="py-3.5 px-4 max-w-[160px] truncate" title={course?.name}>
                      <span className="font-semibold text-slate-800">{course?.code}</span>
                      <span className="text-[10px] text-slate-400 block">{dept?.name}</span>
                    </td>
                    <td className="py-3.5 px-2 text-center font-bold text-slate-700">
                      S{student.currentSemester}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      {formatCurrency(summary.netFee)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-medium text-emerald-600">
                      {formatCurrency(summary.totalPaid)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600">
                      {formatCurrency(summary.pendingFee)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-rose-600">
                      {summary.totalLateFee > 0 ? `+${formatCurrency(summary.totalLateFee)}` : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900 text-sm">
                      {formatCurrency(summary.outstandingAmount)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <FeeStatusBadge status={summary.overallStatus} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleSendReminder({ student, course, dept, summary })}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                        title="Send Fee Reminder Alert"
                      >
                        <Bell className="h-3 w-3" />
                        Remind
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
