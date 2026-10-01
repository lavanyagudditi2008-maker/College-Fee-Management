import { LateFeeConfig, Scholarship, StudentFeeItem } from '../types';

/**
 * Dynamic financial and fee calculation engine
 * Adheres strictly to Section 32 rules:
 * - Total Fee = Sum of all applicable fee components
 * - Net Fee = Total Fee - Approved Scholarship/Concession
 * - Pending Fee = Net Fee - Total Paid
 * - Outstanding Amount = Pending Fee + Applicable Late Fee
 * - Collection Percentage = (Total Paid / Net Fee) * 100
 */

export function calculateTotalFee(feeItems: StudentFeeItem[]): number {
  return feeItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
}

export function calculateApprovedScholarship(
  studentId: string,
  scholarships: Scholarship[],
  academicYear?: string
): number {
  return scholarships
    .filter(
      (s) =>
        s.studentId === studentId &&
        s.status === 'APPROVED' &&
        (!academicYear || s.academicYear === academicYear)
    )
    .reduce((acc, s) => acc + (Number(s.approvedAmount) || 0), 0);
}

export function calculateNetFee(totalFee: number, approvedScholarship: number): number {
  return Math.max(0, totalFee - approvedScholarship);
}

export function calculateTotalPaid(feeItems: StudentFeeItem[]): number {
  return feeItems.reduce((acc, item) => acc + (Number(item.paidAmount) || 0), 0);
}

export function calculatePendingFee(netFee: number, totalPaid: number): number {
  return Math.max(0, netFee - totalPaid);
}

export function calculateDaysOverdue(dueDateStr: string, referenceDateStr?: string): number {
  if (!dueDateStr) return 0;
  const due = new Date(dueDateStr);
  const now = referenceDateStr ? new Date(referenceDateStr) : new Date();
  
  // Set both to start of day in local time for clean comparison
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffTime = now.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export function calculateLateFee(
  dueDateStr: string,
  pendingAmount: number,
  config: LateFeeConfig,
  referenceDateStr?: string
): number {
  if (pendingAmount <= 0) return 0;
  const daysOverdue = calculateDaysOverdue(dueDateStr, referenceDateStr);
  
  if (daysOverdue <= config.gracePeriodDays) {
    return 0;
  }

  const billableDays = daysOverdue - config.gracePeriodDays;
  let lateFee = 0;

  if (config.calculationType === 'FLAT') {
    lateFee = config.lateFeeAmount;
  } else if (config.calculationType === 'PERCENTAGE') {
    lateFee = Math.round((pendingAmount * config.lateFeePercentage) / 100);
  } else if (config.calculationType === 'DAILY_SLAB') {
    lateFee = billableDays * config.lateFeeAmount;
  }

  if (config.maxLateFee && config.maxLateFee > 0) {
    lateFee = Math.min(lateFee, config.maxLateFee);
  }

  return lateFee;
}

export function calculateOutstandingAmount(pendingFee: number, lateFee: number): number {
  return pendingFee + lateFee;
}

export function calculateCollectionPercentage(totalPaid: number, netFee: number): number {
  if (netFee <= 0) return 100;
  const pct = (totalPaid / netFee) * 100;
  return Math.min(100, Math.max(0, Math.round(pct * 10) / 10));
}

/**
 * Evaluates the derived fee status of an individual item
 */
export function deriveItemFeeStatus(
  amount: number,
  paidAmount: number,
  dueDateStr: string,
  referenceDateStr?: string
): 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'OVERDUE' {
  if (paidAmount >= amount) return 'PAID';
  const overdueDays = calculateDaysOverdue(dueDateStr, referenceDateStr);
  if (paidAmount > 0) {
    return overdueDays > 0 ? 'OVERDUE' : 'PARTIALLY_PAID';
  }
  return overdueDays > 0 ? 'OVERDUE' : 'PENDING';
}
