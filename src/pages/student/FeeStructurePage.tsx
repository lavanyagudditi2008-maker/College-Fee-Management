import React, { useState } from 'react';
import {
  Layers,
  Calendar,
  Filter,
  CreditCard,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { FeeStatusBadge } from '../../components/common/FeeStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const FeeStructurePage: React.FC = () => {
  const { currentStudent, openPaymentModal } = useApp();

  if (!currentStudent) return null;

  const [selectedSemester, setSelectedSemester] = useState<number>(currentStudent.currentSemester);

  const course = dataService.getCourses().find((c) => c.id === currentStudent.courseId);
  const department = dataService.getDepartments().find((d) => d.id === currentStudent.departmentId);

  // All student fees for this student
  const allStudentFees = dataService.getStudentFees(currentStudent.id);
  const feesForSemester = allStudentFees.filter((f) => f.semester === selectedSemester);

  // Dynamic calculations!
  const totalAmount = feesForSemester.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = feesForSemester.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = feesForSemester.reduce((sum, f) => sum + f.pendingAmount, 0);

  const availableSemesters = [1, 2, 3, 4, 5, 6, 7, 8].slice(0, course?.totalSemesters || 8);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Official Fee Structure
          </h1>
          <p className="text-xs text-slate-500">
            Approved tuition and auxiliary fee schedule for {course?.name} ({currentStudent.academicYear})
          </p>
        </div>

        {/* Semester Filter Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Select Semester:</span>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-blue-900 shadow-xs focus:border-blue-500 focus:outline-hidden"
          >
            {availableSemesters.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem} {sem === currentStudent.currentSemester ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course & Department Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-xs">
        <div>
          <span className="text-slate-400 font-medium">Academic Year</span>
          <p className="font-semibold text-slate-800">{currentStudent.academicYear}</p>
        </div>
        <div>
          <span className="text-slate-400 font-medium">Course Code</span>
          <p className="font-semibold text-slate-800">{course?.code}</p>
        </div>
        <div>
          <span className="text-slate-400 font-medium">Department</span>
          <p className="font-semibold text-slate-800">{department?.name}</p>
        </div>
        <div>
          <span className="text-slate-400 font-medium">Target Semester</span>
          <p className="font-bold text-blue-900">Semester {selectedSemester}</p>
        </div>
      </div>

      {/* Main Fee Structure Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Semester {selectedSemester} Itemized Breakdown
            </h3>
          </div>
          {totalPending > 0 && selectedSemester === currentStudent.currentSemester && (
            <button
              onClick={() =>
                openPaymentModal({
                  studentId: currentStudent.id,
                  semester: selectedSemester,
                  category: 'All Pending Fees',
                  maxAmount: totalPending,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Pay Balance ({formatCurrency(totalPending)})
            </button>
          )}
        </div>

        {feesForSemester.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No fee structure items assigned for Semester {selectedSemester} yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Fee Type</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Gross Amount</th>
                  <th className="py-3 px-4 text-right">Paid Amount</th>
                  <th className="py-3 px-4 text-right">Pending Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {feesForSemester.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {item.categoryName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {formatDate(item.dueDate)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-600 font-medium">
                      {formatCurrency(item.paidAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className={item.pendingAmount > 0 ? 'text-rose-600' : 'text-slate-400'}>
                        {formatCurrency(item.pendingAmount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <FeeStatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.pendingAmount > 0 ? (
                        <button
                          onClick={() =>
                            openPaymentModal({
                              studentId: currentStudent.id,
                              semester: item.semester,
                              category: item.categoryName,
                              maxAmount: item.pendingAmount,
                            })
                          }
                          className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100"
                        >
                          Pay
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Dynamic Totals Footer */}
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50/90 font-bold text-slate-900">
                  <td colSpan={2} className="py-3.5 px-5 uppercase text-xs tracking-wider">
                    Total for Semester {selectedSemester}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm">
                    {formatCurrency(totalAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm text-emerald-600">
                    {formatCurrency(totalPaid)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm text-rose-600">
                    {formatCurrency(totalPending)}
                  </td>
                  <td colSpan={2} className="py-3.5 px-4 text-center text-xs text-slate-500 font-normal">
                    {totalPending === 0 ? 'Fully Cleared' : `${formatCurrency(totalPending)} Outstanding`}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Advisory Note */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex items-start gap-3 text-xs text-blue-900">
        <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
        <p>
          Fee structures are published in accordance with state regulatory norms and institutional governing body guidelines.
          Any concessions or scholarships approved by the Finance Committee are adjusted against the net tuition fee.
        </p>
      </div>
    </div>
  );
};
