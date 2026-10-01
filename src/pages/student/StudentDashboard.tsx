import React from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  Receipt,
  GraduationCap,
  Sparkles,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { StatCard } from '../../components/common/StatCard';
import { FeeStatusBadge } from '../../components/common/FeeStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const StudentDashboard: React.FC = () => {
  const { currentStudent, setActivePage, openPaymentModal, openReceiptModal } = useApp();

  if (!currentStudent) {
    return (
      <div className="p-8 text-center text-slate-500">
        No student profile selected. Please log in as a student.
      </div>
    );
  }

  const course = dataService.getCourses().find((c) => c.id === currentStudent.courseId);
  const department = dataService.getDepartments().find((d) => d.id === currentStudent.departmentId);

  // Dynamic calculations from sample data!
  const summary = dataService.getStudentFeeSummary(currentStudent.id);
  const studentFees = dataService.getStudentFees(currentStudent.id);
  const payments = dataService.getPayments(currentStudent.id);
  const scholarships = dataService.getScholarships(currentStudent.id);
  const receipts = dataService.getReceipts(currentStudent.id);

  const pendingItems = studentFees.filter((f) => f.pendingAmount > 0);

  const handlePayNow = () => {
    if (summary.pendingFee <= 0) return;
    openPaymentModal({
      studentId: currentStudent.id,
      semester: currentStudent.currentSemester,
      category: 'All Pending Fees',
      maxAmount: summary.pendingFee,
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Student Profile Snapshot */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 border border-blue-400/30">
                <Sparkles className="h-3 w-3 text-amber-300" />
                Semester {currentStudent.currentSemester} &bull; {currentStudent.academicYear}
              </span>
              <FeeStatusBadge status={currentStudent.status} size="sm" />
            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Welcome, {currentStudent.name}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              {course?.name} ({department?.code}) &bull; Section {currentStudent.section}
            </p>

            {/* Quick Profile Summary tags */}
            <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-blue-200/90 font-mono">
              <span>Reg: <strong className="text-white">{currentStudent.regNumber}</strong></span>
              <span>Roll: <strong className="text-white">{currentStudent.rollNumber}</strong></span>
              <span>Mobile: <strong className="text-white">{currentStudent.mobile}</strong></span>
              <span>Email: <strong className="text-white">{currentStudent.collegeEmail}</strong></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {summary.pendingFee > 0 ? (
              <button
                onClick={handlePayNow}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg hover:bg-emerald-400 transition-all active:scale-95"
              >
                <CreditCard className="h-4 w-4" />
                Pay Pending Fees ({formatCurrency(summary.pendingFee)})
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 px-4 py-3 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                All Fees Cleared!
              </div>
            )}
            <button
              onClick={() => setActivePage('profile')}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold text-white border border-white/20 hover:bg-white/20 transition-colors shadow-xs"
            >
              Full Profile & All Fees &rarr;
            </button>
          </div>
        </div>

        {/* Scholarship Banner if approved */}
        {scholarships.length > 0 && scholarships.some((s) => s.status === 'APPROVED') && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-emerald-300">
            <Award className="h-4 w-4 text-amber-400" />
            <span>
              Merit / Concession Applied: <strong>{scholarships.find((s) => s.status === 'APPROVED')?.scholarshipName}</strong> (
              {formatCurrency(summary.approvedScholarship)} deducted from gross fee)
            </span>
          </div>
        )}
      </div>

      {/* 5 Dynamic Dashboard Cards Required by prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Fees"
          value={formatCurrency(summary.totalFee)}
          subtitle={summary.approvedScholarship > 0 ? `Net: ${formatCurrency(summary.netFee)}` : 'Applicable fees'}
          icon={GraduationCap}
          variant="blue"
        />

        <StatCard
          title="Amount Paid"
          value={formatCurrency(summary.totalPaid)}
          subtitle={`${summary.collectionPercentage}% completed`}
          icon={CheckCircle2}
          variant="emerald"
          trend={{ label: `${summary.collectionPercentage}% Paid`, positive: true }}
        />

        <StatCard
          title="Pending Fees"
          value={formatCurrency(summary.pendingFee)}
          subtitle={summary.pendingFee === 0 ? 'No outstanding' : 'Due for clearance'}
          icon={Clock}
          variant={summary.pendingFee > 0 ? 'amber' : 'emerald'}
        />

        <StatCard
          title="Overdue Amount"
          value={formatCurrency(summary.overdueAmount)}
          subtitle={
            summary.totalLateFee > 0
              ? `Includes ${formatCurrency(summary.totalLateFee)} late fee`
              : 'Zero overdue penalties'
          }
          icon={AlertTriangle}
          variant={summary.overdueAmount > 0 ? 'rose' : 'slate'}
        />

        <StatCard
          title="Next Due Date"
          value={summary.nextDueDate.includes('20') ? formatDate(summary.nextDueDate) : summary.nextDueDate}
          subtitle="Mandatory deadline"
          icon={Calendar}
          variant="purple"
        />
      </div>

      {/* Fee Progress Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
          <span>Fee Settlement Progress</span>
          <span className="font-mono text-blue-900 font-bold">{summary.collectionPercentage}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              summary.collectionPercentage === 100
                ? 'bg-emerald-500'
                : summary.collectionPercentage > 50
                ? 'bg-blue-600'
                : 'bg-amber-500'
            }`}
            style={{ width: `${summary.collectionPercentage}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
          <span>Paid: <strong className="text-slate-800">{formatCurrency(summary.totalPaid)}</strong></span>
          {summary.approvedScholarship > 0 && (
            <span>Scholarship: <strong className="text-emerald-700">{formatCurrency(summary.approvedScholarship)}</strong></span>
          )}
          <span>Pending: <strong className="text-rose-600">{formatCurrency(summary.pendingFee)}</strong></span>
          <span>Gross: <strong className="text-slate-800">{formatCurrency(summary.totalFee)}</strong></span>
        </div>
      </div>

      {/* Semester Fee Progression from 1st Year Sem 1 onwards */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Semester Fee Record &bull; 1st Year to 2nd Year
            </h3>
            <p className="text-xs text-slate-500">
              Current Enrollment: 2nd Year, 3rd Semester &bull; Academic Year 2026-2027
            </p>
          </div>
          <button
            onClick={() => setActivePage('profile')}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            View Full Profile & All Fees &rarr;
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                1st Year &bull; Semester 1
              </span>
              <p className="font-mono text-base font-bold text-slate-900 mt-0.5">
                {formatCurrency(studentFees.filter((f) => f.semester === 1).reduce((s, f) => s + f.amount, 0))}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Cleared
            </span>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                1st Year &bull; Semester 2
              </span>
              <p className="font-mono text-base font-bold text-slate-900 mt-0.5">
                {formatCurrency(studentFees.filter((f) => f.semester === 2).reduce((s, f) => s + f.amount, 0))}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Cleared
            </span>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                2nd Year &bull; Semester 3 (Current)
              </span>
              <p className="font-mono text-base font-bold text-slate-900 mt-0.5">
                {formatCurrency(studentFees.filter((f) => f.semester === 3).reduce((s, f) => s + f.amount, 0))}
              </p>
            </div>
            {summary.pendingFee === 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Cleared
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                Pending: {formatCurrency(summary.pendingFee)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Pending Breakdown & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Fee Items */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Current Pending Items</h3>
                <p className="text-xs text-slate-500">Breakdown for Semester {currentStudent.currentSemester}</p>
              </div>
              <button
                onClick={() => setActivePage('pending-fees')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                View all &rarr;
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {pendingItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-1" />
                  No pending fees! All current semester dues are cleared.
                </div>
              ) : (
                pendingItems.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{item.categoryName}</p>
                      <p className="text-[11px] text-slate-400">Due: {formatDate(item.dueDate)}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-mono font-bold text-rose-600">
                          {formatCurrency(item.pendingAmount)}
                        </p>
                        <FeeStatusBadge status={item.status} size="sm" />
                      </div>
                      <button
                        onClick={() =>
                          openPaymentModal({
                            studentId: currentStudent.id,
                            semester: item.semester,
                            category: item.categoryName,
                            maxAmount: item.pendingAmount,
                          })
                        }
                        className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100"
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {pendingItems.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Total Outstanding:</span>
              <span className="font-mono text-base font-bold text-slate-900">
                {formatCurrency(summary.outstandingAmount)}
              </span>
            </div>
          )}
        </div>

        {/* Recent Payment Transactions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Payments</h3>
                <p className="text-xs text-slate-500">Verified transaction receipts</p>
              </div>
              <button
                onClick={() => setActivePage('payment-history')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                History &rarr;
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {payments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No payment records found yet.
                </div>
              ) : (
                payments.slice(0, 4).map((pay) => (
                  <div key={pay.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{pay.feeType}</p>
                      <p className="font-mono text-[10px] text-slate-400">
                        {pay.transactionId} &bull; {formatDate(pay.paymentDate)}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="font-mono font-bold text-emerald-600">
                          +{formatCurrency(pay.amount)}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {pay.paymentMethod}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const r = receipts.find((rc) => rc.paymentId === pay.id || rc.receiptNumber === pay.receiptId);
                          if (r) openReceiptModal(r);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                        title="View Receipt"
                      >
                        <Receipt className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">All payments generate verifiable receipts</span>
            <button
              onClick={() => setActivePage('fee-receipts')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              All Receipts ({receipts.length}) &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
