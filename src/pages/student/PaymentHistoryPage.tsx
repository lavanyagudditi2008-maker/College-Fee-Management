import React, { useState } from 'react';
import {
  Search,
  Filter,
  Receipt,
  Download,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { FeeStatusBadge } from '../../components/common/FeeStatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export const PaymentHistoryPage: React.FC = () => {
  const { currentStudent, openReceiptModal } = useApp();

  if (!currentStudent) return null;

  const payments = dataService.getPayments(currentStudent.id);
  const receipts = dataService.getReceipts(currentStudent.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.feeType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSem = selectedSemester === 'ALL' || p.semester.toString() === selectedSemester;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

    return matchesSearch && matchesSem && matchesStatus;
  }).sort((a, b) => {
    const timeA = new Date(a.paymentDate).getTime();
    const timeB = new Date(b.paymentDate).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const totalPaidSum = filteredPayments
    .filter((p) => p.status === 'SUCCESSFUL')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Payment Transaction History
          </h1>
          <p className="text-xs text-slate-500">
            Log of all electronic fee transactions, bank references, and official payment receipts
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold shadow-xs">
          <span className="text-slate-500">Filtered Total: </span>
          <span className="font-mono text-emerald-600 font-bold">{formatCurrency(totalPaidSum)}</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Payment ID, Transaction ID, or Fee Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESSFUL">Successful</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No payment transactions found matching the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Payment ID</th>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-3">Semester</th>
                  <th className="py-3 px-4">Fee Category</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPayments.map((p) => {
                  const receipt = receipts.find((r) => r.paymentId === p.id || r.receiptNumber === p.receiptId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                        {p.id}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {p.transactionId}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {formatDateTime(p.paymentDate)}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-blue-900">
                        Sem {p.semester}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {p.feeType}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-[11px] text-slate-700">
                          {p.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <FeeStatusBadge status={p.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {receipt ? (
                          <button
                            onClick={() => openReceiptModal(receipt)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 shadow-2xs"
                            title="View / Print Receipt"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            View
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
