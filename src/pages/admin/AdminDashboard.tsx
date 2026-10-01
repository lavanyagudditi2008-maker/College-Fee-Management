import React from 'react';
import {
  Users,
  GraduationCap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Building2,
  BookOpen,
  PieChart,
  Receipt,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { StatCard } from '../../components/common/StatCard';
import { FeeStatusBadge } from '../../components/common/FeeStatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const { settings, setActivePage, openReceiptModal } = useApp();

  const stats = dataService.getOverallCollegeStats();
  const receipts = dataService.getReceipts();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Financial & Fee Operations Overview
          </h1>
          <p className="text-xs text-slate-500">
            Institutional revenue tracking, fee collection velocity, and department balances for {settings.currentAcademicYear}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-900 shadow-2xs">
            Academic Year: <span className="font-bold">{settings.currentAcademicYear}</span>
          </div>
          <button
            onClick={() => setActivePage('reports')}
            className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
          >
            Generate Reports
          </button>
        </div>
      </div>

      {/* 5 Core Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Enrolled"
          value={stats.totalStudents}
          subtitle="Active degree students"
          icon={Users}
          variant="blue"
          onClick={() => setActivePage('students')}
        />

        <StatCard
          title="Fees Expected"
          value={formatCurrency(stats.totalExpectedFees)}
          subtitle="Net after scholarships"
          icon={GraduationCap}
          variant="purple"
        />

        <StatCard
          title="Total Collected"
          value={formatCurrency(stats.totalCollectedFees)}
          subtitle={`${stats.collectionPercentage}% collection rate`}
          icon={CheckCircle2}
          variant="emerald"
          trend={{ label: `${stats.collectionPercentage}% Realized`, positive: true }}
          onClick={() => setActivePage('payments')}
        />

        <StatCard
          title="Total Pending"
          value={formatCurrency(stats.totalPendingFees)}
          subtitle="Awaiting student settlement"
          icon={Clock}
          variant="amber"
          onClick={() => setActivePage('pending-fees')}
        />

        <StatCard
          title="Overdue Amount"
          value={formatCurrency(stats.totalOverdueAmount)}
          subtitle={`+${formatCurrency(stats.totalLateFeesCalculated)} late fees`}
          icon={AlertTriangle}
          variant="rose"
          onClick={() => setActivePage('pending-fees')}
        />
      </div>

      {/* Collection Progress & Ratio Strip */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span>Overall Institutional Fee Recovery Rate</span>
          </div>
          <span className="font-mono text-base font-bold text-blue-900">
            {stats.collectionPercentage}%
          </span>
        </div>

        <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${stats.collectionPercentage}%` }}
            title={`Collected: ${formatCurrency(stats.totalCollectedFees)}`}
          />
          <div
            className="h-full bg-rose-400 transition-all duration-500"
            style={{ width: `${100 - stats.collectionPercentage}%` }}
            title={`Pending: ${formatCurrency(stats.totalPendingFees)}`}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Realized: <strong className="text-slate-900 font-mono">{formatCurrency(stats.totalCollectedFees)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span>Outstanding: <strong className="text-rose-600 font-mono">{formatCurrency(stats.totalPendingFees)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Total Net Assessment:</span>
            <strong className="text-slate-900 font-mono">{formatCurrency(stats.totalExpectedFees)}</strong>
          </div>
        </div>
      </div>

      {/* Grid: Department Breakdown & Payment Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department-wise Fee Recovery */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Department-Wise Fee Realization</h3>
            </div>
            <button
              onClick={() => setActivePage('departments')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Manage &rarr;
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {stats.deptStats.map((dept) => (
              <div key={dept.id} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{dept.name}</span>
                    <span className="text-[11px] text-slate-400 ml-2 font-mono">({dept.code})</span>
                  </div>
                  <div className="font-mono text-[11px] text-right">
                    <span className="text-emerald-700 font-semibold">{formatCurrency(dept.collected)}</span>
                    <span className="text-slate-400"> / </span>
                    <span className="text-slate-600">{formatCurrency(dept.expected)}</span>
                    <span className="ml-2 font-bold text-blue-900">({dept.collectionPercentage}%)</span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      dept.collectionPercentage > 80
                        ? 'bg-emerald-500'
                        : dept.collectionPercentage > 50
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${dept.collectionPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Gateway Channels */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <PieChart className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-800">Collection by Channel</h3>
            </div>

            <div className="mt-4 space-y-3">
              {Object.entries(stats.paymentMethodStats).map(([method, data]) => {
                const totalCol = stats.totalCollectedFees || 1;
                const pct = Math.round((data.totalAmount / totalCol) * 100);
                return (
                  <div key={method} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{method.replace(/_/g, ' ')}</span>
                      <span className="font-mono font-bold text-blue-900">
                        {formatCurrency(data.totalAmount)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{data.count} transactions</span>
                      <span>{pct}% of volume</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => setActivePage('payments')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View All Payments ({dataService.getPayments().length}) &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Recent Institution Payments Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">Latest Fee Inflows Across College</h3>
          </div>
          <button
            onClick={() => setActivePage('payments')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            All Transactions &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Receipt / Ref</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-3">Course / Dept</th>
                <th className="py-3 px-2 text-center">Sem</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats.recentPayments.map((p) => {
                const receipt = receipts.find((r) => r.paymentId === p.id || r.receiptNumber === p.receiptId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-5 font-mono font-bold text-blue-900">{p.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{p.studentName}</p>
                      <p className="font-mono text-[10px] text-slate-400">{p.studentRegNumber}</p>
                    </td>
                    <td className="py-3 px-3 truncate max-w-[150px]" title={p.courseName}>
                      {p.courseName}
                    </td>
                    <td className="py-3 px-2 text-center font-semibold text-blue-900">
                      S{p.semester}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 text-sm">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {p.paymentMethod.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {formatDateTime(p.paymentDate)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {receipt && (
                        <button
                          onClick={() => openReceiptModal(receipt)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50"
                        >
                          <Receipt className="h-3 w-3" />
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
