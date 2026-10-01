import React, { useState } from 'react';
import {
  AlertCircle,
  Clock,
  ShieldAlert,
  Save,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { calculateDaysOverdue, calculateLateFee } from '../../utils/calculations';

export const LateFeeManagement: React.FC = () => {
  const { refreshData } = useApp();

  const config = dataService.getLateFeeConfig();
  const students = dataService.getStudents();
  const allFees = dataService.getStudentFees();

  const [gracePeriodDays, setGracePeriodDays] = useState(config.gracePeriodDays);
  const [calculationType, setCalculationType] = useState(config.calculationType);
  const [lateFeeAmount, setLateFeeAmount] = useState(config.lateFeeAmount);
  const [lateFeePercentage, setLateFeePercentage] = useState(config.lateFeePercentage);
  const [maxLateFee, setMaxLateFee] = useState(config.maxLateFee);
  const [effectiveDate, setEffectiveDate] = useState(config.effectiveDate);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.updateLateFeeConfig({
      gracePeriodDays,
      calculationType,
      lateFeeAmount,
      lateFeePercentage,
      maxLateFee,
      effectiveDate,
    });
    refreshData();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Preview computation on overdue items
  const currentTempConfig = {
    id: 'preview',
    gracePeriodDays,
    calculationType,
    lateFeeAmount,
    lateFeePercentage,
    maxLateFee,
    effectiveDate,
  };

  const overdueItems = allFees
    .filter((f) => f.pendingAmount > 0 && calculateDaysOverdue(f.dueDate) > 0)
    .map((item) => {
      const student = students.find((s) => s.id === item.studentId);
      const daysOverdue = calculateDaysOverdue(item.dueDate);
      const calculatedLate = calculateLateFee(item.dueDate, item.pendingAmount, currentTempConfig);
      return {
        ...item,
        student,
        daysOverdue,
        calculatedLate,
        totalPayable: item.pendingAmount + calculatedLate,
      };
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Late Fee Rules & Penalty Engine
          </h1>
          <p className="text-xs text-slate-500">
            Configure default grace periods, penalty formulas, maximum surcharge caps, and preview effects
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Late fee configuration saved & recalculation applied!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Configuration */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="h-5 w-5 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">Penalty Policy Rules</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Grace Period (Days Post Due Date)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={gracePeriodDays}
                onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                No penalty applied if paid within {gracePeriodDays} days after due date.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Calculation Method</label>
              <select
                value={calculationType}
                onChange={(e) => setCalculationType(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 p-2 font-medium"
              >
                <option value="FLAT">Flat Fixed Surcharge (₹ per overdue bill)</option>
                <option value="PERCENTAGE">Percentage of Outstanding Balance (%)</option>
                <option value="DAILY_SLAB">Daily Accruing Slab (₹ per day post grace)</option>
              </select>
            </div>

            {calculationType === 'FLAT' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Flat Surcharge Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={lateFeeAmount}
                  onChange={(e) => setLateFeeAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold"
                />
              </div>
            )}

            {calculationType === 'PERCENTAGE' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Penalty Percentage (%)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={lateFeePercentage}
                  onChange={(e) => setLateFeePercentage(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold"
                />
              </div>
            )}

            {calculationType === 'DAILY_SLAB' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Daily Surcharge Rate (₹ / Day)</label>
                <input
                  type="number"
                  min="1"
                  value={lateFeeAmount}
                  onChange={(e) => setLateFeeAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Maximum Late Fee Ceiling (₹ Cap)</label>
              <input
                type="number"
                min="0"
                value={maxLateFee}
                onChange={(e) => setMaxLateFee(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Penalty will not exceed {formatCurrency(maxLateFee)} regardless of delay.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Policy Effective Date</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 font-bold text-white shadow-md hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Save & Apply Policy
            </button>
          </form>
        </div>

        {/* Right Table: Live Preview On Actual Overdue Fees */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Live Impact Preview on Overdue Ledgers
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {overdueItems.length} overdue bills detected
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              {overdueItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No overdue bills currently found in student ledgers.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Fee Head</th>
                      <th className="py-2.5 px-3 text-center">Days Overdue</th>
                      <th className="py-2.5 px-3 text-right">Original Fee</th>
                      <th className="py-2.5 px-3 text-right">Late Surcharge</th>
                      <th className="py-2.5 px-3 text-right">Total Payable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {overdueItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-800">{item.student?.name}</p>
                          <p className="font-mono text-[10px] text-slate-400">{item.student?.regNumber}</p>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">
                          {item.categoryName}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                            {item.daysOverdue} days
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">
                          {formatCurrency(item.pendingAmount)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                          +{formatCurrency(item.calculatedLate)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                          {formatCurrency(item.totalPayable)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Calculations reflect the dynamic configuration in real time before and after saving.
          </div>
        </div>
      </div>
    </div>
  );
};
