import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import API_URL from '../../config/config';

interface StudentProfile {
  id: number;
  firstName?: string;
  lastName?: string;
  name?: string;
}

interface BulkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  onSuccess: () => void;
}

const BulkAttendanceModal: React.FC<BulkAttendanceModalProps> = ({ isOpen, onClose, students, onSuccess }) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'present' | 'absent'>('absent');
  const [absenceType, setAbsenceType] = useState<string>('Unexcused absence');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1 = form, 2 = confirmation

  if (!isOpen) return null;

  const handleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map(s => s.id));
    }
  };

  const handleToggleStudent = (id: number) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/attendance/bulk`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: selectedStudentIds,
          startDate,
          endDate,
          status,
          absenceType: status === 'absent' ? absenceType : null
        })
      });

      if (!res.ok) throw new Error('Failed to bulk mark attendance');
      
      onSuccess();
      onClose();
    } catch (e: any) {
      alert(e.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-palette-pine/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <h2 className="text-2xl font-black text-palette-pine mb-1">Bulk Mark Attendance</h2>
        <p className="text-sm font-medium text-palette-moss mb-6">Apply attendance changes for multiple students over a date range.</p>

        {step === 1 ? (
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-bold text-palette-pine">
                Start Date *
                <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="rounded-md border p-2.5 border-palette-lichen/60" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-bold text-palette-pine">
                End Date *
                <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="rounded-md border p-2.5 border-palette-lichen/60" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-bold text-palette-pine">
                Status *
                <select value={status} onChange={e => setStatus(e.target.value as any)} className="rounded-md border p-2.5 border-palette-lichen/60">
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </label>
              {status === 'absent' && (
                <label className="flex flex-col gap-1.5 text-sm font-bold text-palette-pine">
                  Absence Type *
                  <select value={absenceType} onChange={e => setAbsenceType(e.target.value)} className="rounded-md border p-2.5 border-palette-lichen/60">
                    <option value="Unexcused absence">Unexcused absence</option>
                    <option value="Excused absence">Excused absence</option>
                    <option value="Late">Late</option>
                  </select>
                </label>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-palette-pine">Select Students *</span>
                <button type="button" onClick={handleSelectAll} className="text-xs font-bold text-palette-leaf hover:underline">
                  {selectedStudentIds.length === students.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[25vh] overflow-y-auto border border-palette-lichen/45 rounded-lg p-2 bg-gray-50">
                {students.map(s => {
                  const isSelected = selectedStudentIds.includes(s.id);
                  return (
                    <label key={s.id} className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition ${isSelected ? 'bg-palette-leaf text-white border-palette-fern' : 'bg-white border-palette-lichen/60 hover:bg-gray-100 text-palette-pine'}`}>
                      <input type="checkbox" className="sr-only" checked={isSelected} onChange={() => handleToggleStudent(s.id)} />
                      <span className="text-sm font-bold truncate">{s.firstName} {s.lastName}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-bold text-yellow-800 mb-1">Confirm Bulk Action</h3>
              <p className="text-sm text-yellow-700">You are about to modify attendance for <strong>{selectedStudentIds.length}</strong> student(s) from <strong>{new Date(startDate).toLocaleDateString()}</strong> to <strong>{new Date(endDate).toLocaleDateString()}</strong>.</p>
              <p className="text-sm text-yellow-700 mt-2">New Status: <strong>{status === 'absent' ? absenceType : 'Present'}</strong></p>
            </div>
            
            <p className="text-xs text-palette-moss font-medium">This will override any existing attendance records for the selected students during this date range.</p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-palette-lichen/45">
          <button type="button" onClick={onClose} disabled={submitting} className="px-5 py-2.5 rounded-lg text-sm font-bold bg-gray-100 text-palette-pine hover:bg-gray-200 transition">
            Cancel
          </button>
          
          {step === 1 ? (
            <button 
              type="button" 
              onClick={() => setStep(2)} 
              disabled={!startDate || !endDate || selectedStudentIds.length === 0} 
              className="px-5 py-2.5 rounded-lg text-sm font-bold bg-palette-fern text-white hover:bg-palette-leaf transition disabled:opacity-50"
            >
              Continue to Review
            </button>
          ) : (
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={submitting} 
              className="px-5 py-2.5 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Confirm & Apply
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BulkAttendanceModal;
