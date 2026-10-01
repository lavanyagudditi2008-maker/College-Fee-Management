import React, { useState } from 'react';
import {
  GraduationCap,
  Shield,
  UserCheck,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useApp } from '../../context/AppContext';

export const LoginPage: React.FC = () => {
  const { login, settings } = useApp();

  const [activeTab, setActiveTab] = useState<UserRole>('STUDENT');
  const [identifier, setIdentifier] = useState('2026CSE001');
  const [password, setPassword] = useState('student123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (role: UserRole) => {
    setActiveTab(role);
    setError(null);
    if (role === 'STUDENT') {
      setIdentifier('2026CSE001');
      setPassword('student123');
    } else if (role === 'ADMIN') {
      setIdentifier('admin');
      setPassword('admin123');
    } else {
      setIdentifier('accounts');
      setPassword('accounts123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = login(activeTab, identifier, password);
    if (!result.success) {
      setError(result.error || 'Invalid credentials. Please verify and try again.');
    }
  };

  const fillQuickDemo = (regNum: string) => {
    setActiveTab('STUDENT');
    setIdentifier(regNum);
    setPassword('student123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* College Crest */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 ring-4 ring-white/10">
          <GraduationCap className="h-9 w-9" />
        </div>

        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          {settings.collegeName}
        </h2>
        <p className="mt-1 text-xs font-medium text-blue-200">
          College Fee Management & Finance ERP Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('STUDENT')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === 'STUDENT'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Student
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('ADMIN')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === 'ADMIN'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('ACCOUNTS')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === 'ACCOUNTS'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Accounts
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {activeTab === 'STUDENT'
                  ? 'Registration Number / Student ID'
                  : activeTab === 'ADMIN'
                  ? 'Username / Employee ID'
                  : 'Accounts Employee ID'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    activeTab === 'STUDENT'
                      ? 'e.g. 2026CSE001'
                      : activeTab === 'ADMIN'
                      ? 'admin'
                      : 'accounts'
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-xs font-medium text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                {activeTab === 'STUDENT' && (
                  <button
                    type="button"
                    onClick={() => alert('Demo Reset: Password is "student123"')}
                    className="text-[11px] font-medium text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-xs font-medium text-slate-900 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember_me" className="ml-2 block text-xs text-slate-600">
                Remember me on this computer
              </label>
            </div>

            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
            >
              <span>Sign In to {activeTab === 'STUDENT' ? 'Student Portal' : 'ERP System'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Demo Quick-Fill Accounts:</span>
            </div>

            {activeTab === 'STUDENT' ? (
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Aarav (Partial Paid):</span>
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('2026CSE001')}
                    className="font-mono font-semibold text-blue-600 hover:underline"
                  >
                    2026CSE001
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Priya (Merit Scholarship):</span>
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('2026CSE002')}
                    className="font-mono font-semibold text-blue-600 hover:underline"
                  >
                    2026CSE002
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Rohan (Overdue Fees):</span>
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('2026ECE001')}
                    className="font-mono font-semibold text-blue-600 hover:underline"
                  >
                    2026ECE001
                  </button>
                </div>
                <p className="mt-1 pt-1 border-t border-slate-200 text-[10px] text-slate-400">
                  Password for all student accounts: <span className="font-mono font-semibold text-slate-700">student123</span>
                </p>
              </div>
            ) : activeTab === 'ADMIN' ? (
              <div className="text-[11px] text-slate-600 space-y-1">
                <p>
                  Username: <span className="font-mono font-bold text-slate-900">admin</span>
                </p>
                <p>
                  Password: <span className="font-mono font-bold text-slate-900">admin123</span>
                </p>
              </div>
            ) : (
              <div className="text-[11px] text-slate-600 space-y-1">
                <p>
                  Employee ID: <span className="font-mono font-bold text-slate-900">accounts</span>
                </p>
                <p>
                  Password: <span className="font-mono font-bold text-slate-900">accounts123</span>
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Official ERP Portal &bull; Protected by Kalasalingam Academy of Research and Education Security Architecture
        </p>
      </div>
    </div>
  );
};
