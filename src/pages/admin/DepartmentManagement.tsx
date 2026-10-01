import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { Department } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const DepartmentManagement: React.FC = () => {
  const { refreshData } = useApp();

  const departments = dataService.getDepartments();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);

  const initialForm = {
    code: '',
    name: '',
    hodName: '',
    contactNumber: '+91 98451 00000',
    email: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  };

  const [formData, setFormData] = useState(initialForm);

  const openAddModal = () => {
    setEditingDept(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (d: Department) => {
    setEditingDept(d);
    setFormData({
      code: d.code,
      name: d.name,
      hodName: d.hodName,
      contactNumber: d.contactNumber,
      email: d.email,
      status: d.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (editingDept) {
      dataService.updateDepartment(editingDept.id, formData);
    } else {
      dataService.addDepartment(formData);
    }
    refreshData();
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deletingDept) {
      dataService.deleteDepartment(deletingDept.id);
      refreshData();
      setDeletingDept(null);
    }
  };

  const toggleStatus = (d: Department) => {
    dataService.updateDepartment(d.id, {
      status: d.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
    refreshData();
  };

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.hodName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Department Management
          </h1>
          <p className="text-xs text-slate-500">
            Institutional academic departments, Head of Department (HOD) details, and communications
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Department
        </button>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search departments or HODs..."
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
              <th className="py-3 px-5">Code</th>
              <th className="py-3 px-4">Department Name</th>
              <th className="py-3 px-4">HOD Name</th>
              <th className="py-3 px-4">Contact Phone</th>
              <th className="py-3 px-4">Official Email</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredDepts.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-5 font-mono font-bold text-blue-900">{d.code}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">{d.name}</td>
                <td className="py-3.5 px-4 font-medium text-slate-800">{d.hodName}</td>
                <td className="py-3.5 px-4 font-mono text-slate-600">{d.contactNumber}</td>
                <td className="py-3.5 px-4 font-mono text-blue-800">{d.email}</td>
                <td className="py-3.5 px-3 text-center">
                  <button
                    onClick={() => toggleStatus(d)}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
                      d.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {d.status}
                  </button>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEditModal(d)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600"
                      title="Edit Department"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingDept(d)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Delete Department"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingDept ? 'Edit Academic Department' : 'Register New Department'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CSE"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Computer Science and Engineering"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Head of Department (HOD) *</label>
                <input
                  type="text"
                  required
                  value={formData.hodName}
                  onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                  placeholder="e.g. Dr. Suresh Kumar Sharma"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="hod.dept@abcet.edu.in"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>
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
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingDept}
        title="Delete Department?"
        message={`Are you sure you want to delete ${deletingDept?.name}? All course mappings to this department may be impacted.`}
        confirmLabel="Yes, Delete Department"
        onConfirm={handleDelete}
        onCancel={() => setDeletingDept(null)}
      />
    </div>
  );
};
