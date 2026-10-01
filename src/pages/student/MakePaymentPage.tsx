import React, { useState } from 'react';
import {
  CreditCard,
  Building,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Receipt,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { PaymentMethod } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const MakePaymentPage: React.FC = () => {
  const { currentStudent, refreshData, openReceiptModal } = useApp();

  if (!currentStudent) return null;

  const allFees = dataService.getStudentFees(currentStudent.id);
  const pendingFees = allFees.filter((f) => f.pendingAmount > 0);

  const [selectedFeeId, setSelectedFeeId] = useState<string>(() => pendingFees[0]?.id || 'ALL');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [upiId, setUpiId] = useState('student@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 8920 1192 8841');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('482');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedReceipt, setCompletedReceipt] = useState<any>(null);

  // Derive target item details
  const selectedItem = pendingFees.find((f) => f.id === selectedFeeId);
  const maxPayable = selectedFeeId === 'ALL'
    ? pendingFees.reduce((sum, f) => sum + f.pendingAmount, 0)
    : selectedItem?.pendingAmount || 0;

  const currentEnteredAmount = customAmount ? Number(customAmount) : maxPayable;

  const handleSelectFee = (feeId: string) => {
    setSelectedFeeId(feeId);
    setErrorMessage(null);
    setCompletedReceipt(null);
    if (feeId === 'ALL') {
      const allPending = pendingFees.reduce((sum, f) => sum + f.pendingAmount, 0);
      setCustomAmount(allPending > 0 ? allPending.toString() : '0');
    } else {
      const item = pendingFees.find((f) => f.id === feeId);
      setCustomAmount(item ? item.pendingAmount.toString() : '0');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const amount = Number(customAmount || maxPayable);

    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Payment amount must be greater than ₹0.');
      return;
    }

    if (amount > maxPayable) {
      setErrorMessage(`Payment amount cannot exceed the pending fee of ${formatCurrency(maxPayable)}.`);
      return;
    }

    if (paymentMethod === 'UPI' && !upiId.includes('@')) {
      setErrorMessage('Please enter a valid UPI ID (e.g. username@bank).');
      return;
    }

    if ((paymentMethod === 'DEBIT_CARD' || paymentMethod === 'CREDIT_CARD') && cardNumber.replace(/\s/g, '').length < 16) {
      setErrorMessage('Please enter a 16-digit debit/credit card number.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      try {
        const semester = selectedItem ? selectedItem.semester : currentStudent.currentSemester;
        const feeCategory = selectedItem ? selectedItem.categoryName : 'ALL';

        const result = dataService.makePayment({
          studentId: currentStudent.id,
          semester,
          feeTypeOrCategory: feeCategory,
          amount,
          paymentMethod,
          notes: `Online portal checkout via ${paymentMethod}`,
        });

        setIsProcessing(false);
        setCompletedReceipt(result.receipt);
        refreshData();
      } catch (err: any) {
        setIsProcessing(false);
        setErrorMessage(err.message || 'Payment processing failed.');
      }
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Online Fee Payment Counter
        </h1>
        <p className="text-xs text-slate-500">
          Make simulated tuition and auxiliary fee payments securely through student ERP
        </p>
      </div>

      {completedReceipt ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-8 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Payment Successfully Recorded!</h2>
            <p className="text-xs text-slate-600 mt-1">
              Your transaction has been confirmed and fee account balances are updated.
            </p>
          </div>

          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-left text-xs space-y-2 shadow-xs">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-mono text-base font-bold text-emerald-600">
                {formatCurrency(completedReceipt.totalAmountPaid)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Receipt Number:</span>
              <span className="font-mono font-bold text-blue-900">{completedReceipt.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment ID:</span>
              <span className="font-mono text-slate-700">{completedReceipt.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction ID:</span>
              <span className="font-mono text-slate-700">{completedReceipt.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-semibold text-slate-800">{completedReceipt.paymentMethod}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => openReceiptModal(completedReceipt)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
            >
              <Receipt className="h-4 w-4" />
              View & Print Official Receipt
            </button>
            <button
              onClick={() => setCompletedReceipt(null)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Make Another Payment
            </button>
          </div>
        </div>
      ) : pendingFees.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Zero Outstanding Dues</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            All your semester fees are fully settled. You do not owe any tuition or facility charges.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1: Select Fee Item */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900">Select Fee Component to Pay</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => handleSelectFee('ALL')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedFeeId === 'ALL'
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 text-xs">All Pending Semester Dues</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pay all outstanding categories together</p>
                  </div>
                  <span className="font-mono font-bold text-blue-900 text-sm">
                    {formatCurrency(pendingFees.reduce((sum, f) => sum + f.pendingAmount, 0))}
                  </span>
                </div>
              </div>

              {pendingFees.map((fee) => (
                <div
                  key={fee.id}
                  onClick={() => handleSelectFee(fee.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedFeeId === fee.id
                      ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{fee.categoryName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Sem {fee.semester} &bull; Due: {formatDate(fee.dueDate)}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-rose-600 text-sm">
                      {formatCurrency(fee.pendingAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Item Detail Strip */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Academic Year</span>
                <p className="font-semibold text-slate-800">{currentStudent.academicYear}</p>
              </div>
              <div>
                <span className="text-slate-400">Semester</span>
                <p className="font-bold text-blue-900">
                  Semester {selectedItem ? selectedItem.semester : currentStudent.currentSemester}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Pending Amount</span>
                <p className="font-mono font-bold text-rose-600">{formatCurrency(maxPayable)}</p>
              </div>
              <div>
                <span className="text-slate-400">Due Date</span>
                <p className="font-mono font-medium text-slate-800">
                  {selectedItem ? formatDate(selectedItem.dueDate) : 'Immediate'}
                </p>
              </div>
            </div>

            {/* Custom Amount Entry */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Enter Payment Amount (₹)
              </label>
              <div className="relative max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  max={maxPayable}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={maxPayable.toString()}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-8 pr-24 font-bold text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setCustomAmount(maxPayable.toString())}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-blue-100 px-2 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-200"
                >
                  Pay Full
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900">Select Payment Method (Simulation)</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                { id: 'DEBIT_CARD', label: 'Debit Card', icon: CreditCard },
                { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
                { id: 'NET_BANKING', label: 'Net Banking', icon: Building },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3.5 text-center text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="font-semibold">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Method Inputs */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              {paymentMethod === 'UPI' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Enter UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Supports Google Pay, PhonePe, Paytm, BHIM UPI.
                  </p>
                </div>
              )}

              {(paymentMethod === 'DEBIT_CARD' || paymentMethod === 'CREDIT_CARD') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength={4}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'NET_BANKING' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option>HDFC Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Punjab National Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Simulated ERP payment checkout &bull; Instant receipt generation</span>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isProcessing || maxPayable <= 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing Transaction...' : `Confirm & Pay ${formatCurrency(currentEnteredAmount)}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
