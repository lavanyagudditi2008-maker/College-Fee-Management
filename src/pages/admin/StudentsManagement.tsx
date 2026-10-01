import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  CreditCard,
  CheckCircle2,
  X,
  FileSpreadsheet,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { Student } from '../../types';
import { FeeStatusBadge } from '../../components/common/FeeStatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatCurrency } from '../../utils/formatters';

export const StudentsManagement: React.FC = () => {
  const { refreshData, switchRoleQuick } = useApp();

  const students = dataService.getStudents();
  const courses = dataService.getCourses();
  const departments = dataService.getDepartments();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [semFilter, setSemFilter] = useState('ALL');
  const [feeStatusFilter, setFeeStatusFilter] = useState('ALL');

  // Modals state
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const initialFormData = {
    regNumber: '',
    rollNumber: '',
    admissionNumber: '',
    name: '',
    dob: '2005-01-01',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    mobile: '',
    altMobile: '',
    personalEmail: '',
    collegeEmail: '',
    courseId: courses[0]?.id || '',
    departmentId: departments[0]?.id || '',
    specialization: '',
    batch: '2024-2028',
    academicYear: '2026-2027',
    currentSemester: 1,
    section: 'A',
    yearOfStudy: 1,
    admissionDate: '2024-08-01',
    status: 'ACTIVE' as 'ACTIVE' | 'GRADUATED' | 'SUSPENDED',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560100',
    guardianName: '',
    guardianMobile: '',
    guardianEmail: '',
    relationship: 'Father',
  };

  const [formData, setFormData] = useState(initialFormData);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      ...initialFormData,
      courseId: courses[0]?.id || '',
      departmentId: departments[0]?.id || '',
    });
    setFormError(null);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (std: Student) => {
    setEditingStudent(std);
    setFormData({
      regNumber: std.regNumber,
      rollNumber: std.rollNumber,
      admissionNumber: std.admissionNumber,
      name: std.name,
      dob: std.dob,
      gender: std.gender,
      mobile: std.mobile,
      altMobile: std.altMobile || '',
      personalEmail: std.personalEmail,
      collegeEmail: std.collegeEmail,
      courseId: std.courseId,
      departmentId: std.departmentId,
      specialization: std.specialization || '',
      batch: std.batch,
      academicYear: std.academicYear,
      currentSemester: std.currentSemester,
      section: std.section,
      yearOfStudy: std.yearOfStudy,
      admissionDate: std.admissionDate,
      status: std.status,
      address: std.address,
      city: std.city,
      state: std.state,
      pinCode: std.pinCode,
      guardianName: std.guardianName,
      guardianMobile: std.guardianMobile,
      guardianEmail: std.guardianEmail,
      relationship: std.relationship,
    });
    setFormError(null);
    setIsAddEditModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.name.trim() || !formData.regNumber.trim() || !formData.mobile.trim() || !formData.personalEmail.trim()) {
      setFormError('Please fill in all mandatory fields (*)');
      return;
    }

    // Check unique regNumber
    const existing = dataService.getStudentByRegNumber(formData.regNumber);
    if (existing && (!editingStudent || existing.id !== editingStudent.id)) {
      setFormError(`Registration number "${formData.regNumber}" is already assigned to ${existing.name}`);
      return;
    }

    try {
      if (editingStudent) {
        dataService.updateStudent(editingStudent.id, formData);
      } else {
        dataService.addStudent(formData);
      }
      refreshData();
      setIsAddEditModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save student record.');
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingStudent) {
      dataService.deleteStudent(deletingStudent.id);
      refreshData();
      setDeletingStudent(null);
    }
  };

  // Compute student summaries and apply filters
  const enrichedStudents = students.map((std) => {
    const summary = dataService.getStudentFeeSummary(std.id);
    const course = courses.find((c) => c.id === std.courseId);
    const dept = departments.find((d) => d.id === std.departmentId);
    return {
      ...std,
      courseName: course?.name || std.courseId,
      deptCode: dept?.code || std.departmentId,
      summary,
    };
  });

  const filteredStudents = enrichedStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.mobile.includes(searchTerm) ||
      s.personalEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.courseName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = courseFilter === 'ALL' || s.courseId === courseFilter;
    const matchesDept = deptFilter === 'ALL' || s.departmentId === deptFilter;
    const matchesSem = semFilter === 'ALL' || s.currentSemester.toString() === semFilter;
    const matchesStatus = feeStatusFilter === 'ALL' || s.summary.overallStatus === feeStatusFilter;

    return matchesSearch && matchesCourse && matchesDept && matchesSem && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Student Information & Accounts Roster
          </h1>
          <p className="text-xs text-slate-500">
            Enrolled students master database, academic mappings, and real-time fee realization status
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Enroll New Student
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name, Reg No, Roll No, Phone, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={feeStatusFilter}
              onChange={(e) => setFeeStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Fee Statuses</option>
              <option value="PAID">Fully Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Students Roster Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredStudents.length} of {students.length} enrolled students</span>
          <span className="font-mono">Real-time balances calculated</span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No students found matching the selected search and filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">Reg No / Roll</th>
                  <th className="py-3 px-4">Course & Dept</th>
                  <th className="py-3 px-2 text-center">Sem</th>
                  <th className="py-3 px-3 text-right">Net Fee</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-3 text-right">Pending</th>
                  <th className="py-3 px-3 text-center">Fee Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{std.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{std.personalEmail}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-mono font-bold text-blue-900">{std.regNumber}</p>
                      <p className="font-mono text-[10px] text-slate-500">{std.rollNumber}</p>
                    </td>
                    <td className="py-3 px-4 max-w-[180px] truncate" title={std.courseName}>
                      <p className="font-medium text-slate-800 truncate">{std.courseName}</p>
                      <p className="text-[10px] text-slate-400">{std.deptCode} &bull; Sec {std.section}</p>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-slate-700">
                      S{std.currentSemester}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                      {formatCurrency(std.summary.netFee)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-emerald-600">
                      {formatCurrency(std.summary.totalPaid)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={std.summary.pendingFee > 0 ? 'text-rose-600' : 'text-slate-400'}>
                        {formatCurrency(std.summary.pendingFee)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <FeeStatusBadge status={std.summary.overallStatus} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedStudentForView(std)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                          title="View Full Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(std)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600"
                          title="Edit Student"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => switchRoleQuick('STUDENT', std.regNumber)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                          title="View Student Portal Perspective"
                        >
                          <CreditCard className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingStudent(std)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete Student Record"
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
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingStudent ? 'Edit Student Record' : 'Enroll New Student'}
                </h3>
                <p className="text-xs text-slate-500">
                  Complete academic profile and automated fee allocation
                </p>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Student Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration No *</label>
                  <input
                    type="text"
                    required
                    value={formData.regNumber}
                    onChange={(e) => setFormData({ ...formData, regNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. 2026CSE011"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    placeholder="24CS015"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Course *</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-hidden"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department *</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-hidden"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester *</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.currentSemester}
                    onChange={(e) => setFormData({ ...formData, currentSemester: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="GRADUATED">GRADUATED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Personal Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.personalEmail}
                    onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">College Email</label>
                  <input
                    type="email"
                    value={formData.collegeEmail}
                    onChange={(e) => setFormData({ ...formData, collegeEmail: e.target.value })}
                    placeholder="student@abcet.edu.in"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, locality, landmarks"
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City & State</label>
                  <input
                    type="text"
                    value={`${formData.city}, ${formData.state}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(',');
                      setFormData({ ...formData, city: parts[0]?.trim() || '', state: parts[1]?.trim() || '' });
                    }}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Guardian Mobile</label>
                  <input
                    type="text"
                    value={formData.guardianMobile}
                    onChange={(e) => setFormData({ ...formData, guardianMobile: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="Father / Mother / Guardian"
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
                >
                  {editingStudent ? 'Save Changes' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {selectedStudentForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedStudentForView.name}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedStudentForView.regNumber} &bull; Roll: {selectedStudentForView.rollNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForView(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400">Course:</span>
                  <p className="font-semibold text-slate-800">
                    {courses.find((c) => c.id === selectedStudentForView.courseId)?.name}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Department:</span>
                  <p className="font-semibold text-slate-800">
                    {departments.find((d) => d.id === selectedStudentForView.departmentId)?.name}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Semester & Batch:</span>
                  <p className="font-semibold text-slate-800">
                    Sem {selectedStudentForView.currentSemester} ({selectedStudentForView.batch})
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Mobile:</span>
                  <p className="font-mono font-semibold text-slate-800">{selectedStudentForView.mobile}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Fee Ledger Status</h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  {dataService.getStudentFees(selectedStudentForView.id).map((f) => (
                    <div key={f.id} className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-800">{f.categoryName}</p>
                        <p className="text-[10px] text-slate-400">Semester {f.semester}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-slate-900">{formatCurrency(f.amount)}</p>
                        <FeeStatusBadge status={f.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingStudent}
        title="Delete Student Record?"
        message={`Are you sure you want to delete ${deletingStudent?.name} (${deletingStudent?.regNumber})? This will remove all associated fee structures and receipts.`}
        confirmLabel="Yes, Delete Student"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingStudent(null)}
      />
    </div>
  );
};
