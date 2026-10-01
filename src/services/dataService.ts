import {
  CollegeSettings,
  Course,
  Department,
  FeeReceiptItem,
  FeeStructureItem,
  LateFeeConfig,
  Notification,
  PaymentItem,
  PaymentMethod,
  PaymentStatus,
  Scholarship,
  Student,
  StudentFeeItem,
} from '../types';
import {
  INITIAL_COURSES,
  INITIAL_DEPARTMENTS,
  INITIAL_FEE_STRUCTURES,
  INITIAL_LATE_FEE_CONFIG,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_RECEIPTS,
  INITIAL_SCHOLARSHIPS,
  INITIAL_SETTINGS,
  INITIAL_STUDENT_FEES,
  INITIAL_STUDENTS,
} from '../data/initialData';
import {
  calculateApprovedScholarship,
  calculateDaysOverdue,
  calculateLateFee,
  calculateNetFee,
  calculateOutstandingAmount,
  calculatePendingFee,
  calculateTotalFee,
  calculateTotalPaid,
  calculateCollectionPercentage,
} from '../utils/calculations';
import {
  generatePaymentId,
  generateReceiptNumber,
  generateTransactionId,
} from '../utils/formatters';

const STORAGE_KEYS = {
  STUDENTS: 'cfm_students_v2',
  DEPARTMENTS: 'cfm_departments_v2',
  COURSES: 'cfm_courses_v2',
  FEE_STRUCTURES: 'cfm_fee_structures_v2',
  STUDENT_FEES: 'cfm_student_fees_v2',
  PAYMENTS: 'cfm_payments_v2',
  RECEIPTS: 'cfm_receipts_v2',
  SCHOLARSHIPS: 'cfm_scholarships_v2',
  LATE_FEE: 'cfm_late_fee_v2',
  NOTIFICATIONS: 'cfm_notifications_v2',
  SETTINGS: 'cfm_settings_v2',
};

