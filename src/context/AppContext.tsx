import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CollegeSettings,
  FeeReceiptItem,
  Notification,
  Student,
  UserRole,
} from '../types';
import { dataService } from '../services/dataService';

interface PaymentModalParams {
  studentId: string;
  semester: number;
  category: string;
  maxAmount: number;
}

interface AppContextType {
  role: UserRole | null;
  currentStudent: Student | null;
  activePage: string;
  setActivePage: (page: string) => void;
  login: (role: UserRole, idOrUsername: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  switchRoleQuick: (role: UserRole, studentRegNumber?: string) => void;
  
  // Data reactivity trigger
  dataVersion: number;
  refreshData: () => void;

  // Settings
  settings: CollegeSettings;
  updateSettings: (newSettings: Partial<CollegeSettings>) => void;
  resetAllData: () => void;

  // Notifications
  notifications: Notification[];
  unreadNotifsCount: number;
  markNotifAsRead: (id: string) => void;
  markAllNotifsAsRead: () => void;

  // Receipt Modal
  selectedReceipt: FeeReceiptItem | null;
  openReceiptModal: (receipt: FeeReceiptItem) => void;
  closeReceiptModal: () => void;

  // Payment Modal
  paymentModalParams: PaymentModalParams | null;
  openPaymentModal: (params: PaymentModalParams) => void;
  closePaymentModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session storage or state for auth
  const [role, setRole] = useState<UserRole | null>(() => {
    return (localStorage.getItem('cfm_auth_role') as UserRole) || 'STUDENT';
  });

  const [currentStudentId, setCurrentStudentId] = useState<string>(() => {
    return localStorage.getItem('cfm_current_student_id') || 'std-001';
  });

  const [activePage, setActivePage] = useState<string>('dashboard');
  const [dataVersion, setDataVersion] = useState<number>(1);
  const [settings, setSettings] = useState<CollegeSettings>(() => dataService.getSettings());

  // Modals
  const [selectedReceipt, setSelectedReceipt] = useState<FeeReceiptItem | null>(null);
  const [paymentModalParams, setPaymentModalParams] = useState<PaymentModalParams | null>(null);

  const refreshData = () => {
    setDataVersion((v) => v + 1);
    setSettings(dataService.getSettings());
  };

  const currentStudent = currentStudentId ? dataService.getStudentById(currentStudentId) || null : null;

  // Sync auth state to localStorage
  useEffect(() => {
    if (role) {
      localStorage.setItem('cfm_auth_role', role);
    } else {
      localStorage.removeItem('cfm_auth_role');
    }
  }, [role]);

  useEffect(() => {
    if (currentStudentId) {
      localStorage.setItem('cfm_current_student_id', currentStudentId);
    } else {
      localStorage.removeItem('cfm_current_student_id');
    }
  }, [currentStudentId]);

  // Notifications
  const notifications = dataService.getNotifications(role === 'STUDENT' ? currentStudentId : undefined);
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const markNotifAsRead = (id: string) => {
    dataService.markNotificationAsRead(id);
    refreshData();
  };

  const markAllNotifsAsRead = () => {
    dataService.markAllNotificationsAsRead(role === 'STUDENT' ? currentStudentId : undefined);
    refreshData();
  };

  // Login handler
  const login = (targetRole: UserRole, idOrUsername: string, pass: string): { success: boolean; error?: string } => {
    const trimmedId = idOrUsername.trim();
    const trimmedPass = pass.trim();

    if (!trimmedId || !trimmedPass) {
      return { success: false, error: 'Please enter both ID/Username and password.' };
    }

    if (targetRole === 'STUDENT') {
      const student = dataService.getStudentByRegNumber(trimmedId);
      if (!student) {
        return { success: false, error: 'No student found with registration number: ' + trimmedId };
      }
      if (trimmedPass !== 'student123' && trimmedPass !== 'password') {
        return { success: false, error: 'Invalid password. (Demo password is "student123")' };
      }
      setCurrentStudentId(student.id);
      setRole('STUDENT');
      setActivePage('dashboard');
      return { success: true };
    }

    if (targetRole === 'ADMIN') {
      if (trimmedId.toLowerCase() !== 'admin') {
        return { success: false, error: 'Invalid Admin username. (Demo username is "admin")' };
      }
      if (trimmedPass !== 'admin123') {
        return { success: false, error: 'Invalid password. (Demo password is "admin123")' };
      }
      setRole('ADMIN');
      setActivePage('dashboard');
      return { success: true };
    }

    if (targetRole === 'ACCOUNTS') {
      if (trimmedId.toLowerCase() !== 'accounts') {
        return { success: false, error: 'Invalid Employee ID. (Demo ID is "accounts")' };
      }
      if (trimmedPass !== 'accounts123') {
        return { success: false, error: 'Invalid password. (Demo password is "accounts123")' };
      }
      setRole('ACCOUNTS');
      setActivePage('dashboard');
      return { success: true };
    }

    return { success: false, error: 'Unknown role' };
  };

  const logout = () => {
    setRole(null);
    setActivePage('login');
  };

  const switchRoleQuick = (newRole: UserRole, studentRegNumber?: string) => {
    setRole(newRole);
    if (newRole === 'STUDENT') {
      if (studentRegNumber) {
        const std = dataService.getStudentByRegNumber(studentRegNumber);
        if (std) setCurrentStudentId(std.id);
      } else if (!currentStudentId) {
        setCurrentStudentId('std-001');
      }
    }
    setActivePage('dashboard');
  };

  const updateSettings = (newSettings: Partial<CollegeSettings>) => {
    const updated = dataService.updateSettings(newSettings);
    setSettings(updated);
    refreshData();
  };

  const resetAllData = () => {
    dataService.resetToDemo();
    setCurrentStudentId('std-001');
    setRole('STUDENT');
    setActivePage('dashboard');
    refreshData();
  };

  const openReceiptModal = (receipt: FeeReceiptItem) => {
    setSelectedReceipt(receipt);
  };

  const closeReceiptModal = () => {
    setSelectedReceipt(null);
  };

  const openPaymentModal = (params: PaymentModalParams) => {
    setPaymentModalParams(params);
  };

  const closePaymentModal = () => {
    setPaymentModalParams(null);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        currentStudent,
        activePage,
        setActivePage,
        login,
        logout,
        switchRoleQuick,
        dataVersion,
        refreshData,
        settings,
        updateSettings,
        resetAllData,
        notifications,
        unreadNotifsCount,
        markNotifAsRead,
        markAllNotifsAsRead,
        selectedReceipt,
        openReceiptModal,
        closeReceiptModal,
        paymentModalParams,
        openPaymentModal,
        closePaymentModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
