import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Receipt,
  Download,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { FeeStatusBadge } from '../../components/common/FeeStatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export const PaymentManagement: React.FC = () => {
  const { openReceiptModal } = useApp();

  const payments = dataService.getPayments();
  const receipts = dataService.getReceipts();
  const courses = dataService.getCourses();
  const departments = dataService.getDepartments();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSem, setSelectedSem] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedMethod, setSelectedMethod] = useState('ALL');

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentRegNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.feeType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = selectedCourse === 'ALL' || p.courseName === selectedCourse;
    const matchesDept = selectedDept === 'ALL' || p.departmentName === selectedDept;
    const matchesSem = selectedSem === 'ALL' || p.semester.toString() === selectedSem;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    const matchesMethod = selectedMethod === 'ALL' || p.paymentMethod === selectedMethod;

    return matchesSearch && matchesCourse && matchesDept && matchesSem && matchesStatus && matchesMethod;
  });

  const totalCollectedFiltered = filteredPayments
    .filter((p) => p.status === 'SUCCESSFUL')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Transactions & Fee Collections Master
          </h1>
          <p className="text-xs text-slate-500">
            Real-time audit log of all online and counter payments with gateway references
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-900 shadow-2xs">
          <span>Realized Total: </span>
          <span className="font-mono text-base font-bold text-emerald-700 ml-1">
            {formatCurrency(totalCollectedFiltered)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 text-xs">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Payment ID, Transaction ID, Student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s.toString()}>
                  Sem {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="NET_BANKING">Net Banking</option>
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
            No payments found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-2 text-center">Sem</th>
                  <th className="py-3 px-4">Fee Head</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPayments.map((p) => {
                  const receipt = receipts.find((r) => r.paymentId === p.id || r.receiptNumber === p.receiptId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                        {p.id}
                        <span className="block font-mono text-[10px] text-slate-400 font-normal">
                          {p.transactionId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{p.studentName}</p>
                        <p className="font-mono text-[10px] text-slate-400">{p.studentRegNumber}</p>
                      </td>
                      <td className="py-3.5 px-4 max-w-[150px] truncate" title={p.courseName}>
                        {p.courseName}
                      </td>
                      <td className="py-3.5 px-2 text-center font-bold text-slate-700">
                        S{p.semester}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {p.feeType}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 text-sm">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {p.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {formatDateTime(p.paymentDate)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <FeeStatusBadge status={p.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {receipt ? (
                          <button
                            onClick={() => openReceiptModal(receipt)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 shadow-2xs"
                          >
                            <Receipt className="h-3 w-3" />
                            Receipt
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
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