class DataService {
  private getStorage<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }

  public resetToDemo(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('cfm_')) localStorage.removeItem(k);
      });
    } catch {
      // ignore
    }
  }

  // --- SETTINGS ---
  public getSettings(): CollegeSettings {
    const s = this.getStorage<CollegeSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    if (!s.collegeName || s.collegeName.includes('ABC College')) {
      const updated = {
        ...s,
        collegeName: 'Kalasalingam Academy of Research and Education',
        collegeCode: 'KARE-1984',
        tagline: 'Deemed to be University under Section 3 of UGC Act 1956 | NAAC A++ Grade',
        address: 'Anand Nagar, Krishnankoil, Srivilliputtur',
        city: 'Krishnankoil',
        state: 'Tamil Nadu',
        pinCode: '626126',
        phone: '+91 4563 289042 / 289043',
        email: 'finance@klu.ac.in',
        website: 'www.kalasalingam.ac.in',
        affiliation: 'UGC Deemed to be University | AICTE & NBA Tier-1 Accredited',
      };
      this.setStorage(STORAGE_KEYS.SETTINGS, updated);
      return updated;
    }
    return s;
  }

  public updateSettings(settings: Partial<CollegeSettings>): CollegeSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    this.setStorage(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  // --- DEPARTMENTS ---
  public getDepartments(): Department[] {
    return this.getStorage<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  }

  public addDepartment(dept: Omit<Department, 'id'>): Department {
    const list = this.getDepartments();
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
    };
    list.push(newDept);
    this.setStorage(STORAGE_KEYS.DEPARTMENTS, list);
    return newDept;
  }

  public updateDepartment(id: string, updates: Partial<Department>): Department | null {
    const list = this.getDepartments();
    const idx = list.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.setStorage(STORAGE_KEYS.DEPARTMENTS, list);
    return list[idx];
  }

  public deleteDepartment(id: string): boolean {
    const list = this.getDepartments().filter((d) => d.id !== id);
    this.setStorage(STORAGE_KEYS.DEPARTMENTS, list);
    return true;
  }

  // --- COURSES ---
  public getCourses(): Course[] {
    return this.getStorage<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  }

  public addCourse(course: Omit<Course, 'id'>): Course {
    const list = this.getCourses();
    const newCourse: Course = {
      ...course,
      id: `course-${Date.now()}`,
    };
    list.push(newCourse);
    this.setStorage(STORAGE_KEYS.COURSES, list);
    return newCourse;
  }

  public updateCourse(id: string, updates: Partial<Course>): Course | null {
    const list = this.getCourses();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.setStorage(STORAGE_KEYS.COURSES, list);
    return list[idx];
  }

  public deleteCourse(id: string): boolean {
    const list = this.getCourses().filter((c) => c.id !== id);
    this.setStorage(STORAGE_KEYS.COURSES, list);
    return true;
  }

  // --- STUDENTS ---
  public getStudents(): Student[] {
    return this.getStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  }

  public getStudentById(id: string): Student | undefined {
    return this.getStudents().find((s) => s.id === id);
  }

  public getStudentByRegNumber(regNumber: string): Student | undefined {
    return this.getStudents().find(
      (s) => s.regNumber.toUpperCase() === regNumber.trim().toUpperCase()
    );
  }

  public addStudent(studentData: Omit<Student, 'id'>): Student {
    const list = this.getStudents();
    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}`,
    };
    list.push(newStudent);
    this.setStorage(STORAGE_KEYS.STUDENTS, list);

    // Automatically inherit course fee structure for their current semester if exists
    this.assignCourseFeeStructureToStudent(newStudent.id, newStudent.courseId, newStudent.currentSemester);

    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>): Student | null {
    const list = this.getStudents();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.setStorage(STORAGE_KEYS.STUDENTS, list);
    return list[idx];
  }

  public deleteStudent(id: string): boolean {
    const list = this.getStudents().filter((s) => s.id !== id);
    this.setStorage(STORAGE_KEYS.STUDENTS, list);
    return true;
  }

  // --- FEE STRUCTURES ---
  public getFeeStructures(): FeeStructureItem[] {
    return this.getStorage<FeeStructureItem[]>(STORAGE_KEYS.FEE_STRUCTURES, INITIAL_FEE_STRUCTURES);
  }

  public addFeeStructure(item: Omit<FeeStructureItem, 'id'>): FeeStructureItem {
    const list = this.getFeeStructures();
    const newItem: FeeStructureItem = {
      ...item,
      id: `fs-${Date.now()}`,
    };
    list.push(newItem);
    this.setStorage(STORAGE_KEYS.FEE_STRUCTURES, list);
    return newItem;
  }

  public updateFeeStructure(id: string, updates: Partial<FeeStructureItem>): FeeStructureItem | null {
    const list = this.getFeeStructures();
    const idx = list.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.setStorage(STORAGE_KEYS.FEE_STRUCTURES, list);
    return list[idx];
  }

  public deleteFeeStructure(id: string): boolean {
    const list = this.getFeeStructures().filter((f) => f.id !== id);
    this.setStorage(STORAGE_KEYS.FEE_STRUCTURES, list);
    return true;
  }

  public duplicateFeeStructure(sourceSemester: number, targetSemester: number, courseId: string): number {
    const list = this.getFeeStructures();
    const sourceItems = list.filter((f) => f.courseId === courseId && f.semester === sourceSemester);
    if (sourceItems.length === 0) return 0;

    let addedCount = 0;
    sourceItems.forEach((item) => {
      const duplicated: FeeStructureItem = {
        ...item,
        id: `fs-${Date.now()}-${Math.random()}`,
        semester: targetSemester,
      };
      list.push(duplicated);
      addedCount++;
    });

    this.setStorage(STORAGE_KEYS.FEE_STRUCTURES, list);
    return addedCount;
  }

  // --- STUDENT FEES ---
  public getStudentFees(studentId?: string): StudentFeeItem[] {
    const all = this.getStorage<StudentFeeItem[]>(STORAGE_KEYS.STUDENT_FEES, INITIAL_STUDENT_FEES);
    if (studentId) {
      return all.filter((f) => f.studentId === studentId);
    }
    return all;
  }

  public addStudentFeeItem(item: Omit<StudentFeeItem, 'id'>): StudentFeeItem {
    const all = this.getStudentFees();
    const newItem: StudentFeeItem = {
      ...item,
      id: `sf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    all.push(newItem);
    this.setStorage(STORAGE_KEYS.STUDENT_FEES, all);
    return newItem;
  }

  public assignCourseFeeStructureToStudent(studentId: string, courseId: string, semester: number): void {
    const structures = this.getFeeStructures().filter(
      (f) => f.courseId === courseId && f.semester === semester
    );
    if (structures.length === 0) return;

    const all = this.getStudentFees();
    structures.forEach((st) => {
      // Check if already assigned
      const exists = all.some(
        (sf) => sf.studentId === studentId && sf.semester === semester && sf.category === st.category
      );
      if (!exists) {
        all.push({
          id: `sf-${studentId}-${st.id}`,
          studentId,
          semester,
          academicYear: st.academicYear,
          category: st.category,
          categoryName: st.categoryName,
          amount: st.amount,
          dueDate: st.dueDate,
          paidAmount: 0,
          pendingAmount: st.amount,
          status: 'PENDING',
          lateFeeApplied: 0,
        });
      }
    });

    this.setStorage(STORAGE_KEYS.STUDENT_FEES, all);
  }

  // --- PAYMENTS & SIMULATION ---
  public getPayments(studentId?: string): PaymentItem[] {
    const all = this.getStorage<PaymentItem[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    if (studentId) {
      return all.filter((p) => p.studentId === studentId);
    }
    return all;
  }

  public getReceipts(studentId?: string): FeeReceiptItem[] {
    const all = this.getStorage<FeeReceiptItem[]>(STORAGE_KEYS.RECEIPTS, INITIAL_RECEIPTS);
    if (studentId) {
      return all.filter((r) => r.studentId === studentId);
    }
    return all;
  }

  public getReceiptById(receiptNumber: string): FeeReceiptItem | undefined {
    return this.getReceipts().find((r) => r.receiptNumber === receiptNumber);
  }

  public getReceiptByPaymentId(paymentId: string): FeeReceiptItem | undefined {
    return this.getReceipts().find((r) => r.paymentId === paymentId);
  }

  /**
   * Records a simulated fee payment, validates amount, allocates to pending items,
   * creates an official receipt, updates student fee balances, and emits a notification.
   */
  public makePayment(params: {
    studentId: string;
    semester: number;
    feeTypeOrCategory: string; // e.g., 'All Pending', or a specific category
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): { payment: PaymentItem; receipt: FeeReceiptItem } {
    const { studentId, semester, feeTypeOrCategory, amount, paymentMethod, notes } = params;

    const student = this.getStudentById(studentId);
    if (!student) throw new Error('Student not found');

    const course = this.getCourses().find((c) => c.id === student.courseId);
    const department = this.getDepartments().find((d) => d.id === student.departmentId);
    const settings = this.getSettings();

    if (amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    const allFees = this.getStudentFees(studentId);
    const targetFees = allFees.filter(
      (f) =>
        f.semester === semester &&
        f.pendingAmount > 0 &&
        (feeTypeOrCategory === 'ALL' ||
          feeTypeOrCategory === 'All Pending Fees' ||
          f.category === feeTypeOrCategory ||
          f.categoryName === feeTypeOrCategory)
    );

    const totalTargetPending = targetFees.reduce((sum, f) => sum + f.pendingAmount, 0);
    if (amount > totalTargetPending) {
      throw new Error(`Payment amount (₹${amount}) cannot exceed pending fee (₹${totalTargetPending})`);
    }

    // Allocate payment amount across target pending fee items
    let remainingToAllocate = amount;
    const feeBreakdown: { category: string; amount: number }[] = [];

    const updatedAllFees = allFees.map((fee) => {
      if (
        fee.semester === semester &&
        fee.pendingAmount > 0 &&
        (feeTypeOrCategory === 'ALL' ||
          feeTypeOrCategory === 'All Pending Fees' ||
          fee.category === feeTypeOrCategory ||
          fee.categoryName === feeTypeOrCategory)
      ) {
        if (remainingToAllocate <= 0) return fee;

        const alloc = Math.min(fee.pendingAmount, remainingToAllocate);
        remainingToAllocate -= alloc;

        const newPaid = fee.paidAmount + alloc;
        const newPending = fee.amount - newPaid;
        const newStatus = newPending <= 0 ? 'PAID' : 'PARTIALLY_PAID';

        feeBreakdown.push({
          category: fee.categoryName,
          amount: alloc,
        });

        return {
          ...fee,
          paidAmount: newPaid,
          pendingAmount: Math.max(0, newPending),
          status: newStatus,
        };
      }
      return fee;
    });

    this.setStorage(STORAGE_KEYS.STUDENT_FEES, updatedAllFees);

    const paymentId = generatePaymentId();
    const transactionId = generateTransactionId();
    const receiptNumber = generateReceiptNumber();
    const paymentDate = new Date().toISOString();

    const payment: PaymentItem = {
      id: paymentId,
      transactionId,
      studentId: student.id,
      studentRegNumber: student.regNumber,
      studentName: student.name,
      courseName: course?.name || student.courseId,
      departmentName: department?.name || student.departmentId,
      academicYear: student.academicYear,
      semester,
      feeType: feeTypeOrCategory === 'ALL' ? 'Semester Fees' : feeTypeOrCategory,
      amount,
      paymentDate,
      paymentMethod,
      status: 'SUCCESSFUL',
      receiptId: receiptNumber,
      notes: notes || `Simulated ${paymentMethod} transaction`,
    };

    const payments = this.getPayments();
    payments.unshift(payment);
    this.setStorage(STORAGE_KEYS.PAYMENTS, payments);

    const receipt: FeeReceiptItem = {
      receiptNumber,
      paymentId,
      transactionId,
      studentId: student.id,
      studentRegNumber: student.regNumber,
      studentName: student.name,
      rollNumber: student.rollNumber,
      courseName: course?.name || student.courseId,
      departmentName: department?.name || student.departmentId,
      semester,
      academicYear: student.academicYear,
      feeBreakdown: feeBreakdown.length > 0 ? feeBreakdown : [{ category: feeTypeOrCategory, amount }],
      totalAmountPaid: amount,
      paymentMethod,
      paymentDate,
      collegeName: settings.collegeName,
      authorizedSignature: settings.signatoryTitle,
      status: 'VALID',
    };

    const receipts = this.getReceipts();
    receipts.unshift(receipt);
    this.setStorage(STORAGE_KEYS.RECEIPTS, receipts);

    // Generate student notification
    this.addNotification({
      recipientType: 'STUDENT',
      recipientTargetId: student.id,
      title: `Payment Received: ₹${amount.toLocaleString('en-IN')}`,
      message: `Your fee payment of ₹${amount.toLocaleString('en-IN')} for Semester ${semester} via ${paymentMethod} has been successfully recorded. Receipt #${receiptNumber} generated.`,
      type: 'PAYMENT_CONFIRMATION',
    });

    return { payment, receipt };
  }

  // --- SCHOLARSHIPS ---
  public getScholarships(studentId?: string): Scholarship[] {
    const all = this.getStorage<Scholarship[]>(STORAGE_KEYS.SCHOLARSHIPS, INITIAL_SCHOLARSHIPS);
    if (studentId) {
      return all.filter((s) => s.studentId === studentId);
    }
    return all;
  }

  public addScholarship(scholarship: Omit<Scholarship, 'id'>): Scholarship {
    const list = this.getScholarships();
    const newSch: Scholarship = {
      ...scholarship,
      id: `sch-${Date.now()}`,
    };
    list.push(newSch);
    this.setStorage(STORAGE_KEYS.SCHOLARSHIPS, list);

    // Notify student
    this.addNotification({
      recipientType: 'STUDENT',
      recipientTargetId: scholarship.studentId,
      title: `Scholarship Application: ${scholarship.scholarshipName}`,
      message: `Your application for ${scholarship.scholarshipName} of ₹${scholarship.approvedAmount.toLocaleString('en-IN')} is currently ${scholarship.status}.`,
      type: 'ANNOUNCEMENT',
    });

    return newSch;
  }

  public updateScholarshipStatus(id: string, status: 'APPROVED' | 'PENDING' | 'REJECTED'): Scholarship | null {
    const list = this.getScholarships();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    list[idx].status = status;
    this.setStorage(STORAGE_KEYS.SCHOLARSHIPS, list);

    if (status === 'APPROVED') {
      this.addNotification({
        recipientType: 'STUDENT',
        recipientTargetId: list[idx].studentId,
        title: `Scholarship Approved!`,
        message: `Your scholarship "${list[idx].scholarshipName}" of ₹${list[idx].approvedAmount.toLocaleString('en-IN')} has been approved and adjusted against your semester fee.`,
        type: 'PAYMENT_CONFIRMATION',
      });
    }

    return list[idx];
  }

  // --- LATE FEE CONFIG ---
  public getLateFeeConfig(): LateFeeConfig {
    return this.getStorage<LateFeeConfig>(STORAGE_KEYS.LATE_FEE, INITIAL_LATE_FEE_CONFIG);
  }

  public updateLateFeeConfig(updates: Partial<LateFeeConfig>): LateFeeConfig {
    const current = this.getLateFeeConfig();
    const updated = { ...current, ...updates };
    this.setStorage(STORAGE_KEYS.LATE_FEE, updated);
    return updated;
  }

  // --- NOTIFICATIONS ---
  public getNotifications(studentId?: string): Notification[] {
    const all = this.getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (studentId) {
      return all.filter((n) => n.recipientType === 'ALL' || n.recipientTargetId === studentId);
    }
    return all;
  }

  public addNotification(notification: Omit<Notification, 'id' | 'date' | 'isRead'>): Notification {
    const list = this.getNotifications();
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      date: new Date().toISOString(),
      isRead: false,
    };
    list.unshift(newNotif);
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    return newNotif;
  }

  public markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const target = list.find((n) => n.id === id);
    if (target) {
      target.isRead = true;
      this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  public markAllNotificationsAsRead(studentId?: string): void {
    const list = this.getNotifications();
    list.forEach((n) => {
      if (!studentId || n.recipientType === 'ALL' || n.recipientTargetId === studentId) {
        n.isRead = true;
      }
    });
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // --- COMPREHENSIVE DYNAMIC CALCULATIONS ---

  /**
   * Computes the complete dynamic fee summary for an individual student.
   * Total Fee, Approved Scholarship, Net Fee, Total Paid, Pending Fee, Late Fee, Next Due Date
   */
  public getStudentFeeSummary(studentId: string, semester?: number) {
    const student = this.getStudentById(studentId);
    const lateConfig = this.getLateFeeConfig();
    const allFees = this.getStudentFees(studentId);
    const scholarships = this.getScholarships(studentId);

    const relevantFees = semester ? allFees.filter((f) => f.semester === semester) : allFees;

    const totalFee = calculateTotalFee(relevantFees);
    const approvedScholarship = calculateApprovedScholarship(studentId, scholarships);
    const netFee = calculateNetFee(totalFee, approvedScholarship);
    const totalPaid = calculateTotalPaid(relevantFees);
    const pendingFee = calculatePendingFee(netFee, totalPaid);

    // Calculate overdue fees and late fees
    let totalLateFee = 0;
    let totalOverdue = 0;
    let nextDueDate: string | null = null;
    const now = new Date();

    relevantFees.forEach((item) => {
      if (item.pendingAmount > 0) {
        const daysOver = calculateDaysOverdue(item.dueDate);
        if (daysOver > 0) {
          totalOverdue += item.pendingAmount;
          totalLateFee += calculateLateFee(item.dueDate, item.pendingAmount, lateConfig);
        } else {
          // upcoming due date candidate
          const itemDueDate = new Date(item.dueDate);
          if (!nextDueDate || itemDueDate < new Date(nextDueDate)) {
            nextDueDate = item.dueDate;
          }
        }
      }
    });

    const outstandingAmount = calculateOutstandingAmount(pendingFee, totalLateFee);
    const collectionPercentage = calculateCollectionPercentage(totalPaid, netFee);

    let overallStatus: 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'OVERDUE' = 'PAID';
    if (totalOverdue > 0) {
      overallStatus = 'OVERDUE';
    } else if (pendingFee > 0 && totalPaid > 0) {
      overallStatus = 'PARTIALLY_PAID';
    } else if (pendingFee > 0) {
      overallStatus = 'PENDING';
    }

    return {
      student,
      totalFee,
      approvedScholarship,
      netFee,
      totalPaid,
      pendingFee,
      overdueAmount: totalOverdue,
      totalLateFee,
      outstandingAmount,
      collectionPercentage,
      overallStatus,
      nextDueDate: nextDueDate || (totalOverdue > 0 ? 'Immediately' : 'All Settled'),
    };
  }

  /**
   * Computes overall college statistics for Admin / Accounts dashboards.
   * Total students, total expected, collected, pending, overdue, and breakdowns.
   */
  public getOverallCollegeStats() {
    const students = this.getStudents();
    const courses = this.getCourses();
    const departments = this.getDepartments();
    const payments = this.getPayments();
    const lateConfig = this.getLateFeeConfig();
    const allFees = this.getStudentFees();

    let totalExpectedFees = 0;
    let totalCollectedFees = 0;
    let totalPendingFees = 0;
    let totalOverdueAmount = 0;
    let totalLateFeesCalculated = 0;

    // Iterate through all students to get dynamic summaries
    const studentSummaries = students.map((std) => this.getStudentFeeSummary(std.id));

    studentSummaries.forEach((sum) => {
      totalExpectedFees += sum.netFee;
      totalCollectedFees += sum.totalPaid;
      totalPendingFees += sum.pendingFee;
      totalOverdueAmount += sum.overdueAmount;
      totalLateFeesCalculated += sum.totalLateFee;
    });

    const collectionPercentage = calculateCollectionPercentage(totalCollectedFees, totalExpectedFees);

    // Department-wise breakdown
    const deptStats = departments.map((dept) => {
      const deptStudents = students.filter((s) => s.departmentId === dept.id);
      let expected = 0;
      let collected = 0;
      let pending = 0;

      deptStudents.forEach((s) => {
        const sum = studentSummaries.find((sm) => sm.student?.id === s.id);
        if (sum) {
          expected += sum.netFee;
          collected += sum.totalPaid;
          pending += sum.pendingFee;
        }
      });

      return {
        id: dept.id,
        code: dept.code,
        name: dept.name,
        studentCount: deptStudents.length,
        expected,
        collected,
        pending,
        collectionPercentage: calculateCollectionPercentage(collected, expected),
      };
    });

    // Course-wise breakdown
    const courseStats = courses.map((course) => {
      const courseStudents = students.filter((s) => s.courseId === course.id);
      let expected = 0;
      let collected = 0;
      let pending = 0;

      courseStudents.forEach((s) => {
        const sum = studentSummaries.find((sm) => sm.student?.id === s.id);
        if (sum) {
          expected += sum.netFee;
          collected += sum.totalPaid;
          pending += sum.pendingFee;
        }
      });

      return {
        id: course.id,
        code: course.code,
        name: course.name,
        studentCount: courseStudents.length,
        expected,
        collected,
        pending,
        collectionPercentage: calculateCollectionPercentage(collected, expected),
      };
    });

    // Payment method distribution
    const paymentMethodStats: Record<string, { count: number; totalAmount: number }> = {
      UPI: { count: 0, totalAmount: 0 },
      DEBIT_CARD: { count: 0, totalAmount: 0 },
      CREDIT_CARD: { count: 0, totalAmount: 0 },
      NET_BANKING: { count: 0, totalAmount: 0 },
    };

    payments.forEach((p) => {
      if (p.status === 'SUCCESSFUL') {
        const m = p.paymentMethod || 'UPI';
        if (!paymentMethodStats[m]) {
          paymentMethodStats[m] = { count: 0, totalAmount: 0 };
        }
        paymentMethodStats[m].count += 1;
        paymentMethodStats[m].totalAmount += p.amount;
      }
    });

    // Recent payments
    const recentPayments = payments.slice(0, 8);

    return {
      totalStudents: students.length,
      totalExpectedFees,
      totalCollectedFees,
      totalPendingFees,
      totalOverdueAmount,
      totalLateFeesCalculated,
      collectionPercentage,
      deptStats,
      courseStats,
      paymentMethodStats,
      recentPayments,
      studentSummaries,
    };
  }
}

export const dataService = new DataService();
