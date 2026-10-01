/**
 * Core Data Models & Type Definitions
 * Designed to mirror future Java / JDBC / MySQL entities:
 * Student, Course, Department, FeeStructure, StudentFee, Payment, FeeReceipt, Scholarship, etc.
 */

export type UserRole = 'STUDENT' | 'ADMIN' | 'ACCOUNTS';

export type FeeStatus = 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'OVERDUE' | 'UPCOMING';

export type PaymentStatus = 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'REFUNDED';

export type PaymentMethod = 'UPI' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'NET_BANKING';

export type FeeCategory = 
  | 'TUITION'
  | 'ADMISSION'
  | 'REGISTRATION'
  | 'EXAMINATION'
  | 'LIBRARY'
  | 'LABORATORY'
  | 'DEVELOPMENT'
  | 'SPORTS'
  | 'STUDENT_WELFARE'
  | 'TECHNOLOGY'
  | 'HOSTEL'
  | 'MESS'
  | 'TRANSPORT'
  | 'OTHER';

export interface Department {
  id: string;
  code: string;
  name: string;
  hodName: string;
  contactNumber: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Course {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  durationYears: number;
  totalSemesters: number;
  academicYear: string;
  intake: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface HostelDetail {
  hostelName: string;
  roomNumber: string;
  hostelFee: number;
  messFee: number;
  securityDeposit: number;
  pendingHostelFee: number;
}

export interface TransportDetail {
  route: string;
  busNumber: string;
  transportFee: number;
  pendingTransportFee: number;
}

export interface Student {
  id: string;
  regNumber: string;
  rollNumber: string;
  admissionNumber: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  altMobile?: string;
  personalEmail: string;
  collegeEmail: string;
  courseId: string;
  departmentId: string;
  specialization?: string;
  batch: string;
  academicYear: string;
  currentSemester: number;
  section: string;
  yearOfStudy: number;
  admissionDate: string;
  status: 'ACTIVE' | 'GRADUATED' | 'SUSPENDED';
  address: string;
  city: string;
  state: string;
  pinCode: string;
  guardianName: string;
  guardianMobile: string;
  guardianEmail: string;
  relationship: string;
  hostel?: HostelDetail;
  transport?: TransportDetail;
  avatarUrl?: string;
}

export interface FeeStructureItem {
  id: string;
  academicYear: string;
  courseId: string;
  departmentId: string;
  semester: number;
  category: FeeCategory;
  categoryName: string;
  amount: number;
  dueDate: string;
  isMandatory: boolean;
  description?: string;
}

export interface StudentFeeItem {
  id: string;
  studentId: string;
  semester: number;
  academicYear: string;
  category: FeeCategory;
  categoryName: string;
  amount: number;
  dueDate: string;
  paidAmount: number;
  pendingAmount: number;
  status: FeeStatus;
  lateFeeApplied: number;
}

export interface PaymentItem {
  id: string;
  transactionId: string;
  studentId: string;
  studentRegNumber: string;
  studentName: string;
  courseName: string;
  departmentName: string;
  academicYear: string;
  semester: number;
  feeType: string;
  amount: number;
  paymentDate: string; // ISO string or YYYY-MM-DD
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  receiptId: string;
  notes?: string;
}

export interface FeeReceiptItem {
  receiptNumber: string;
  paymentId: string;
  transactionId: string;
  studentId: string;
  studentRegNumber: string;
  studentName: string;
  rollNumber: string;
  courseName: string;
  departmentName: string;
  semester: number;
  academicYear: string;
  feeBreakdown: {
    category: string;
    amount: number;
  }[];
  totalAmountPaid: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  collegeName: string;
  authorizedSignature: string;
  status: 'VALID' | 'CANCELLED';
}

export interface Scholarship {
  id: string;
  studentId: string;
  scholarshipName: string;
  type: 'MERIT' | 'NEED_BASED' | 'SPORTS' | 'GOVERNMENT' | 'ALUMNI';
  percentage?: number;
  approvedAmount: number;
  academicYear: string;
  eligibility: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface LateFeeConfig {
  id: string;
  gracePeriodDays: number;
  lateFeeAmount: number; // Flat rate per day or fixed
  lateFeePercentage: number; // or percentage
  maxLateFee: number;
  effectiveDate: string;
  calculationType: 'FLAT' | 'PERCENTAGE' | 'DAILY_SLAB';
}

export interface Notification {
  id: string;
  recipientType: 'ALL' | 'STUDENT' | 'COURSE' | 'DEPARTMENT' | 'SEMESTER';
  recipientTargetId?: string; // studentId, courseId, etc.
  title: string;
  message: string;
  type: 'FEE_REMINDER' | 'PAYMENT_CONFIRMATION' | 'PAYMENT_FAILURE' | 'DUE_DATE_ALERT' | 'FEE_STRUCTURE_UPDATE' | 'ANNOUNCEMENT';
  date: string;
  isRead: boolean;
  link?: string;
}

export interface CollegeSettings {
  collegeName: string;
  collegeCode: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  email: string;
  website: string;
  affiliation: string;
  currentAcademicYear: string;
  currentSemester: number;
  currencySymbol: string;
  signatoryTitle: string;
  signatoryName: string;
}
