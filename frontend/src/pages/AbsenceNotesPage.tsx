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
  studentName?: string;
  noteId?: number;
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
            studentName: `${n.student?.firstName} ${n.student?.lastName}`,
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
            .filter((r: any) => r.status !== 'Excused absence')
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
    if (!selectedAbsence || selectedAbsence.noteId == null) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/absence-notes/${selectedAbsence.noteId}/approve`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to approve note');
      
      // Update note status instead of removing
      const updated = absences.map(a => 
        a.id === selectedAbsence.id ? { ...a, status: 'excused' as const } : a
      );
      setAbsences(updated);
    } catch (e: any) {
      alert(e.message ?? 'Failed to approve excuse note');
    } finally {
      setSubmitting(false);
    }
  };

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const pendingAbsences = absences.filter(a => a.status !== 'excused');
  const historyAbsences = absences.filter(a => a.status === 'excused');
  const [showHistory, setShowHistory] = useState(false);

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
                  {selectedAbsence.status === 'excused' ? 'Already Excused' : 'Approve and Excuse Absence'}
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