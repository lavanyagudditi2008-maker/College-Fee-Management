import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { Course } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const CourseManagement: React.FC = () => {
  const { refreshData } = useApp();

  const courses = dataService.getCourses();
  const departments = dataService.getDepartments();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const initialForm = {
    code: '',
    name: '',
    departmentId: departments[0]?.id || '',
    durationYears: 4,
    totalSemesters: 8,
    academicYear: '2026-2027',
    intake: 60,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  };

  const [formData, setFormData] = useState(initialForm);

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setFormData({
      code: c.code,
      name: c.name,
      departmentId: c.departmentId,
      durationYears: c.durationYears,
      totalSemesters: c.totalSemesters,
      academicYear: c.academicYear,
      intake: c.intake,
      status: c.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (editingCourse) {
      dataService.updateCourse(editingCourse.id, formData);
    } else {
      dataService.addCourse(formData);
    }
    refreshData();
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deletingCourse) {
      dataService.deleteCourse(deletingCourse.id);
      refreshData();
      setDeletingCourse(null);
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Degree & Course Management
          </h1>
          <p className="text-xs text-slate-500">
            Configure academic programs, duration, semester capacity, and department affiliations
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Degree Course
        </button>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course title or code..."
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
              <th className="py-3 px-5">Course Code</th>
              <th className="py-3 px-4">Program Name</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-3 text-center">Duration</th>
              <th className="py-3 px-3 text-center">Semesters</th>
              <th className="py-3 px-3 text-center">Intake</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredCourses.map((c) => {
              const dept = departments.find((d) => d.id === c.departmentId);
              return (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-blue-900">{c.code}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{dept?.name || c.departmentId}</td>
                  <td className="py-3.5 px-3 text-center font-medium">{c.durationYears} Years</td>
                  <td className="py-3.5 px-3 text-center font-bold text-blue-900">{c.totalSemesters} Sems</td>
                  <td className="py-3.5 px-3 text-center font-mono font-semibold">{c.intake} seats</td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600"
                        title="Edit Course"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCourse(c)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete Course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingCourse ? 'Edit Degree Course' : 'Create New Course'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. BTECH-CSE"
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. B.Tech Computer Science and Engineering"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Host Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.durationYears}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationYears: Number(e.target.value),
                        totalSemesters: Number(e.target.value) * 2,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semesters</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.totalSemesters}
                    onChange={(e) => setFormData({ ...formData, totalSemesters: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Annual Intake</label>
                  <input
                    type="number"
                    value={formData.intake}
                    onChange={(e) => setFormData({ ...formData, intake: Number(e.target.value) })}
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
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingCourse}
        title="Delete Degree Course?"
        message={`Are you sure you want to remove ${deletingCourse?.name}? All associated fee structure assignments may be affected.`}
        confirmLabel="Yes, Delete Course"
        onConfirm={handleDelete}
        onCancel={() => setDeletingCourse(null)}
      />
    </div>
  );
};
