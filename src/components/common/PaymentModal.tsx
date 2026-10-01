import React, { useState } from 'react';
import {
  CreditCard,
  Building,
  Smartphone,
  ShieldCheck,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import { PaymentMethod } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';

export const PaymentModal: React.FC = () => {
  const { paymentModalParams, closePaymentModal, refreshData, openReceiptModal } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [amount, setAmount] = useState<number>(() => paymentModalParams?.maxAmount || 0);
  const [upiId, setUpiId] = useState('student@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 8920 1192 8841');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('482');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<any>(null);

  if (!paymentModalParams) return null;

  const { studentId, semester, category, maxAmount } = paymentModalParams;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid payment amount greater than ₹0.');
      return;
    }

    if (numericAmount > maxAmount) {
      setError(`Payment amount cannot exceed the pending fee of ${formatCurrency(maxAmount)}.`);
      return;
    }

    if (paymentMethod === 'UPI' && !upiId.includes('@')) {
      setError('Please enter a valid UPI ID (e.g. yourname@okhdfcbank).');
      return;
    }

    if ((paymentMethod === 'DEBIT_CARD' || paymentMethod === 'CREDIT_CARD') && cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }

    setIsProcessing(true);

    // Simulate realistic gateway network roundtrip (1.2 seconds)
    setTimeout(() => {
      try {
        const result = dataService.makePayment({
          studentId,
          semester,
          feeTypeOrCategory: category || 'ALL',
          amount: numericAmount,
          paymentMethod,
          notes: `Simulated transaction via ${paymentMethod}`,
        });

        setIsProcessing(false);
        setSuccessReceipt(result.receipt);
        refreshData();
      } catch (err: any) {
        setIsProcessing(false);
        setError(err.message || 'Payment processing failed. Please try again.');
      }
    }, 1200);
  };

  const handleFinish = () => {
    const r = successReceipt;
    closePaymentModal();
    if (r) {
      openReceiptModal(r);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {successReceipt ? 'Payment Confirmation' : 'Simulated Fee Checkout'}
            </h3>
            <p className="text-xs text-slate-500">
              Semester {semester} &bull; {category}
            </p>
          </div>
          {!isProcessing && (
            <button
              onClick={closePaymentModal}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {successReceipt ? (
            <div className="space-y-4 text-center py-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-in zoom-in-75 duration-200">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900">Payment Successful!</h4>
                <p className="text-xs text-slate-500">
                  Transaction has been recorded and fee records updated.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {formatCurrency(successReceipt.totalAmountPaid)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt Number:</span>
                  <span className="font-mono font-semibold text-blue-900">{successReceipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment ID:</span>
                  <span className="font-mono text-slate-700">{successReceipt.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-semibold text-slate-800">{successReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={handleFinish}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                >
                  <Receipt className="h-4 w-4" />
                  View & Print Official Receipt
                </button>
                <button
                  onClick={closePaymentModal}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Amount input & Pending reminder */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-blue-900">
                    Payment Amount
                  </label>
                  <span className="text-xs text-slate-500">
                    Pending:{' '}
                    <span className="font-bold text-rose-600">{formatCurrency(maxAmount)}</span>
                  </span>
                </div>
                <div className="mt-2 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={maxAmount}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    disabled={isProcessing}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-20 text-base font-bold text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(maxAmount)}
                    disabled={isProcessing}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-200"
                  >
                    Pay Full
                  </button>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Select Payment Method (Demo Simulation)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                    { id: 'DEBIT_CARD', label: 'Debit Card', icon: CreditCard },
                    { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
                    { id: 'NET_BANKING', label: 'Net Banking', icon: Building },
                  ].map((m) => {
                    const Icon = m.icon;
                    const selected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                        disabled={isProcessing}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center text-xs font-medium transition-all ${
                          selected
                            ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs ring-1 ring-blue-600'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${selected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="text-[11px] leading-tight">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Method Specific Form Details */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                {paymentMethod === 'UPI' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Virtual Payment Address (VPA / UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. username@okhdfcbank"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-xs focus:border-blue-500 focus:outline-hidden"
                    />
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      Supports Google Pay, PhonePe, Paytm, BHIM and all major UPI apps.
                    </p>
                  </div>
                )}

                {(paymentMethod === 'DEBIT_CARD' || paymentMethod === 'CREDIT_CARD') && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800 shadow-xs focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800 shadow-xs focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          maxLength={4}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800 shadow-xs focus:border-blue-500 focus:outline-hidden"
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
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-xs focus:border-blue-500 focus:outline-hidden"
                    >
                      <option>HDFC Bank</option>
                      <option>State Bank of India (SBI)</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Punjab National Bank</option>
                      <option>Bank of Baroda</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>256-Bit SSL Encrypted (Simulated College ERP Gateway)</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closePaymentModal}
                  disabled={isProcessing}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || amount <= 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>Pay {formatCurrency(amount)}</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
