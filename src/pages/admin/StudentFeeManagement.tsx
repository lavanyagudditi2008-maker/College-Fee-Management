import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  PlusCircle,
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { Student } from '../../types';
import { FeeStatusBadge } from '../../components/common/FeeStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const StudentFeeManagement: React.FC = () => {
  const { refreshData } = useApp();

  const students = dataService.getStudents();
  const courses = dataService.getCourses();
  const departments = dataService.getDepartments();

  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'pending' | 'name' | 'paid'>('pending');

  // Modals state
  const [selectedStudentFeeDetails, setSelectedStudentFeeDetails] = useState<Student | null>(null);
  const [assignFeeModalStudent, setAssignFeeModalStudent] = useState<Student | null>(null);
  const [assignFeeCategory, setAssignFeeCategory] = useState('SPECIAL_EXAM');
  const [assignFeeName, setAssignFeeName] = useState('Special Lab Backlog / Re-exam Fee');
  const [assignFeeAmount, setAssignFeeAmount] = useState(3000);
  const [assignFeeDueDate, setAssignFeeDueDate] = useState('2026-10-30');
  const [reminderSuccessMessage, setReminderSuccessMessage] = useState<string | null>(null);

  const enrichedList = students.map((std) => {
    const summary = dataService.getStudentFeeSummary(std.id);
    const course = courses.find((c) => c.id === std.courseId);
    const dept = departments.find((d) => d.id === std.departmentId);
    return {
      student: std,
      course,
      dept,
      summary,
    };
  });

  const filteredList = enrichedList
    .filter((item) => {
      const s = item.student;
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.course?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse = courseFilter === 'ALL' || s.courseId === courseFilter;
      const matchesDept = deptFilter === 'ALL' || s.departmentId === deptFilter;
      const matchesStatus = statusFilter === 'ALL' || item.summary.overallStatus === statusFilter;

      return matchesSearch && matchesCourse && matchesDept && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'pending') {
        return b.summary.outstandingAmount - a.summary.outstandingAmount;
      }
      if (sortBy === 'paid') {
        return b.summary.totalPaid - a.summary.totalPaid;
      }
      return a.student.name.localeCompare(b.student.name);
    });

  const handleSendReminder = (std: Student, pendingAmount: number) => {
    dataService.addNotification({
      recipientType: 'STUDENT',
      recipientTargetId: std.id,
      title: `Fee Due Reminder: ${formatCurrency(pendingAmount)} Outstanding`,
      message: `Dear ${std.name}, this is a formal reminder to settle your pending semester fees of ${formatCurrency(
        pendingAmount
      )} to avoid exam clearance disruption and additional late fee penalties.`,
      type: 'FEE_REMINDER',
    });
    refreshData();
    setReminderSuccessMessage(`Reminder successfully sent to ${std.name} (${std.regNumber})`);
    setTimeout(() => setReminderSuccessMessage(null), 4000);
  };

  const handleAssignFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignFeeModalStudent || assignFeeAmount <= 0) return;

    dataService.addStudentFeeItem({
      studentId: assignFeeModalStudent.id,
      semester: assignFeeModalStudent.currentSemester,
      academicYear: assignFeeModalStudent.academicYear,
      category: assignFeeCategory as any,
      categoryName: assignFeeName,
      amount: assignFeeAmount,
      dueDate: assignFeeDueDate,
      paidAmount: 0,
      pendingAmount: assignFeeAmount,
      status: 'PENDING',
      lateFeeApplied: 0,
    });

    dataService.addNotification({
      recipientType: 'STUDENT',
      recipientTargetId: assignFeeModalStudent.id,
      title: `New Fee Assigned: ${assignFeeName}`,
      message: `A fee of ${formatCurrency(assignFeeAmount)} has been added to your semester account with due date ${formatDate(assignFeeDueDate)}.`,
      type: 'FEE_STRUCTURE_UPDATE',
    });

    refreshData();
    setAssignFeeModalStudent(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Student Fee Accounts Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Accounts department master overview of student billings, scholarships, collections, and dues
          </p>
        </div>

        {reminderSuccessMessage && (
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{reminderSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or registration number..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">PAID</option>
              <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-700 font-semibold focus:border-blue-500 focus:outline-hidden"
            >
              <option value="pending">Sort: Highest Pending</option>
              <option value="paid">Sort: Highest Paid</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Master Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Active Ledgers: {filteredList.length} students</span>
          <span className="font-mono">Auto-adjusted for scholarships & late penalties</span>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No student ledgers match the selected filters.
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
                  <th className="py-3 px-3 text-right">Gross Fee</th>
                  <th className="py-3 px-3 text-right">Scholarship</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Pending</th>
                  <th className="py-3 px-3 text-right">Late Fee</th>
                  <th className="py-3 px-3 text-right">Total Payable</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredList.map(({ student, course, dept, summary }) => (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                      {student.regNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {student.name}
                    </td>
                    <td className="py-3.5 px-4 max-w-[160px] truncate" title={course?.name}>
                      <span className="font-medium text-slate-800">{course?.code}</span>
                      <span className="text-[10px] text-slate-400 block">{dept?.name}</span>
                    </td>
                    <td className="py-3.5 px-2 text-center font-bold text-slate-700">
                      S{student.currentSemester}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                      {formatCurrency(summary.totalFee)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-medium text-emerald-600">
                      {summary.approvedScholarship > 0 ? `-${formatCurrency(summary.approvedScholarship)}` : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-medium text-emerald-700">
                      {formatCurrency(summary.totalPaid)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold">
                      <span className={summary.pendingFee > 0 ? 'text-rose-600' : 'text-slate-400'}>
                        {formatCurrency(summary.pendingFee)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-rose-600">
                      {summary.totalLateFee > 0 ? `+${formatCurrency(summary.totalLateFee)}` : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(summary.outstandingAmount)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <FeeStatusBadge status={summary.overallStatus} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedStudentFeeDetails(student)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                          title="View Ledger Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setAssignFeeModalStudent(student)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                          title="Assign Individual Fee Head"
                        >
                          <PlusCircle className="h-4 w-4" />
                        </button>
                        {summary.pendingFee > 0 && (
                          <button
                            onClick={() => handleSendReminder(student, summary.outstandingAmount)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                            title="Send Fee Due Notification"
                          >
                            <Bell className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Fee Modal */}
      {assignFeeModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Assign Fee Component</h3>
                <p className="text-xs text-slate-500">
                  {assignFeeModalStudent.name} &bull; {assignFeeModalStudent.regNumber}
                </p>
              </div>
              <button
                onClick={() => setAssignFeeModalStudent(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignFeeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fee Category</label>
                <select
                  value={assignFeeCategory}
                  onChange={(e) => setAssignFeeCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                >
                  <option value="SPECIAL_EXAM">Re-Examination / Backlog Exam Fee</option>
                  <option value="LABORATORY">Special Laboratory Usage Charges</option>
                  <option value="LIBRARY">Library Fine / Book Replacement</option>
                  <option value="HOSTEL">Hostel Extra Amenity Fee</option>
                  <option value="TRANSPORT">Additional Route Bus Surcharge</option>
                  <option value="OTHER">Other Administrative Surcharge</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fee Description</label>
                <input
                  type="text"
                  required
                  value={assignFeeName}
                  onChange={(e) => setAssignFeeName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={assignFeeAmount}
                    onChange={(e) => setAssignFeeAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={assignFeeDueDate}
                    onChange={(e) => setAssignFeeDueDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAssignFeeModalStudent(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-blue-700"
                >
                  Confirm & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Ledger Detail Inspection Modal */}
      {selectedStudentFeeDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedStudentFeeDetails.name}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedStudentFeeDetails.regNumber} &bull; Semester {selectedStudentFeeDetails.currentSemester}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentFeeDetails(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900">Current Semester Fee Items</h4>
              <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {dataService.getStudentFees(selectedStudentFeeDetails.id).map((f) => (
                  <div key={f.id} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-800">{f.categoryName}</p>
                      <p className="text-[10px] text-slate-400">Due: {formatDate(f.dueDate)}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-mono text-slate-700">Total: {formatCurrency(f.amount)}</p>
                        <p className="font-mono text-emerald-600">Paid: {formatCurrency(f.paidAmount)}</p>
                      </div>
                      <div className="w-20 text-right">
                        <FeeStatusBadge status={f.status} size="sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
