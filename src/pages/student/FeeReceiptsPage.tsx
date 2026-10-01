import React, { useState } from 'react';
import {
  Receipt,
  Download,
  Printer,
  Search,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { FeeStatusBadge } from '../../components/common/FeeStatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export const FeeReceiptsPage: React.FC = () => {
  const { currentStudent, openReceiptModal } = useApp();

  if (!currentStudent) return null;

  const receipts = dataService.getReceipts(currentStudent.id);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReceipts = receipts.filter(
    (r) =>
      r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Official Fee Receipts
          </h1>
          <p className="text-xs text-slate-500">
            Digitally verifiable payment receipts with college stamp, reference IDs, and tax compliance
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search receipts by number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {filteredReceipts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <FileText className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            No fee receipts found. Receipts are automatically generated when payments are recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Receipt No</th>
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-3 text-center">Semester</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredReceipts.map((r) => (
                  <tr key={r.receiptNumber} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-blue-900">
                      {r.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {r.paymentId}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {formatDateTime(r.paymentDate)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold text-slate-800">
                      Sem {r.semester}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(r.totalAmountPaid)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-[11px] text-slate-700">
                        {r.paymentMethod.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <FeeStatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openReceiptModal(r)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                        >
                          <Printer className="h-3 w-3 text-slate-500" />
                          Print / View
                        </button>
                      </div>
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
