import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Copy,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  X,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { FeeCategory, FeeStructureItem } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const FeeStructureManagement: React.FC = () => {
  const { refreshData } = useApp();

  const courses = dataService.getCourses();
  const departments = dataService.getDepartments();
  const feeStructures = dataService.getFeeStructures();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => courses[0]?.id || '');
  const [selectedSemester, setSelectedSemester] = useState<number>(5);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FeeStructureItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<FeeStructureItem | null>(null);
  const [targetCloneSemester, setTargetCloneSemester] = useState<number>(6);

  const initialForm = {
    academicYear: '2026-2027',
    courseId: selectedCourseId,
    departmentId: courses.find((c) => c.id === selectedCourseId)?.departmentId || departments[0]?.id || '',
    semester: selectedSemester,
    category: 'TUITION' as FeeCategory,
    categoryName: 'Tuition Fee',
    amount: 50000,
    dueDate: '2026-10-15',
    isMandatory: true,
    description: '',
  };

  const [formData, setFormData] = useState(initialForm);

  const currentItems = feeStructures.filter(
    (f) => f.courseId === selectedCourseId && f.semester === selectedSemester
  );

  const totalCourseSemesterFee = currentItems.reduce((acc, item) => acc + item.amount, 0);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      ...initialForm,
      courseId: selectedCourseId,
      departmentId: courses.find((c) => c.id === selectedCourseId)?.departmentId || departments[0]?.id || '',
      semester: selectedSemester,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: FeeStructureItem) => {
    setEditingItem(item);
    setFormData({
      academicYear: item.academicYear,
      courseId: item.courseId,
      departmentId: item.departmentId,
      semester: item.semester,
      category: item.category,
      categoryName: item.categoryName,
      amount: item.amount,
      dueDate: item.dueDate,
      isMandatory: item.isMandatory,
      description: item.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryName.trim() || formData.amount <= 0) return;

    if (editingItem) {
      dataService.updateFeeStructure(editingItem.id, formData);
    } else {
      dataService.addFeeStructure(formData);
    }
    refreshData();
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deletingItem) {
      dataService.deleteFeeStructure(deletingItem.id);
      refreshData();
      setDeletingItem(null);
    }
  };

  const handleDuplicate = () => {
    dataService.duplicateFeeStructure(selectedSemester, targetCloneSemester, selectedCourseId);
    refreshData();
    setIsDuplicateModalOpen(false);
    setSelectedSemester(targetCloneSemester);
  };

  const categoryPresets: { id: FeeCategory; label: string }[] = [
    { id: 'TUITION', label: 'Tuition Fee' },
    { id: 'ADMISSION', label: 'Admission Fee' },
    { id: 'REGISTRATION', label: 'Registration Fee' },
    { id: 'EXAMINATION', label: 'Examination Fee' },
    { id: 'LIBRARY', label: 'Library Fee' },
    { id: 'LABORATORY', label: 'Laboratory Fee' },
    { id: 'DEVELOPMENT', label: 'Development Fee' },
    { id: 'SPORTS', label: 'Sports Fee' },
    { id: 'STUDENT_WELFARE', label: 'Student Welfare Fee' },
    { id: 'TECHNOLOGY', label: 'Technology / Internet Fee' },
    { id: 'HOSTEL', label: 'Hostel Fee' },
    { id: 'MESS', label: 'Mess Charges' },
    { id: 'TRANSPORT', label: 'Transport Fee' },
    { id: 'OTHER', label: 'Other Auxiliary Fee' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Fee Structure Management
          </h1>
          <p className="text-xs text-slate-500">
            Define syllabus fee heads, mandatory components, payment deadlines, and multi-semester cloning
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDuplicateModalOpen(true)}
            disabled={currentItems.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50"
          >
            <Copy className="h-3.5 w-3.5 text-blue-600" />
            Duplicate Structure
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Fee Head
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Degree Program
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Academic Semester
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <button
                key={sem}
                type="button"
                onClick={() => setSelectedSemester(sem)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  selectedSemester === sem
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Sem {sem}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Fee Structure Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Fee Heads for Semester {selectedSemester}
            </h3>
          </div>
          <div className="text-xs font-semibold">
            <span className="text-slate-500">Calculated Semester Total: </span>
            <span className="font-mono text-base font-black text-blue-950">
              {formatCurrency(totalCourseSemesterFee)}
            </span>
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No fee structure items configured for this course and semester yet. Click "Add Fee Head" or "Duplicate Structure" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Category / Fee Head</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Fee Amount</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      {item.categoryName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          item.isMandatory
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.isMandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {formatDate(item.dueDate)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {item.description || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50/90 font-bold text-slate-900">
                  <td colSpan={3} className="py-3.5 px-5 uppercase text-xs">
                    Total Semester Fee Scheduled:
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-base text-blue-950 font-black">
                    {formatCurrency(totalCourseSemesterFee)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Fee Head Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Fee Head' : 'Add New Fee Head'}
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
                <label className="block font-bold text-slate-700 mb-1">Fee Category Type *</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const cat = e.target.value as FeeCategory;
                    const preset = categoryPresets.find((p) => p.id === cat);
                    setFormData({
                      ...formData,
                      category: cat,
                      categoryName: preset?.label || cat,
                    });
                  }}
                  className="w-full rounded-lg border border-slate-300 p-2"
                >
                  {categoryPresets.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fee Title / Label *</label>
                <input
                  type="text"
                  required
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  placeholder="e.g. Tuition Fee"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Memo</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Includes semester lab manual & licensing"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="is_mand"
                  type="checkbox"
                  checked={formData.isMandatory}
                  onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <label htmlFor="is_mand" className="text-slate-700 font-medium">
                  Mandatory fee item (Required for semester clearance)
                </label>
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
                  Save Fee Head
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      {isDuplicateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Duplicate Fee Structure</h3>
            <p className="text-xs text-slate-500 mb-4">
              Clone all fee heads from Semester {selectedSemester} into another semester.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Semester</label>
                <select
                  value={targetCloneSemester}
                  onChange={(e) => setTargetCloneSemester(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2.5 font-bold"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8]
                    .filter((s) => s !== selectedSemester)
                    .map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDuplicateModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-blue-700"
                >
                  Clone Structure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingItem}
        title="Delete Fee Head?"
        message={`Are you sure you want to remove "${deletingItem?.categoryName}" (${formatCurrency(deletingItem?.amount)}) from Semester ${deletingItem?.semester}?`}
        confirmLabel="Yes, Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
};
