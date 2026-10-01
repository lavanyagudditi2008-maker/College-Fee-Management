import React, { useState } from 'react';
import {
  Award,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  X,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { Scholarship } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export const ScholarshipManagement: React.FC = () => {
  const { refreshData } = useApp();

  const scholarships = dataService.getScholarships();
  const students = dataService.getStudents();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialForm = {
    studentId: students[0]?.id || '',
    scholarshipName: 'State Merit Scholarship',
    type: 'MERIT' as const,
    percentage: 50,
    approvedAmount: 25000,
    academicYear: '2026-2027',
    eligibility: 'CGPA >= 9.0',
    status: 'APPROVED' as const,
  };

  const [formData, setFormData] = useState(initialForm);

  const handleApprove = (id: string) => {
    dataService.updateScholarshipStatus(id, 'APPROVED');
    refreshData();
  };

  const handleReject = (id: string) => {
    dataService.updateScholarshipStatus(id, 'REJECTED');
    refreshData();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.scholarshipName.trim() || formData.approvedAmount <= 0) return;

    dataService.addScholarship(formData);
    refreshData();
    setIsModalOpen(false);
  };

  const enrichedScholarships = scholarships.map((s) => {
    const student = students.find((std) => std.id === s.studentId);
    const summary = student ? dataService.getStudentFeeSummary(student.id) : null;
    return {
      ...s,
      student,
      summary,
    };
  });

  const filtered = enrichedScholarships.filter(
    (s) =>
      s.scholarshipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.student?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.student?.regNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalApprovedDisbursed = scholarships
    .filter((s) => s.status === 'APPROVED')
    .reduce((sum, s) => sum + s.approvedAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Scholarships & Fee Concessions
          </h1>
          <p className="text-xs text-slate-500">
            Merit awards, need-based fee remissions, sports grants, and net tuition adjustments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-900 shadow-2xs">
            <span>Approved Concessions: </span>
            <span className="font-mono text-base font-bold text-emerald-700 ml-1">
              {formatCurrency(totalApprovedDisbursed)}
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Grant Scholarship
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search scholarship name, student, or reg no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-5">Scholarship Scheme</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Eligibility Criteria</th>
              <th className="py-3 px-4 text-right">Granted Amount</th>
              <th className="py-3 px-4 text-right">Student Net Payable</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-center">Approval Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-5 font-bold text-slate-900">
                  {s.scholarshipName}
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-slate-800">{s.student?.name || 'Unknown'}</p>
                  <p className="font-mono text-[10px] text-slate-400">{s.student?.regNumber}</p>
                </td>
                <td className="py-3.5 px-3 font-semibold text-blue-900">
                  {s.type}
                </td>
                <td className="py-3.5 px-3 text-slate-500 max-w-xs truncate" title={s.eligibility}>
                  {s.eligibility}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 text-sm">
                  {formatCurrency(s.approvedAmount)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                  {s.summary ? formatCurrency(s.summary.netFee) : '-'}
                </td>
                <td className="py-3.5 px-3 text-center">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      s.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : s.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  {s.status === 'PENDING' ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleApprove(s.id)}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(s.id)}
                        className="rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grant Scholarship Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Grant Scholarship / Concession</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Beneficiary Student</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 font-medium"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.regNumber}) - Sem {s.currentSemester}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scholarship Title</label>
                <input
                  type="text"
                  required
                  value={formData.scholarshipName}
                  onChange={(e) => setFormData({ ...formData, scholarshipName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Concession Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  >
                    <option value="MERIT">MERIT</option>
                    <option value="NEED_BASED">NEED_BASED</option>
                    <option value="SPORTS">SPORTS</option>
                    <option value="GOVERNMENT">GOVERNMENT</option>
                    <option value="ALUMNI">ALUMNI</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Approved Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.approvedAmount}
                    onChange={(e) => setFormData({ ...formData, approvedAmount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                  placeholder="e.g. CGPA >= 9.5 or State Sports Medal"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-blue-700"
                >
                  Grant Concession
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
