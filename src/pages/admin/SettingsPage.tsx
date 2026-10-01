import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  GraduationCap,
  Save,
  RotateCcw,
  CheckCircle2,
  FileCheck,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetAllData } = useApp();

  const [formData, setFormData] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetConfirm = () => {
    resetAllData();
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            College ERP System Preferences
          </h1>
          <p className="text-xs text-slate-500">
            Institutional profile, legal signatory details, active academic terms, and environment resets
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Preferences updated successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* College Profile */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Institutional Identity & Branding</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">College / University Name</label>
              <input
                type="text"
                required
                value={formData.collegeName}
                onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 font-bold text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Tagline & Affiliation Subtitle</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-slate-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Institutional Code</label>
              <input
                type="text"
                value={formData.collegeCode}
                onChange={(e) => setFormData({ ...formData, collegeCode: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Accreditation</label>
              <input
                type="text"
                value={formData.affiliation}
                onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Accounts Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Finance Office Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Campus Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2"
              />
            </div>
          </div>
        </div>

        {/* Academic Calendar Term */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Current Academic Term</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Active Academic Year</label>
              <input
                type="text"
                value={formData.currentAcademicYear}
                onChange={(e) => setFormData({ ...formData, currentAcademicYear: e.target.value })}
                placeholder="2026-2027"
                className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Active Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                value={formData.currentSemester}
                onChange={(e) => setFormData({ ...formData, currentSemester: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Legal Signatory on Fee Receipts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileCheck className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Authorized Signatory on Official Receipts</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Signatory Title</label>
              <input
                type="text"
                value={formData.signatoryTitle}
                onChange={(e) => setFormData({ ...formData, signatoryTitle: e.target.value })}
                placeholder="Finance & Accounts Officer"
                className="w-full rounded-lg border border-slate-300 p-2"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Signatory Full Name</label>
              <input
                type="text"
                value={formData.signatoryName}
                onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                placeholder="Dr. R. Ramanathan, M.Com, Ph.D."
                className="w-full rounded-lg border border-slate-300 p-2 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Fresh Demo State
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            Save Preferences
          </button>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset Entire Portal State to Demo?"
        message="This will re-initialize all 10 students, fee structures, receipts, and payments to original factory demo data. Any custom payments or students created will be cleared."
        confirmLabel="Yes, Reset Demo Data"
        onConfirm={handleResetConfirm}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
