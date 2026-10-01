import React from 'react';
import {
  Clock,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { FeeStatusBadge } from '../../components/common/FeeStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calculateDaysOverdue, calculateLateFee } from '../../utils/calculations';

export const PendingFeesPage: React.FC = () => {
  const { currentStudent, openPaymentModal } = useApp();

  if (!currentStudent) return null;

  const lateConfig = dataService.getLateFeeConfig();
  const allFees = dataService.getStudentFees(currentStudent.id);
  const pendingFees = allFees.filter((f) => f.pendingAmount > 0);

  // Dynamic calculations
  let totalPendingBase = 0;
  let totalLateFee = 0;

  const enrichedPending = pendingFees.map((f) => {
    const daysOver = calculateDaysOverdue(f.dueDate);
    const late = daysOver > 0 ? calculateLateFee(f.dueDate, f.pendingAmount, lateConfig) : 0;
    const totalPayable = f.pendingAmount + late;
    totalPendingBase += f.pendingAmount;
    totalLateFee += late;

    return {
      ...f,
      daysOverdue: daysOver,
      daysRemaining: daysOver === 0 ? Math.max(0, Math.ceil((new Date(f.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0,
      lateFee: late,
      totalPayable,
    };
  });

  const grandTotalOutstanding = totalPendingBase + totalLateFee;

  const handlePayItem = (item: typeof enrichedPending[0]) => {
    openPaymentModal({
      studentId: currentStudent.id,
      semester: item.semester,
      category: item.categoryName,
      maxAmount: item.pendingAmount,
    });
  };

  const handlePayAll = () => {
    if (totalPendingBase <= 0) return;
    openPaymentModal({
      studentId: currentStudent.id,
      semester: currentStudent.currentSemester,
      category: 'All Pending Fees',
      maxAmount: totalPendingBase,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Pending & Overdue Fees
          </h1>
          <p className="text-xs text-slate-500">
            Current unpaid fee schedule, overdue aging analysis, and late fee computations
          </p>
        </div>

        {enrichedPending.length > 0 && (
          <button
            onClick={handlePayAll}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            Pay Total Balance ({formatCurrency(totalPendingBase)})
          </button>
        )}
      </div>

      {/* Outstanding Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Base Dues
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {formatCurrency(totalPendingBase)}
          </p>
          <p className="text-xs text-slate-400 mt-1">{enrichedPending.length} unpaid items</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Accumulated Late Fees
          </p>
          <p className="text-2xl font-bold text-rose-600 mt-1 font-mono">
            {formatCurrency(totalLateFee)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Based on {lateConfig.gracePeriodDays} days grace period</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-xs">
          <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">
            Total Outstanding Amount
          </p>
          <p className="text-2xl font-black text-blue-950 mt-1 font-mono">
            {formatCurrency(grandTotalOutstanding)}
          </p>
          <p className="text-xs text-blue-700 mt-1">Immediate clearance requested</p>
        </div>
      </div>

      {/* Main Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Unpaid Fee Schedule Breakdown</h3>
          <span className="text-xs text-slate-500">
            Registration: <strong className="font-mono text-slate-800">{currentStudent.regNumber}</strong>
          </span>
        </div>

        {enrichedPending.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-2" />
            <h4 className="text-base font-bold text-slate-900">All Fees Cleared!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              You do not have any pending or overdue fees. Your academic standing and examination eligibility are fully cleared.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Fee Category</th>
                  <th className="py-3 px-3">Semester</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3 text-center">Aging / Days</th>
                  <th className="py-3 px-4 text-right">Pending Fee</th>
                  <th className="py-3 px-4 text-right">Late Fee</th>
                  <th className="py-3 px-4 text-right">Total Payable</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {enrichedPending.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {item.categoryName}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-blue-900">
                      Sem {item.semester}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600">
                      {formatDate(item.dueDate)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {item.daysOverdue > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          <AlertTriangle className="h-3 w-3" />
                          {item.daysOverdue} days overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          <Calendar className="h-3 w-3" />
                          {item.daysRemaining} days left
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                      {formatCurrency(item.pendingAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-rose-600">
                      {item.lateFee > 0 ? `+${formatCurrency(item.lateFee)}` : '₹0'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(item.totalPayable)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <FeeStatusBadge status={item.daysOverdue > 0 ? 'OVERDUE' : item.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handlePayItem(item)}
                        className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-blue-700"
                      >
                        Pay Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50/90 font-bold text-slate-900">
                  <td colSpan={4} className="py-3.5 px-5 uppercase text-xs">
                    Total Outstanding
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm">
                    {formatCurrency(totalPendingBase)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm text-rose-600">
                    {formatCurrency(totalLateFee)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-base text-blue-950 font-black">
                    {formatCurrency(grandTotalOutstanding)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Late fee advisory */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
        <div>
          <p className="font-bold">Late Fee Policy Notice</p>
          <p className="mt-0.5">
            A grace period of {lateConfig.gracePeriodDays} days is provided post due date. Thereafter, a late fee
            is levied as per institutional policy. Failure to settle outstanding semester fees will restrict admission to end-semester examinations.
          </p>
        </div>
      </div>
    </div>
  );
};
