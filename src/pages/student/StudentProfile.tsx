import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Users,
  Home,
  Bus,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  CreditCard,
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Layers,
  FileSpreadsheet,
  Filter,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { FeeStatusBadge } from '../../components/common/FeeStatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';

export const StudentProfile: React.FC = () => {
  const { currentStudent, openPaymentModal, openReceiptModal, settings } = useApp();

  // Navigation tab within the profile: All-in-One is the primary view so students see both profile and all fees
  const [activeTab, setActiveTab] = useState<'ALL_IN_ONE' | 'ALL_FEES' | 'PROFILE' | 'RECEIPTS'>('ALL_IN_ONE');
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL');

  if (!currentStudent) {
    return (
      <div className="p-8 text-center text-slate-500">
        Student profile not found. Please log in as a student.
      </div>
    );
  }

  const course = dataService.getCourses().find((c) => c.id === currentStudent.courseId);
  const department = dataService.getDepartments().find((d) => d.id === currentStudent.departmentId);

  // Dynamic fee calculations from ledger across all semesters from 1st Year
  const summary = dataService.getStudentFeeSummary(currentStudent.id);
  const allStudentFees = dataService.getStudentFees(currentStudent.id);
  const scholarships = dataService.getScholarships(currentStudent.id);
  const payments = dataService.getPayments(currentStudent.id);
  const receipts = dataService.getReceipts(currentStudent.id);

  // Filtered fees
  const filteredFees = allStudentFees.filter((f) => {
    return semesterFilter === 'ALL' || f.semester.toString() === semesterFilter;
  });

  const availableSemesters = Array.from(
    new Set(allStudentFees.map((f) => f.semester))
  ).sort((a, b) => a - b);

  // Calculate semester breakdown summaries for milestone progression
  const sem1Fees = allStudentFees.filter((f) => f.semester === 1);
  const sem2Fees = allStudentFees.filter((f) => f.semester === 2);
  const sem3Fees = allStudentFees.filter((f) => f.semester === 3);

  const getSemStats = (fees: typeof allStudentFees) => {
    const total = fees.reduce((sum, f) => sum + f.amount, 0);
    const paid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const pending = fees.reduce((sum, f) => sum + f.pendingAmount, 0);
    const isPaid = total > 0 && pending === 0;
    const isPartiallyPaid = paid > 0 && pending > 0;
    const isOverdue = fees.some((f) => f.status === 'OVERDUE');
    return { total, paid, pending, isPaid, isPartiallyPaid, isOverdue };
  };

  const sem1Stats = getSemStats(sem1Fees);
  const sem2Stats = getSemStats(sem2Fees);
  const sem3Stats = getSemStats(sem3Fees);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ======================================================== */}
      {/* 1. TOP STUDENT HEADER DOSSIER BANNER                    */}
      {/* ======================================================== */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Student Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-700 to-indigo-900 text-white font-black text-2xl shadow-md ring-4 ring-blue-100">
              {currentStudent.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black text-slate-900">{currentStudent.name}</h1>
                <FeeStatusBadge status={currentStudent.status} size="sm" />
                <FeeStatusBadge status={summary.overallStatus} size="sm" />
              </div>

              <p className="text-xs text-slate-600 font-semibold">
                {course?.name} &bull; Dept: {department?.name} ({department?.code})
              </p>

              {/* Prominent Academic & Enrollment Highlights */}
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 font-bold text-blue-900 border border-blue-200">
                  <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                  Year of Study: 2nd Year (Semester 3)
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 font-mono font-bold text-slate-800">
                  Reg: {currentStudent.regNumber}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-slate-700">
                  Roll: {currentStudent.rollNumber}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                  Batch: {currentStudent.batch} (Sec {currentStudent.section})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Pay / Clearance Action in Top Banner */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {summary.pendingFee > 0 ? (
              <button
                onClick={() =>
                  openPaymentModal({
                    studentId: currentStudent.id,
                    semester: currentStudent.currentSemester,
                    category: 'All Pending Fees',
                    maxAmount: summary.pendingFee,
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors active:scale-95"
              >
                <CreditCard className="h-4 w-4" />
                Pay Pending Fees ({formatCurrency(summary.pendingFee)})
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                All Fees Cleared through Sem 3!
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation Pill: Clearly shows All-in-One vs Deep Dives */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex rounded-xl bg-slate-100 p-1 flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('ALL_IN_ONE')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === 'ALL_IN_ONE'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Full Profile & All Fees (All-in-One)
            </button>

            <button
              onClick={() => setActiveTab('ALL_FEES')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === 'ALL_FEES'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-blue-600" />
              All Fees Ledger (Sem 1 to Sem 3)
            </button>

            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === 'PROFILE'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="h-3.5 w-3.5 text-slate-500" />
              Personal & Academic Records
            </button>

            <button
              onClick={() => setActiveTab('RECEIPTS')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === 'RECEIPTS'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="h-3.5 w-3.5 text-emerald-600" />
              Official Receipts ({receipts.length})
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Lock className="h-3.5 w-3.5 text-amber-600" />
            <span>{settings.collegeName} &bull; Official Student ERP</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SEMESTER PROGRESSION MILESTONES (1st Year to 2nd Year)*/}
      {/* (Visible in ALL_IN_ONE and ALL_FEES modes)              */}
      {/* ======================================================== */}
      {(activeTab === 'ALL_IN_ONE' || activeTab === 'ALL_FEES') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-900" />
              <h2 className="text-base font-bold text-slate-900">
                Semester Fee Timeline (from 1st Year Sem 1 to 2nd Year Sem 3)
              </h2>
            </div>
            <span className="text-xs font-semibold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              Current Enrolled: 2nd Year, 3rd Semester
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Semester 1 Milestone Card */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  <CheckCheck className="h-3 w-3" />
                  1st Year &bull; Semester 1
                </span>
                <span className="text-[11px] font-mono text-slate-400">AY 2025-2026</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">1st Sem of 1st Year</p>
              <p className="mt-1 font-mono text-2xl font-black text-slate-900">
                {formatCurrency(sem1Stats.total)}
              </p>
              <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 100% Cleared
                </span>
                {receipts.find((r) => r.semester === 1) && (
                  <button
                    onClick={() => {
                      const r = receipts.find((rec) => rec.semester === 1);
                      if (r) openReceiptModal(r);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
                  >
                    View Receipt &rarr;
                  </button>
                )}
              </div>
            </div>

            {/* Semester 2 Milestone Card */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  <CheckCheck className="h-3 w-3" />
                  1st Year &bull; Semester 2
                </span>
                <span className="text-[11px] font-mono text-slate-400">AY 2025-2026</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">2nd Sem of 1st Year</p>
              <p className="mt-1 font-mono text-2xl font-black text-slate-900">
                {formatCurrency(sem2Stats.total)}
              </p>
              <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 100% Cleared
                </span>
                {receipts.find((r) => r.semester === 2) && (
                  <button
                    onClick={() => {
                      const r = receipts.find((rec) => rec.semester === 2);
                      if (r) openReceiptModal(r);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
                  >
                    View Receipt &rarr;
                  </button>
                )}
              </div>
            </div>

            {/* Semester 3 Milestone Card (CURRENT) */}
            <div className={`rounded-2xl border p-5 shadow-md relative overflow-hidden ${
              sem3Stats.isOverdue
                ? 'border-rose-300 bg-rose-50/30 ring-1 ring-rose-200'
                : sem3Stats.pending > 0
                ? 'border-blue-300 bg-blue-50/30 ring-1 ring-blue-200'
                : 'border-emerald-200 bg-white'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-2xs">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  2nd Year &bull; Semester 3 (Current)
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">AY 2026-2027</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">3rd Sem of 2nd Year</p>
              <div className="mt-1 flex items-baseline justify-between">
                <p className="font-mono text-2xl font-black text-slate-900">
                  {formatCurrency(sem3Stats.total)}
                </p>
                {sem3Stats.pending > 0 && (
                  <span className="text-xs font-mono font-bold text-rose-600">
                    Pending: {formatCurrency(sem3Stats.pending)}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="font-bold">
                  {sem3Stats.pending === 0 ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Fully Paid
                    </span>
                  ) : sem3Stats.isOverdue ? (
                    <span className="text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Overdue Balance
                    </span>
                  ) : (
                    <span className="text-blue-700 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Pending Due
                    </span>
                  )}
                </span>

                {sem3Stats.pending > 0 && (
                  <button
                    onClick={() =>
                      openPaymentModal({
                        studentId: currentStudent.id,
                        semester: 3,
                        category: 'Semester 3 Outstanding Balance',
                        maxAmount: sem3Stats.pending,
                      })
                    }
                    className="rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-blue-700"
                  >
                    Pay Sem 3 &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. DYNAMIC FINANCIAL TOTALS (KPI CARDS)                  */}
      {/* ======================================================== */}
      {(activeTab === 'ALL_IN_ONE' || activeTab === 'ALL_FEES') && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Gross Fee
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-slate-900">
              {formatCurrency(summary.totalFee)}
            </p>
            <span className="text-[10px] text-slate-400">Sem 1 to Sem 3</span>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Scholarship / Waiver
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-emerald-700">
              {summary.approvedScholarship > 0 ? `-${formatCurrency(summary.approvedScholarship)}` : '₹0'}
            </p>
            <span className="text-[10px] text-emerald-600">Deducted from fee</span>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
              Net Payable
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-blue-950">
              {formatCurrency(summary.netFee)}
            </p>
            <span className="text-[10px] text-blue-600">Net after concession</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Amount Paid
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-emerald-600">
              {formatCurrency(summary.totalPaid)}
            </p>
            <span className="text-[10px] text-slate-400">{summary.collectionPercentage}% Settled</span>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">
              Pending Balance
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-rose-600">
              {formatCurrency(summary.pendingFee)}
            </p>
            <span className="text-[10px] text-rose-500">Current Sem 3</span>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
              Overdue / Late Fee
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-amber-700">
              {formatCurrency(summary.overdueAmount)}
            </p>
            <span className="text-[10px] text-amber-600">+{formatCurrency(summary.totalLateFee)} late fee</span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SCHOLARSHIP BANNER (IF ANY)                          */}
      {/* ======================================================== */}
      {(activeTab === 'ALL_IN_ONE' || activeTab === 'ALL_FEES') && scholarships.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-950 mb-2">
            <Award className="h-4 w-4 text-amber-600" />
            <span>Scholarships & Fee Concessions Applied for this Student</span>
          </div>
          <div className="divide-y divide-emerald-200/60">
            {scholarships.map((s) => (
              <div key={s.id} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-emerald-950">{s.scholarshipName}</p>
                  <p className="text-[11px] text-emerald-800">
                    Category: {s.type} &bull; Eligibility: {s.eligibility} &bull; Academic Year: {s.academicYear}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-emerald-900 text-sm">
                    {formatCurrency(s.approvedAmount)}
                  </p>
                  <span className="rounded bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. ITEMIZED FEE LEDGER TABLE (SEM 1 TO SEM 3)           */}
      {/* ======================================================== */}
      {(activeTab === 'ALL_IN_ONE' || activeTab === 'ALL_FEES') && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Itemized Fee Ledger (From 1st Year Sem 1 to 2nd Year Sem 3)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Every fee head registered for student {currentStudent.name} ({currentStudent.regNumber})
                </p>
              </div>
            </div>

            {/* Semester Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Filter Semester:</span>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-blue-900 focus:border-blue-500 focus:outline-hidden shadow-2xs"
              >
                <option value="ALL">All Semesters (Sem 1 to Sem 3)</option>
                {availableSemesters.map((s) => (
                  <option key={s} value={s.toString()}>
                    {s === 1
                      ? '1st Year - Semester 1 (AY 2025-2026)'
                      : s === 2
                      ? '1st Year - Semester 2 (AY 2025-2026)'
                      : `2nd Year - Semester 3 (AY 2026-2027) [Current]`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Academic Year</th>
                  <th className="py-3 px-4">Fee Head / Description</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-4 text-right">Gross Fee</th>
                  <th className="py-3 px-4 text-right">Paid Amount</th>
                  <th className="py-3 px-4 text-right">Pending Due</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-900">
                      {fee.semester === 1 && '1st Yr Sem 1'}
                      {fee.semester === 2 && '1st Yr Sem 2'}
                      {fee.semester === 3 && (
                        <span className="inline-flex items-center gap-1 font-bold text-blue-950">
                          2nd Yr Sem 3
                          <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-blue-800">
                            Current
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {fee.academicYear}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {fee.categoryName}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600">
                      {formatDate(fee.dueDate)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                      {formatCurrency(fee.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-emerald-600">
                      {formatCurrency(fee.paidAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className={fee.pendingAmount > 0 ? 'text-rose-600' : 'text-slate-400'}>
                        {formatCurrency(fee.pendingAmount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <FeeStatusBadge status={fee.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {fee.pendingAmount > 0 ? (
                        <button
                          onClick={() =>
                            openPaymentModal({
                              studentId: currentStudent.id,
                              semester: fee.semester,
                              category: fee.categoryName,
                              maxAmount: fee.pendingAmount,
                            })
                          }
                          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition-colors"
                        >
                          Pay
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50/90 font-bold text-slate-900">
                  <td colSpan={4} className="py-3.5 px-4 uppercase text-xs">
                    Filtered Totals ({filteredFees.length} Fee Items):
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm">
                    {formatCurrency(filteredFees.reduce((sum, f) => sum + f.amount, 0))}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm text-emerald-600">
                    {formatCurrency(filteredFees.reduce((sum, f) => sum + f.paidAmount, 0))}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm text-rose-600">
                    {formatCurrency(filteredFees.reduce((sum, f) => sum + f.pendingAmount, 0))}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. VERIFIED PAYMENT RECEIPTS (SEM 1, 2, 3)              */}
      {/* ======================================================== */}
      {(activeTab === 'ALL_IN_ONE' || activeTab === 'RECEIPTS') && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Issued Official Fee Receipts for {currentStudent.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Verified receipts for payments from 1st Year Sem 1 onwards (View, Print & Download)
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {receipts.length} verified receipts
            </span>
          </div>

          {receipts.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No fee receipts issued yet. Receipts appear as payments are completed.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {receipts.map((r) => (
                <div
                  key={r.receiptNumber}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-blue-900">{r.receiptNumber}</span>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        {r.semester === 1
                          ? '1st Year Sem 1'
                          : r.semester === 2
                          ? '1st Year Sem 2'
                          : '2nd Year Sem 3 (Current)'}{' '}
                        &bull; {r.paymentMethod.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                      {formatCurrency(r.totalAmountPaid)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">{formatDateTime(r.paymentDate)}</p>
                  <button
                    onClick={() => openReceiptModal(r)}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-900 transition-colors shadow-2xs"
                  >
                    <Receipt className="h-3.5 w-3.5 text-blue-600" />
                    View & Print Official Receipt
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. PERSONAL & ACADEMIC CREDENTIALS DOSSIER              */}
      {/* (Visible in ALL_IN_ONE and PROFILE modes)               */}
      {/* ======================================================== */}
      {(activeTab === 'ALL_IN_ONE' || activeTab === 'PROFILE') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pt-2">
            <User className="h-5 w-5 text-blue-900" />
            <h2 className="text-base font-bold text-slate-900">
              Personal, Academic & Guardian Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
                  <p className="text-[10px] text-slate-400">Verified identity details</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Full Name</p>
                  <p className="font-semibold text-slate-800">{currentStudent.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Date of Birth</p>
                  <p className="font-semibold text-slate-800">{formatDate(currentStudent.dob)}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Gender</p>
                  <p className="font-semibold text-slate-800">{currentStudent.gender}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Mobile Number</p>
                  <p className="font-mono font-semibold text-slate-800">{currentStudent.mobile}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Alternate Mobile</p>
                  <p className="font-mono text-slate-700">{currentStudent.altMobile || 'None'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Personal Email</p>
                  <p className="text-slate-800 truncate" title={currentStudent.personalEmail}>
                    {currentStudent.personalEmail}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 font-medium">Institutional College Email</p>
                  <p className="font-mono text-blue-900 font-semibold">{currentStudent.collegeEmail}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 font-medium">Permanent Residential Address</p>
                  <p className="text-slate-700">{currentStudent.address}</p>
                  <p className="text-slate-500 mt-0.5 font-medium">
                    {currentStudent.city}, {currentStudent.state} - {currentStudent.pinCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Academic Credentials</h3>
                  <p className="text-[10px] text-slate-400">Current enrollment and branch details</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Student ID</p>
                  <p className="font-mono font-semibold text-slate-800">{currentStudent.id}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Admission Number</p>
                  <p className="font-mono font-semibold text-slate-800">{currentStudent.admissionNumber}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Registration Number</p>
                  <p className="font-mono font-bold text-blue-900">{currentStudent.regNumber}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Roll Number</p>
                  <p className="font-mono font-semibold text-slate-800">{currentStudent.rollNumber}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 font-medium">Degree Course</p>
                  <p className="font-semibold text-slate-800">{course?.name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 font-medium">Department</p>
                  <p className="text-slate-700">{department?.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Current Standing</p>
                  <p className="font-bold text-blue-900">
                    Year {currentStudent.yearOfStudy} &bull; Semester {currentStudent.currentSemester}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Section & Batch</p>
                  <p className="font-semibold text-slate-800">
                    Sec {currentStudent.section} &bull; {currentStudent.batch}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Academic Year</p>
                  <p className="font-semibold text-slate-800">{currentStudent.academicYear}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Admission Date</p>
                  <p className="font-semibold text-slate-800">{formatDate(currentStudent.admissionDate)}</p>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Users className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Guardian / Parent Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Parent/Guardian Name</p>
                  <p className="font-semibold text-slate-800">{currentStudent.guardianName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Relationship</p>
                  <p className="font-semibold text-slate-800">{currentStudent.relationship}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Contact Number</p>
                  <p className="font-mono font-semibold text-slate-800">{currentStudent.guardianMobile}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Email Address</p>
                  <p className="text-slate-800 truncate" title={currentStudent.guardianEmail}>
                    {currentStudent.guardianEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Hostel / Transport Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  {currentStudent.hostel ? <Home className="h-4 w-4" /> : <Bus className="h-4 w-4" />}
                </div>
                <h3 className="text-sm font-bold text-slate-900">Campus Facilities & Services</h3>
              </div>

              {currentStudent.hostel ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">{currentStudent.hostel.hostelName}</p>
                      <p className="text-slate-500">
                        Room: <strong className="text-slate-800 font-mono">{currentStudent.hostel.roomNumber}</strong>
                      </p>
                    </div>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                      Hosteler Allotted
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-slate-50 p-2">
                      <span className="text-slate-400">Hostel Fee:</span>{' '}
                      <strong className="text-slate-800">{formatCurrency(currentStudent.hostel.hostelFee)}</strong>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <span className="text-slate-400">Mess Fee:</span>{' '}
                      <strong className="text-slate-800">{formatCurrency(currentStudent.hostel.messFee)}</strong>
                    </div>
                    <div className="col-span-2 rounded-lg bg-slate-50 p-2 flex justify-between">
                      <span className="text-slate-400">Pending Hostel Balance:</span>{' '}
                      <strong className="text-rose-600 font-mono">
                        {formatCurrency(currentStudent.hostel.pendingHostelFee)}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : currentStudent.transport ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">{currentStudent.transport.route}</p>
                      <p className="text-slate-500">
                        Bus No: <strong className="text-slate-800 font-mono">{currentStudent.transport.busNumber}</strong>
                      </p>
                    </div>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Day Scholar Bus Pass
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-slate-50 p-2">
                      <span className="text-slate-400">Transport Fee:</span>{' '}
                      <strong className="text-slate-800">{formatCurrency(currentStudent.transport.transportFee)}</strong>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 flex justify-between">
                      <span className="text-slate-400">Pending Transport Balance:</span>{' '}
                      <strong className="text-emerald-700 font-mono">
                        {formatCurrency(currentStudent.transport.pendingTransportFee)}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No hostel or college transport services availed for this academic year. (Day Scholar - Own Transport)
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
