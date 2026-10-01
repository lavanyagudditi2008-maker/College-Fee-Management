import React from 'react';
import {
  CheckCircle2,
  Download,
  GraduationCap,
  Printer,
  QrCode,
  ShieldCheck,
  X,
} from 'lucide-react';
import { FeeReceiptItem } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

interface ReceiptModalProps {
  receipt: FeeReceiptItem | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const { settings } = useApp();

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate simple text-based downloadable receipt file for user record
    const content = `
========================================================================
             ${settings.collegeName.toUpperCase()}
                  OFFICIAL FEE PAYMENT RECEIPT
========================================================================
Receipt Number  : ${receipt.receiptNumber}
Payment ID      : ${receipt.paymentId}
Transaction ID  : ${receipt.transactionId}
Date & Time     : ${formatDateTime(receipt.paymentDate)}
Status          : ${receipt.status} (VERIFIED)

STUDENT DETAILS:
------------------------------------------------------------------------
Student Name    : ${receipt.studentName}
Registration No : ${receipt.studentRegNumber}
Roll Number     : ${receipt.rollNumber || 'N/A'}
Course          : ${receipt.courseName}
Department      : ${receipt.departmentName}
Semester        : Semester ${receipt.semester}
Academic Year   : ${receipt.academicYear}

FEE BREAKDOWN:
------------------------------------------------------------------------
${receipt.feeBreakdown.map((item) => `${item.category.padEnd(45, ' ')} : ${formatCurrency(item.amount)}`).join('\n')}
------------------------------------------------------------------------
TOTAL AMOUNT PAID : ${formatCurrency(receipt.totalAmountPaid)}
PAYMENT METHOD    : ${receipt.paymentMethod.replace(/_/g, ' ')}
------------------------------------------------------------------------
Authorized Signatory: ${settings.signatoryName} (${settings.signatoryTitle})
This is a computer-generated fee receipt from the College ERP System.
========================================================================
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${receipt.receiptNumber}_${receipt.studentRegNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Modal Action Bar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-slate-800">Fee Payment Receipt</span>
            <span className="rounded bg-slate-200 px-2 py-0.5 font-mono text-xs font-medium text-slate-700">
              {receipt.receiptNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
              title="Print Receipt"
            >
              <Printer className="h-3.5 w-3.5 text-slate-600" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
              title="Download Record"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Official College Receipt Content */}
        <div className="printable-receipt p-8 text-slate-800">
          {/* Header & Logo */}
          <div className="border-b-2 border-blue-900 pb-5 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-white shadow-sm">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold tracking-tight text-blue-950 sm:text-2xl">
                  {settings.collegeName}
                </h1>
                <p className="text-xs font-medium text-slate-500">{settings.tagline}</p>
                <p className="text-xs text-slate-400">
                  {settings.address}, {settings.city} - {settings.pinCode} | Phone: {settings.phone}
                </p>
              </div>
            </div>

            <div className="mt-4 inline-block rounded-md bg-blue-50 px-4 py-1 border border-blue-200">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Official Student Fee Payment Receipt
              </span>
            </div>
          </div>

          {/* Receipt Meta & Verification */}
          <div className="my-5 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 border border-slate-200 text-xs">
            <div>
              <p className="text-slate-500 font-medium">Receipt No:</p>
              <p className="font-mono text-sm font-bold text-slate-900">{receipt.receiptNumber}</p>
              <p className="mt-2 text-slate-500 font-medium">Payment ID:</p>
              <p className="font-mono font-semibold text-slate-800">{receipt.paymentId}</p>
              <p className="mt-2 text-slate-500 font-medium">Transaction Reference:</p>
              <p className="font-mono font-semibold text-slate-800">{receipt.transactionId}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-medium">Payment Date & Time:</p>
              <p className="font-semibold text-slate-800">{formatDateTime(receipt.paymentDate)}</p>
              <p className="mt-2 text-slate-500 font-medium">Payment Method:</p>
              <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                {receipt.paymentMethod.replace(/_/g, ' ')}
              </span>
              <p className="mt-2 text-slate-500 font-medium">Payment Status:</p>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED / SUCCESSFUL
              </span>
            </div>
          </div>

          {/* Student Info Table */}
          <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
            <div className="bg-slate-100 px-3 py-2 font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              Student Details
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-200 p-3 gap-y-2">
              <div className="space-y-1.5 pr-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-bold text-slate-900">{receipt.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registration No:</span>
                  <span className="font-mono font-semibold text-slate-800">{receipt.studentRegNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Roll Number:</span>
                  <span className="font-mono text-slate-700">{receipt.rollNumber || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-1.5 pl-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Course:</span>
                  <span className="font-semibold text-slate-800">{receipt.courseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Semester:</span>
                  <span className="font-bold text-blue-900">Semester {receipt.semester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Academic Year:</span>
                  <span className="text-slate-700">{receipt.academicYear}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Itemization Table */}
          <div className="mt-5">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Fee Category / Description</th>
                  <th className="py-2.5 px-4 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipt.feeBreakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{item.category}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold text-slate-900">
                  <td colSpan={2} className="py-3 px-4 text-right uppercase tracking-wider text-xs">
                    Total Amount Paid:
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-blue-950 font-mono">
                    {formatCurrency(receipt.totalAmountPaid)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* QR Code and Signatures */}
          <div className="mt-8 flex items-end justify-between border-t border-slate-200 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-slate-300 bg-slate-50 text-slate-800">
                <QrCode className="h-12 w-12 text-slate-700" />
              </div>
              <div className="text-[11px] text-slate-500 space-y-0.5">
                <p className="font-semibold text-slate-700">Digital Verification QR</p>
                <p>Scan to verify authenticity on ERP portal</p>
                <p className="font-mono text-[10px] text-slate-400">portal.abcet.edu.in/verify</p>
              </div>
            </div>

            <div className="text-right">
              <div className="mb-2 font-serif text-sm italic font-semibold text-blue-900">
                {settings.signatoryName}
              </div>
              <div className="h-0.5 w-40 bg-slate-400 ml-auto" />
              <p className="mt-1 text-xs font-semibold text-slate-800">{settings.signatoryTitle}</p>
              <p className="text-[10px] text-slate-500">{settings.collegeName}</p>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-6 border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400">
            Note: This is a system-generated document and serves as official proof of fee submission.
            Preserve this receipt for future academic and examination clearance.
          </div>
        </div>
      </div>
    </div>
  );
};
