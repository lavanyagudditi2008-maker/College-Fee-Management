import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Search,
  Filter,
  FileSpreadsheet,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';

type ReportType =
  | 'STUDENT_FEE'
  | 'DAILY_COLLECTION'
  | 'MONTHLY_COLLECTION'
  | 'SEMESTER_COLLECTION'
  | 'PENDING_FEE'
  | 'OVERDUE_FEE'
  | 'COURSE_WISE'
  | 'DEPT_WISE'
  | 'PAYMENT_METHOD'
  | 'ACADEMIC_YEAR';

export const ReportsPage: React.FC = () => {
  const { settings } = useApp();

  const [activeReport, setActiveReport] = useState<ReportType>('STUDENT_FEE');
  const [searchTerm, setSearchTerm] = useState('');

  const students = dataService.getStudents();
  const courses = dataService.getCourses();
  const departments = dataService.getDepartments();
  const payments = dataService.getPayments();
  const stats = dataService.getOverallCollegeStats();

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvRows: string[] = [];

    if (activeReport === 'STUDENT_FEE') {
      csvRows.push('Reg Number,Name,Course,Semester,Total Fee,Scholarship,Paid,Pending,Status');
      stats.studentSummaries.forEach((s) => {
        csvRows.push(
          `"${s.student?.regNumber}","${s.student?.name}","${s.student?.courseId}",${s.student?.currentSemester},${s.totalFee},${s.approvedScholarship},${s.totalPaid},${s.pendingFee},"${s.overallStatus}"`
        );
      });
    } else if (activeReport === 'DEPT_WISE') {
      csvRows.push('Department Code,Department Name,Students,Expected,Collected,Pending,Collection Rate');
      stats.deptStats.forEach((d) => {
        csvRows.push(
          `"${d.code}","${d.name}",${d.studentCount},${d.expected},${d.collected},${d.pending},"${d.collectionPercentage}%"`
        );
      });
    } else if (activeReport === 'COURSE_WISE') {
      csvRows.push('Course Code,Course Name,Students,Expected,Collected,Pending,Collection Rate');
      stats.courseStats.forEach((c) => {
        csvRows.push(
          `"${c.code}","${c.name}",${c.studentCount},${c.expected},${c.collected},${c.pending},"${c.collectionPercentage}%"`
        );
      });
    } else {
      csvRows.push('Payment ID,Transaction ID,Student Reg,Student Name,Fee Head,Amount,Method,Date,Status');
      payments.forEach((p) => {
        csvRows.push(
          `"${p.id}","${p.transactionId}","${p.studentRegNumber}","${p.studentName}","${p.feeType}",${p.amount},"${p.paymentMethod}","${p.paymentDate}","${p.status}"`
        );
      });
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KARE_Report_${activeReport}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reportTabs: { id: ReportType; label: string }[] = [
    { id: 'STUDENT_FEE', label: '1. Student Fee Report' },
    { id: 'DAILY_COLLECTION', label: '2. Daily Collection' },
    { id: 'MONTHLY_COLLECTION', label: '3. Monthly Collection' },
    { id: 'SEMESTER_COLLECTION', label: '4. Semester Collection' },
    { id: 'PENDING_FEE', label: '5. Pending Fee Report' },
    { id: 'OVERDUE_FEE', label: '6. Overdue Fee Report' },
    { id: 'COURSE_WISE', label: '7. Course-wise Report' },
    { id: 'DEPT_WISE', label: '8. Department-wise Report' },
    { id: 'PAYMENT_METHOD', label: '9. Payment Method Report' },
    { id: 'ACADEMIC_YEAR', label: '10. Academic Year Report' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Financial & Fee Audit Reports
          </h1>
          <p className="text-xs text-slate-500">
            Exportable regulatory, institutional, and departmental collection summaries for {settings.collegeName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="no-print rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
          Select Institutional Report:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`rounded-xl px-3 py-2 text-left font-semibold transition-all ${
                activeReport === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Render Content */}
      <div className="printable-receipt rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Printable Header */}
        <div className="border-b border-slate-200 bg-slate-50 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {reportTabs.find((t) => t.id === activeReport)?.label}
            </h2>
            <p className="text-xs text-slate-500">
              {settings.collegeName} &bull; Academic Year: {settings.currentAcademicYear}
            </p>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono">
            Generated: {formatDate(new Date().toISOString())}
          </div>
        </div>

        {/* Dynamic content per report type */}
        {activeReport === 'STUDENT_FEE' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Reg No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-2 text-center">Sem</th>
                  <th className="py-3 px-3 text-right">Total Fee</th>
                  <th className="py-3 px-3 text-right">Scholarship</th>
                  <th className="py-3 px-3 text-right">Net Fee</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Pending</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.studentSummaries.map((s) => (
                  <tr key={s.student?.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">{s.student?.regNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{s.student?.name}</td>
                    <td className="py-3 px-2 text-center font-bold text-slate-700">S{s.student?.currentSemester}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatCurrency(s.totalFee)}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-600">{formatCurrency(s.approvedScholarship)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold">{formatCurrency(s.netFee)}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700">{formatCurrency(s.totalPaid)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">{formatCurrency(s.pendingFee)}</td>
                    <td className="py-3 px-3 text-center font-bold">{s.overallStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'DEPT_WISE' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Code</th>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-3 text-center">Students</th>
                  <th className="py-3 px-4 text-right">Expected Fees</th>
                  <th className="py-3 px-4 text-right">Collected Fees</th>
                  <th className="py-3 px-4 text-right">Pending Fees</th>
                  <th className="py-3 px-4 text-center">Collection %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.deptStats.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-5 font-mono font-bold text-blue-900">{d.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{d.name}</td>
                    <td className="py-3 px-3 text-center font-mono">{d.studentCount}</td>
                    <td className="py-3 px-4 text-right font-mono">{formatCurrency(d.expected)}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 font-bold">{formatCurrency(d.collected)}</td>
                    <td className="py-3 px-4 text-right font-mono text-rose-600">{formatCurrency(d.pending)}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-blue-900">{d.collectionPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'COURSE_WISE' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Course Code</th>
                  <th className="py-3 px-4">Program Name</th>
                  <th className="py-3 px-3 text-center">Enrolled</th>
                  <th className="py-3 px-4 text-right">Expected Net</th>
                  <th className="py-3 px-4 text-right">Total Realized</th>
                  <th className="py-3 px-4 text-right">Pending Balance</th>
                  <th className="py-3 px-4 text-center">Recovery %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.courseStats.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-5 font-mono font-bold text-blue-900">{c.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{c.name}</td>
                    <td className="py-3 px-3 text-center font-mono">{c.studentCount}</td>
                    <td className="py-3 px-4 text-right font-mono">{formatCurrency(c.expected)}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 font-bold">{formatCurrency(c.collected)}</td>
                    <td className="py-3 px-4 text-right font-mono text-rose-600">{formatCurrency(c.pending)}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-blue-900">{c.collectionPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(activeReport === 'DAILY_COLLECTION' ||
          activeReport === 'MONTHLY_COLLECTION' ||
          activeReport === 'PAYMENT_METHOD' ||
          activeReport === 'ACADEMIC_YEAR' ||
          activeReport === 'SEMESTER_COLLECTION') && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Receipt Ref</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-2 text-center">Sem</th>
                  <th className="py-3 px-4">Fee Component</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-3">Gateway</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-5 font-mono font-bold text-blue-900">{p.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{p.studentName} ({p.studentRegNumber})</td>
                    <td className="py-3 px-4">{p.courseName}</td>
                    <td className="py-3 px-2 text-center font-bold">S{p.semester}</td>
                    <td className="py-3 px-4">{p.feeType}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">{formatCurrency(p.amount)}</td>
                    <td className="py-3 px-3 font-semibold">{p.paymentMethod}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{formatDateTime(p.paymentDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(activeReport === 'PENDING_FEE' || activeReport === 'OVERDUE_FEE') && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Reg No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4 text-right">Pending Amount</th>
                  <th className="py-3 px-4 text-right">Late Surcharge</th>
                  <th className="py-3 px-4 text-right">Total Payable</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.studentSummaries
                  .filter((s) => (activeReport === 'OVERDUE_FEE' ? s.overdueAmount > 0 : s.pendingFee > 0))
                  .map((s) => (
                    <tr key={s.student?.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-5 font-mono font-bold text-blue-900">{s.student?.regNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{s.student?.name}</td>
                      <td className="py-3 px-4">{s.student?.courseId}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">{formatCurrency(s.pendingFee)}</td>
                      <td className="py-3 px-4 text-right font-mono text-rose-600">{formatCurrency(s.totalLateFee)}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900">{formatCurrency(s.outstandingAmount)}</td>
                      <td className="py-3 px-4 text-center font-bold">{s.overallStatus}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
          <span>End of Generated Report &bull; Verified by Finance & Accounts Section</span>
          <span className="font-semibold text-slate-900">
            Total Recovery: {formatCurrency(stats.totalCollectedFees)} ({stats.collectionPercentage}%)
          </span>
        </div>
      </div>
    </div>
  );
};
