import API_URL from '../config/config.tsx';
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';

interface AbsenceNote {
  id: string;
  attendanceId: number;
  date: string;
  subjectName: string;
  status: 'unexcused' | 'sent' | 'excused';
  reason?: string;
  // For teachers only:
  studentId?: number;
  studentName?: string;
  noteId?: number;
  classId?: number;
}

const formatDateLabel = (isoDate: string) => {
  const d = new Date(isoDate);
  return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
};

const AbsenceNotesPage: React.FC = () => {
  const { user, activeChildId } = useAuth();
  const [absences, setAbsences] = useState<AbsenceNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [showMultiExcuseModal, setShowMultiExcuseModal] = useState(false);
  const [studentAbsences, setStudentAbsences] = useState<any[]>([]);
  const [loadingStudentAbsences, setLoadingStudentAbsences] = useState(false);
  const [selectedAttendanceIds, setSelectedAttendanceIds] = useState<number[]>([]);
  const [modalStudents, setModalStudents] = useState<any[]>([]);
  const [modalTimetable, setModalTimetable] = useState<any[]>([]);
  const [modalPeriods, setModalPeriods] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      try {
        if (user.role === 'teacher' || user.role === 'admin') {
          // TEACHER INBOX MODE
          const res = await fetch(`${API_URL}/api/absence-notes/inbox`, { credentials: 'include' });
          if (!res.ok) throw new Error('Failed to load inbox');
          const data = await res.json();
          const mapped: AbsenceNote[] = data.map((n: any) => ({
            id: String(n.id),
            noteId: n.id,
            attendanceId: n.attendanceId,
            date: n.attendance?.date?.slice(0, 10) ?? new Date().toISOString(),
            subjectName: n.attendance?.subject?.name ?? 'Unknown',
            status: n.status,
            reason: n.reason,
            studentId: n.studentId,
            studentName: `${n.student?.firstName} ${n.student?.lastName}`,
            classId: n.attendance?.class?.id,
          }));
          setAbsences(mapped);
          if (mapped.length > 0) {
            setSelectedId(mapped[0].id);
            setReason(mapped[0].reason ?? '');
          }
        } else {
          // STUDENT / PARENT MODE
          const urlAtt = user?.role === 'parent' && activeChildId 
              ? `${API_URL}/api/myattendance?studentId=${activeChildId}` 
              : `${API_URL}/api/myattendance`;
          const attRes = await fetch(urlAtt, { credentials: 'include' });
          if (!attRes.ok) throw new Error('Failed to load absences');
          const attData: any[] = await attRes.json();

          const urlNote = user?.role === 'parent' && activeChildId
              ? `${API_URL}/api/absence-notes?studentId=${activeChildId}`
              : `${API_URL}/api/absence-notes`;
          const noteRes = await fetch(urlNote, { credentials: 'include' });
          const noteData: any[] = noteRes.ok ? await noteRes.json() : [];
          const notesByAttendanceId = new Map(noteData.map((n: any) => [n.attendanceId, n]));

          const mapped: AbsenceNote[] = attData
            .filter((r: any) => r.absenceType !== 'Excused absence')
            .map((r: any) => {
              const note = notesByAttendanceId.get(r.id);
              return {
                id: String(r.id),
                attendanceId: r.id,
                date: r.date.slice(0, 10),
                subjectName: r.subject?.name ?? 'Unknown',
                status: note ? note.status : 'unexcused',
                reason: note?.reason,
              };
          });

          setAbsences(mapped);
          if (mapped.length > 0) {
            setSelectedId(mapped[0].id);
            setReason(mapped[0].reason ?? '');
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, activeChildId]);

  const selectedAbsence = absences.find(a => a.id === selectedId) ?? null;

  const totalActionable = useMemo(
    () => user?.role === 'teacher' || user?.role === 'admin'
      ? absences.length // for teacher, all items in inbox are actionable
      : absences.filter(a => a.status === 'unexcused').length,
    [absences, user],
  );

  const handleSelect = (absence: AbsenceNote) => {
    setSelectedId(absence.id);
    setReason(absence.reason ?? '');
  };

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAbsence || !reason.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/absence-notes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendanceId: selectedAbsence.attendanceId, reason: reason.trim() }),
      });
      if (!res.ok) throw new Error('Failed to submit note');

      setAbsences(prev => prev.map(a =>
        a.id === selectedAbsence.id ? { ...a, status: 'sent', reason: reason.trim() } : a
      ));
    } catch (e: any) {
      alert(e.message ?? 'Failed to submit excuse note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTeacherApprove = async () => {
    if (!selectedAbsence || selectedAbsence.studentId == null) return;
    setLoadingStudentAbsences(true);
    setShowMultiExcuseModal(true);
    try {
      const res = await fetch(`${API_URL}/api/myattendance?studentId=${selectedAbsence.studentId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch student absences');
      const data = await res.json();
      
      // Only keep absences on the same date or unexcused absences
      const filterUnexcused = data.filter((r: any) => r.status === 'absent' && r.absenceType !== 'Excused absence');
      setStudentAbsences(filterUnexcused);
      
      // Auto-select the one from the note, and any others on the SAME date
      const sameDateAbsences = filterUnexcused.filter((a: any) => a.date.startsWith(selectedAbsence.date));
      setSelectedAttendanceIds(sameDateAbsences.map((a: any) => a.id));

      // Fetch class info, timetable, and all periods in parallel
      const [classRes, ttRes, periodsRes] = await Promise.all([
        fetch(`${API_URL}/api/class/studentId/${selectedAbsence.studentId}`, { credentials: 'include' }),
        fetch(`${API_URL}/api/timetables/${selectedAbsence.studentId}`, { credentials: 'include' }),
        fetch(`${API_URL}/api/periods`, { credentials: 'include' })
      ]);

      if (classRes.ok) {
        const classInfo = await classRes.json();
        setModalStudents(classInfo.students || []);
      }

      if (ttRes.ok) {
        const ttData = await ttRes.json();
        const d = new Date(selectedAbsence.date);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[d.getDay()];
        const todayTt = ttData.filter((t: any) => t.day === dayName);
        setModalTimetable(todayTt);
      }

      if (periodsRes.ok) {
        const pData = await periodsRes.json();
        const periodsList = pData.data || [];
        setModalPeriods(periodsList.sort((a: any, b: any) => a.periodNumber - b.periodNumber));
      }
      
    } catch (e) {
      console.error(e);
      alert('Failed to load student absences.');
      setShowMultiExcuseModal(false);
    } finally {
      setLoadingStudentAbsences(false);
    }
  };

  const handleBulkApprove = async (action: 'excuse' | 'reject') => {
    if (!selectedAbsence || selectedAbsence.noteId == null) return;
    setSubmitting(true);
    try {
      if (action === 'excuse' && selectedAttendanceIds.length > 0) {
        const res = await fetch(`${API_URL}/api/absence-notes/${selectedAbsence.noteId}/bulk-approve`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attendanceIds: selectedAttendanceIds })
        });
        if (!res.ok) throw new Error('Failed to bulk approve');
        
        // Update local state
        const updated = absences.map(a => 
          a.id === selectedAbsence.id ? { ...a, status: 'excused' as const } : a
        );
        setAbsences(updated);
      } else if (action === 'reject') {
        const res = await fetch(`${API_URL}/api/absence-notes/${selectedAbsence.noteId}/reject`, {
          method: 'PUT',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to reject note');
        
        const updated = absences.filter(a => a.id !== selectedAbsence.id);
        setAbsences(updated);
        setSelectedId(null);
      }
      setShowMultiExcuseModal(false);
    } catch (e: any) {
      alert(e.message ?? 'Failed to process excuse note');
    } finally {
      setSubmitting(false);
    }
  };

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const pendingAbsences = absences.filter(a => a.status !== 'excused');
  const historyAbsences = absences.filter(a => a.status === 'excused');
  const [showHistory, setShowHistory] = useState(false);

  if (loading) return (
        <div className="p-8 flex items-center justify-center gap-3 text-palette-pine font-bold text-lg">
            <svg className="w-6 h-6 animate-spin text-palette-fern" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Loading absence notes...
        </div>
    );

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-2 py-2">
      <header className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-5 text-center shadow-soft">
        <h1 className="text-3xl font-black tracking-tight text-palette-pine">
          {isTeacher ? 'Absence Inbox' : 'Absence Notes'}
        </h1>
        <p className="mt-2 text-sm font-medium text-palette-moss">
          {isTeacher 
            ? 'Review and approve absence excuses sent by parents.'
            : 'Select an unexcused absence and send an excuse note to the teacher.'}
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-5 shadow-soft relative">
          
          {loading && (
             <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm gap-4">
                 <div className="w-10 h-10 border-4 border-palette-fern border-t-transparent rounded-full animate-spin" />
                 <span className="text-sm font-black text-palette-pine animate-pulse">Loading...</span>
             </div>
          )}

          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-palette-pine">
              {isTeacher ? 'Pending Approval' : 'Absences'}
            </h2>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-palette-pine">
              {totalActionable} {isTeacher ? 'pending' : 'unexcused'}
            </span>
          </div>

          {!loading && pendingAbsences.length === 0 ? (
            <p className="py-8 text-center text-palette-moss font-medium">
              {isTeacher ? 'Inbox is empty. All caught up!' : 'No absences on record.'}
            </p>
          ) : (
            <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1">
              {(isTeacher ? pendingAbsences : absences).map(absence => {
                const isSelected = selectedId === absence.id;
                const isSent = absence.status === 'sent';
                return (
                  <button
                    key={absence.id}
                    type="button"
                    onClick={() => handleSelect(absence)}
                    className={`w-full rounded-lg border p-3 text-left transition ${isSelected ? 'border-palette-leaf bg-white shadow-soft' : 'border-palette-lichen/45 bg-white hover:border-palette-leaf hover:bg-palette-sage/15'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-black text-palette-pine">
                          {isTeacher && absence.studentName ? (
                            <>{absence.studentName} — {formatDateLabel(absence.date)}</>
                          ) : (
                            <>{formatDateLabel(absence.date)} — {absence.subjectName}</>
                          )}
                        </p>
                      </div>
                      <span className={`rounded-md px-3 py-1 text-xs font-bold ${isSent ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {isSent ? (isTeacher ? 'Pending' : 'Sent') : 'Unexcused'}
                      </span>
                    </div>
                    {absence.reason && (
                      <p className="mt-2 line-clamp-1 text-xs font-medium text-palette-moss">
                        {isTeacher ? 'Reason: ' : 'Reason: '} {absence.reason}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {isTeacher && historyAbsences.length > 0 && (
            <div className="mt-6 border-t border-palette-lichen/45 pt-4">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center justify-between w-full text-left text-palette-pine font-bold hover:text-palette-leaf transition"
              >
                <span>History ({historyAbsences.length} excused)</span>
                <span className="material-symbols-outlined transition-transform duration-300" style={{ transform: showHistory ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  expand_more
                </span>
              </button>
              
              {showHistory && (
                <div className="mt-3 max-h-[300px] space-y-2 overflow-y-auto pr-1">
                  {historyAbsences.map(absence => {
                    const isSelected = selectedId === absence.id;
                    return (
                      <button
                        key={absence.id}
                        type="button"
                        onClick={() => handleSelect(absence)}
                        className={`w-full rounded-lg border p-3 text-left transition opacity-75 ${isSelected ? 'border-palette-leaf bg-white shadow-soft opacity-100' : 'border-palette-lichen/45 bg-white hover:opacity-100'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-palette-pine">
                              {absence.studentName} — {formatDateLabel(absence.date)}
                            </p>
                          </div>
                          <span className="rounded-md px-3 py-1 text-xs font-bold bg-green-100 text-green-700">
                            Excused
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-5 shadow-soft">
          <h2 className="text-xl font-bold text-palette-pine">{isTeacher ? 'Review Note' : 'Excuse'}</h2>
          
          {selectedAbsence ? (
            isTeacher ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-lg border border-palette-lichen/45 bg-white p-3">
                  <p className="text-sm font-black text-palette-pine">{selectedAbsence.studentName}</p>
                  <p className="mt-1 text-xs font-bold text-palette-moss">{formatDateLabel(selectedAbsence.date)} — {selectedAbsence.subjectName}</p>
                </div>
                
                <div className="rounded-lg border border-palette-lichen/45 bg-white p-3 min-h-[140px]">
                  <p className="text-xs font-bold uppercase text-palette-moss mb-2">Reason provided</p>
                  <p className="text-sm font-medium text-palette-pine break-words">
                    {selectedAbsence.reason || 'No reason provided.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTeacherApprove}
                  disabled={submitting || selectedAbsence.status === 'excused'}
                  className="w-full rounded-md bg-palette-fern px-4 py-2.5 text-sm font-bold text-white transition hover:bg-palette-leaf disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {selectedAbsence.status === 'excused' ? 'Already Excused' : 'Review & Excuse Absences'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleParentSubmit} className="mt-4 space-y-4">
                <div className="rounded-lg border border-palette-lichen/45 bg-white p-3">
                  <p className="text-sm font-black text-palette-pine">{formatDateLabel(selectedAbsence.date)}</p>
                  <p className="mt-1 text-xs font-bold text-palette-moss">{selectedAbsence.subjectName}</p>
                </div>

                <label className="flex flex-col gap-2 text-sm font-bold text-palette-pine">
                  Reason for excuse
                  <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Write the reason for the absence..."
                    rows={7}
                    readOnly={selectedAbsence.status === 'sent' || submitting}
                    className="resize-none rounded-md border border-palette-lichen/60 bg-white px-3 py-2 text-sm font-medium text-palette-pine outline-none focus:border-palette-leaf focus:ring-2 focus:ring-palette-leaf/20 read-only:bg-palette-mist/50 read-only:text-palette-moss"
                    required
                  />
                </label>

                {selectedAbsence.status !== 'sent' && (
                  <button
                    type="submit"
                    disabled={!reason.trim() || submitting}
                    className="w-full rounded-md bg-palette-fern px-4 py-2.5 text-sm font-bold text-white transition hover:bg-palette-leaf disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send excuse to teacher
                  </button>
                )}

                {selectedAbsence.status === 'sent' && (
                  <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                    Excuse note has been sent.
                  </p>
                )}
              </form>
            )
          ) : (
            <p className="mt-4 text-sm font-medium text-palette-moss">Select an absence from the list.</p>
          )}
        </aside>
      </section>

      {/* MULTI EXCUSE MODAL */}
      {showMultiExcuseModal && createPortal(
        <div className="fixed inset-0 bg-palette-pine/40 backdrop-blur-sm flex items-center justify-center z-[99998] p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-5xl flex flex-col gap-4">
            <h2 className="text-xl font-bold text-palette-pine">Review Absence Note</h2>
            <p className="text-sm text-palette-moss">
              Select all lessons that should be excused using this note.
            </p>
            
            <div className="border border-palette-lichen/45 rounded-lg overflow-x-auto max-h-[50vh] bg-white">
              {loadingStudentAbsences ? (
                <p className="text-center text-sm font-medium text-palette-moss py-8 animate-pulse">Loading schedule...</p>
              ) : modalTimetable.length === 0 ? (
                <p className="text-center text-sm font-medium text-palette-moss py-8">No schedule found for this day.</p>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-palette-mist text-palette-pine border-b border-palette-lichen/45 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 font-bold w-48 sticky left-0 bg-palette-mist z-20 border-r border-palette-lichen/45">Student</th>
                      {modalPeriods.map(p => {
                        const tt = modalTimetable.find(t => t.periodNumber === p.periodNumber);
                        const absenceRec = studentAbsences.find(a => a.periodNumber === p.periodNumber);
                        return (
                          <th key={p.id} className="px-4 py-3 text-center border-r border-palette-lichen/45 last:border-0 min-w-[120px]">
                            <div className="font-black text-palette-pine">{p.periodNumber}.</div>
                            <div className="text-[10px] font-bold text-palette-moss uppercase">{tt?.subject?.name || absenceRec?.subject?.name || '-'}</div>
                            <div className="text-[10px] text-palette-moss">{p.startTime} - {p.endTime}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-palette-lichen/45">
                    {modalStudents.map(student => {
                      const isTarget = student.id === selectedAbsence?.studentId;
                      return (
                        <tr key={student.id} className={`${isTarget ? 'bg-white' : 'bg-gray-50/50 opacity-60'} transition hover:bg-palette-sage/10`}>
                          <td className={`px-4 py-3 font-bold sticky left-0 z-10 border-r border-palette-lichen/45 ${isTarget ? 'bg-white text-palette-pine' : 'bg-gray-50/50 text-palette-moss'}`}>
                            {student.firstName} {student.lastName}
                            {isTarget && <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">Target</span>}
                          </td>
                          {modalPeriods.map(p => {
                            // Find if there's an absence for this period
                            const absenceRec = isTarget ? studentAbsences.find(a => a.periodNumber === p.periodNumber) : null;
                            const isChecked = absenceRec ? selectedAttendanceIds.includes(absenceRec.id) : false;

                            return (
                              <td key={p.id} className="px-4 py-3 text-center border-r border-palette-lichen/45 last:border-0 relative">
                                {!isTarget ? (
                                  <div className="w-full h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                                    -
                                  </div>
                                ) : !absenceRec ? (
                                  <div className="w-full h-8 rounded-md bg-green-50 flex items-center justify-center text-green-600 font-bold text-xs">
                                    Present
                                  </div>
                                ) : (
                                  <label className={`w-full h-8 rounded-md flex items-center justify-center cursor-pointer transition border ${isChecked ? 'bg-red-100 border-red-300 text-red-700' : 'bg-white border-red-200 text-red-500 hover:bg-red-50'}`}>
                                    <input
                                      type="checkbox"
                                      className="sr-only"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) setSelectedAttendanceIds(prev => [...prev, absenceRec.id]);
                                        else setSelectedAttendanceIds(prev => prev.filter(id => id !== absenceRec.id));
                                      }}
                                    />
                                    <span className="text-xs font-bold">{isChecked ? 'Excuse' : 'Unexcused'}</span>
                                  </label>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="flex justify-between mt-2 pt-4 border-t border-palette-lichen/45 gap-3">
              <button
                type="button"
                onClick={() => handleBulkApprove('reject')}
                disabled={submitting}
                className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
              >
                Reject Note
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMultiExcuseModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-bold text-palette-pine bg-gray-100 hover:bg-gray-200 rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkApprove('excuse')}
                  disabled={submitting || selectedAttendanceIds.length === 0}
                  className="px-5 py-2 text-sm font-bold text-white bg-palette-fern hover:bg-palette-leaf rounded-md transition disabled:opacity-50"
                >
                  Excuse ({selectedAttendanceIds.length}) Lessons
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* FULLSCREEN SAVING OVERLAY */}
      {submitting && createPortal(
        <div className="fixed inset-0 bg-palette-pine/40 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-palette-fern border-t-transparent rounded-full animate-spin" />
            <p className="text-palette-pine font-bold text-lg">Processing...</p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AbsenceNotesPage;