import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { FeeStatusBadge } from '../../components/common/FeeStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const SemesterFeesPage: React.FC = () => {
  const { currentStudent, openPaymentModal } = useApp();

  if (!currentStudent) return null;

  const course = dataService.getCourses().find((c) => c.id === currentStudent.courseId);
  const totalSemesters = course?.totalSemesters || 8;
  const allFees = dataService.getStudentFees(currentStudent.id);

  // Default expand current semester
  const [expandedSemesters, setExpandedSemesters] = useState<Record<number, boolean>>({
    [currentStudent.currentSemester]: true,
  });

  const toggleSemester = (sem: number) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [sem]: !prev[sem],
    }));
  };

  const semesters = Array.from({ length: totalSemesters }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Semester-Wise Fee Summary
        </h1>
        <p className="text-xs text-slate-500">
          Complete progression and payment record across Semesters 1 to {totalSemesters}
        </p>
      </div>

      <div className="space-y-4">
        {semesters.map((sem) => {
          const semFees = allFees.filter((f) => f.semester === sem);
          const totalFee = semFees.reduce((sum, f) => sum + f.amount, 0);
          const totalPaid = semFees.reduce((sum, f) => sum + f.paidAmount, 0);
          const totalPending = semFees.reduce((sum, f) => sum + f.pendingAmount, 0);
          const dueDate = semFees.length > 0 ? semFees[0].dueDate : undefined;

          let status: 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'UPCOMING' = 'UPCOMING';
          if (semFees.length > 0) {
            if (totalPending <= 0 && totalFee > 0) {
              status = 'PAID';
            } else if (totalPaid > 0) {
              status = 'PARTIALLY_PAID';
            } else {
              status = 'PENDING';
            }
          }

          const isExpanded = !!expandedSemesters[sem];
          const isCurrent = sem === currentStudent.currentSemester;

          return (
            <div
              key={sem}
              className={`rounded-2xl border transition-all ${
                isCurrent
                  ? 'border-blue-300 bg-white shadow-md ring-1 ring-blue-200'
                  : 'border-slate-200 bg-white shadow-xs'
              }`}
            >
              {/* Semester Header Row */}
              <div
                onClick={() => toggleSemester(sem)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer hover:bg-slate-50/70 transition-colors gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    S{sem}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        Semester {sem}
                      </h3>
                      {isCurrent && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                          Current Semester
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {dueDate ? `Due Date: ${formatDate(dueDate)}` : 'Fees not yet scheduled'}
                    </p>
                  </div>
                </div>

                {/* Metrics in header */}
                <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                  <div className="text-left sm:text-right">
                    <p className="text-slate-400 font-medium">Total Fee</p>
                    <p className="font-mono font-bold text-slate-800">{formatCurrency(totalFee)}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-slate-400 font-medium">Paid</p>
                    <p className="font-mono font-semibold text-emerald-600">
                      {formatCurrency(totalPaid)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-slate-400 font-medium">Pending</p>
                    <p className={`font-mono font-bold ${totalPending > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      {formatCurrency(totalPending)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <FeeStatusBadge status={status} size="sm" />
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Details Body */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-5 rounded-b-2xl">
                  {semFees.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      Fee breakdown will be published prior to the commencement of Semester {sem}.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-blue-600" />
                          Individual Fee Categories for Semester {sem}
                        </span>
                        {totalPending > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openPaymentModal({
                                studentId: currentStudent.id,
                                semester: sem,
                                category: 'All Pending Fees',
                                maxAmount: totalPending,
                              });
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
                          >
                            <CreditCard className="h-3 w-3" />
                            Pay Semester Balance ({formatCurrency(totalPending)})
                          </button>
                        )}
                      </div>

                      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white overflow-hidden text-xs">
                        {semFees.map((f) => (
                          <div key={f.id} className="flex items-center justify-between p-3 hover:bg-slate-50/50">
                            <div>
                              <p className="font-semibold text-slate-800">{f.categoryName}</p>
                              <p className="text-[11px] text-slate-400">Due: {formatDate(f.dueDate)}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-mono text-slate-600">Total: {formatCurrency(f.amount)}</p>
                                <p className="font-mono font-medium text-emerald-600">
                                  Paid: {formatCurrency(f.paidAmount)}
                                </p>
                              </div>
                              <div className="text-right w-24">
                                <p className="font-mono font-bold text-rose-600">
                                  {formatCurrency(f.pendingAmount)}
                                </p>
                                <FeeStatusBadge status={f.status} size="sm" />
                              </div>
                              {f.pendingAmount > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPaymentModal({
                                      studentId: currentStudent.id,
                                      semester: sem,
                                      category: f.categoryName,
                                      maxAmount: f.pendingAmount,
                                    });
                                  }}
                                  className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100"
                                >
                                  Pay
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
