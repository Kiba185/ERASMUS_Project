import API_URL from '../config/config.tsx';
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface AbsenceNote {
  id: string;         // attendance record id used as the key
  attendanceId: number;
  date: string;
  subjectName: string;
  status: 'unexcused' | 'sent';
  reason?: string;
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
        // Load all absences for the student
        const urlAtt = user?.role === 'parent' && activeChildId 
            ? `${API_URL}/api/myattendance?studentId=${activeChildId}` 
            : `${API_URL}/api/myattendance`;
        const attRes = await fetch(urlAtt, { credentials: 'include' });
        if (!attRes.ok) throw new Error('Failed to load absences');
        const attData: any[] = await attRes.json();

        // Load any notes the student has already sent
        const urlNote = user?.role === 'parent' && activeChildId
            ? `${API_URL}/api/absence-notes?studentId=${activeChildId}`
            : `${API_URL}/api/absence-notes`;
        const noteRes = await fetch(urlNote, { credentials: 'include' });
        const noteData: any[] = noteRes.ok ? await noteRes.json() : [];
        const notesByAttendanceId = new Map(noteData.map(n => [n.attendanceId, n]));

        const mapped: AbsenceNote[] = attData.map(r => {
          const note = notesByAttendanceId.get(r.id);
          return {
            id: String(r.id),
            attendanceId: r.id,
            date: r.date.slice(0, 10),
            subjectName: r.subject?.name ?? 'Unknown',
            status: note ? 'sent' : 'unexcused',
            reason: note?.reason,
          };
        });

        setAbsences(mapped);
        if (mapped.length > 0) {
          setSelectedId(mapped[0].id);
          setReason(mapped[0].reason ?? '');
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

  const totalUnexcused = useMemo(
    () => absences.filter(a => a.status === 'unexcused').length,
    [absences],
  );

  const handleSelect = (absence: AbsenceNote) => {
    setSelectedId(absence.id);
    setReason(absence.reason ?? '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-2 py-2">
      <header className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-5 text-center shadow-soft">
        <h1 className="text-3xl font-black tracking-tight text-palette-pine">Absence Notes</h1>
        <p className="mt-2 text-sm font-medium text-palette-moss">
          Select an unexcused absence and send an excuse note to the teacher.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-palette-pine">Absences</h2>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-palette-pine">
              {totalUnexcused} unexcused
            </span>
          </div>

          {absences.length === 0 ? (
            <p className="py-8 text-center text-palette-moss font-medium">No absences on record.</p>
          ) : (
            <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1">
              {absences.map(absence => {
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
                          {formatDateLabel(absence.date)} — {absence.subjectName}
                        </p>
                      </div>
                      <span className={`rounded-md px-3 py-1 text-xs font-bold ${isSent ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {isSent ? 'Sent' : 'Unexcused'}
                      </span>
                    </div>
                    {absence.reason && (
                      <p className="mt-2 line-clamp-1 text-xs font-medium text-palette-moss">
                        Reason: {absence.reason}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-5 shadow-soft">
          <h2 className="text-xl font-bold text-palette-pine">Excuse</h2>
          {selectedAbsence ? (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
                  className="resize-none rounded-md border border-palette-lichen/60 bg-white px-3 py-2 text-sm font-medium text-palette-pine outline-none focus:border-palette-leaf focus:ring-2 focus:ring-palette-leaf/20"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={!reason.trim() || submitting}
                className="w-full rounded-md bg-palette-fern px-4 py-2.5 text-sm font-bold text-white transition hover:bg-palette-leaf disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send excuse to teacher'}
              </button>

              {selectedAbsence.status === 'sent' && (
                <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                  Excuse note has been sent.
                </p>
              )}
            </form>
          ) : (
            <p className="mt-4 text-sm font-medium text-palette-moss">Select an absence from the list.</p>
          )}
        </aside>
      </section>
    </div>
  );
};

export default AbsenceNotesPage;