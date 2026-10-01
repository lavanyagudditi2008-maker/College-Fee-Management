import React, { useState } from 'react';
import {
  Home,
  Bus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Edit2,
  Plus,
  X,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { Student } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export const HostelTransportManagement: React.FC = () => {
  const { refreshData } = useApp();

  const students = dataService.getStudents();
  const [activeTab, setActiveTab] = useState<'HOSTEL' | 'TRANSPORT'>('HOSTEL');
  const [searchTerm, setSearchTerm] = useState('');

  // Editing state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [hostelForm, setHostelForm] = useState({
    hostelName: 'Kaveri Boys Hostel (Block A)',
    roomNumber: 'A-101',
    hostelFee: 35000,
    messFee: 25000,
    securityDeposit: 10000,
    pendingHostelFee: 15000,
  });

  const [transportForm, setTransportForm] = useState({
    route: 'Route 1 - City Center to Campus',
    busNumber: 'KA-05-F-1001',
    transportFee: 16000,
    pendingTransportFee: 0,
  });

  const hostelStudents = students.filter((s) => !!s.hostel);
  const transportStudents = students.filter((s) => !!s.transport);

  const openHostelEdit = (s: Student) => {
    setEditingStudent(s);
    if (s.hostel) {
      setHostelForm({ ...s.hostel });
    }
  };

  const openTransportEdit = (s: Student) => {
    setEditingStudent(s);
    if (s.transport) {
      setTransportForm({ ...s.transport });
    }
  };

  const handleSaveHostel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    dataService.updateStudent(editingStudent.id, {
      hostel: hostelForm,
    });
    refreshData();
    setEditingStudent(null);
  };

  const handleSaveTransport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    dataService.updateStudent(editingStudent.id, {
      transport: transportForm,
    });
    refreshData();
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Hostel & Transport Auxiliary Services
          </h1>
          <p className="text-xs text-slate-500">
            Dedicated facility ledger tracking hostel rooms, mess catering dues, bus routes, and transit passes
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab('HOSTEL')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'HOSTEL'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="h-4 w-4" />
            Hostel Accommodation ({hostelStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('TRANSPORT')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'TRANSPORT'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bus className="h-4 w-4" />
            Campus Bus Transit ({transportStudents.length})
          </button>
        </div>
      </div>

      {activeTab === 'HOSTEL' ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Hostel Residents & Mess Accounts</h3>
              <span className="text-xs text-slate-500">
                Total Hostel Dues:{' '}
                <strong className="text-rose-600 font-mono">
                  {formatCurrency(
                    hostelStudents.reduce((sum, s) => sum + (s.hostel?.pendingHostelFee || 0), 0)
                  )}
                </strong>
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Student</th>
                  <th className="py-3 px-4">Hostel Name</th>
                  <th className="py-3 px-3 text-center">Room No</th>
                  <th className="py-3 px-4 text-right">Hostel Rent</th>
                  <th className="py-3 px-4 text-right">Mess Fee</th>
                  <th className="py-3 px-4 text-right">Deposit</th>
                  <th className="py-3 px-4 text-right">Pending Balance</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {hostelStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="font-mono text-[10px] text-slate-400">{s.regNumber}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {s.hostel?.hostelName}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-blue-900">
                      {s.hostel?.roomNumber}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                      {formatCurrency(s.hostel?.hostelFee)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                      {formatCurrency(s.hostel?.messFee)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                      {formatCurrency(s.hostel?.securityDeposit)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className={(s.hostel?.pendingHostelFee || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        {formatCurrency(s.hostel?.pendingHostelFee)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => openHostelEdit(s)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600"
                        title="Update Hostel Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Bus Routes & Transportation Passes</h3>
              <span className="text-xs text-slate-500">
                Total Transit Dues:{' '}
                <strong className="text-rose-600 font-mono">
                  {formatCurrency(
                    transportStudents.reduce((sum, s) => sum + (s.transport?.pendingTransportFee || 0), 0)
                  )}
                </strong>
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Student</th>
                  <th className="py-3 px-4">Bus Route Name</th>
                  <th className="py-3 px-3 text-center">Bus Number</th>
                  <th className="py-3 px-4 text-right">Annual Pass Fee</th>
                  <th className="py-3 px-4 text-right">Pending Balance</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {transportStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="font-mono text-[10px] text-slate-400">{s.regNumber}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {s.transport?.route}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">
                      {s.transport?.busNumber}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                      {formatCurrency(s.transport?.transportFee)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className={(s.transport?.pendingTransportFee || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        {formatCurrency(s.transport?.pendingTransportFee)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => openTransportEdit(s)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600"
                        title="Update Transport Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {activeTab === 'HOSTEL' ? 'Update Hostel Allocation' : 'Update Bus Transit Pass'}
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {activeTab === 'HOSTEL' ? (
              <form onSubmit={handleSaveHostel} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hostel Block Name</label>
                  <input
                    type="text"
                    required
                    value={hostelForm.hostelName}
                    onChange={(e) => setHostelForm({ ...hostelForm, hostelName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    value={hostelForm.roomNumber}
                    onChange={(e) => setHostelForm({ ...hostelForm, roomNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hostel Rent (₹)</label>
                    <input
                      type="number"
                      value={hostelForm.hostelFee}
                      onChange={(e) => setHostelForm({ ...hostelForm, hostelFee: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mess Fee (₹)</label>
                    <input
                      type="number"
                      value={hostelForm.messFee}
                      onChange={(e) => setHostelForm({ ...hostelForm, messFee: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pending Hostel Dues (₹)</label>
                  <input
                    type="number"
                    value={hostelForm.pendingHostelFee}
                    onChange={(e) => setHostelForm({ ...hostelForm, pendingHostelFee: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold text-rose-600"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveTransport} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transit Route Name</label>
                  <input
                    type="text"
                    required
                    value={transportForm.route}
                    onChange={(e) => setTransportForm({ ...transportForm, route: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bus Vehicle Number</label>
                  <input
                    type="text"
                    required
                    value={transportForm.busNumber}
                    onChange={(e) => setTransportForm({ ...transportForm, busNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Annual Fee (₹)</label>
                    <input
                      type="number"
                      value={transportForm.transportFee}
                      onChange={(e) => setTransportForm({ ...transportForm, transportFee: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pending Due (₹)</label>
                    <input
                      type="number"
                      value={transportForm.pendingTransportFee}
                      onChange={(e) => setTransportForm({ ...transportForm, pendingTransportFee: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 p-2 font-mono font-bold text-rose-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
