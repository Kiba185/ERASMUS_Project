import React, { useMemo, useState } from 'react';

type NoteStatus = 'unexcused' | 'sent';

interface AbsenceNote {
  id: string;
  date: string;
  lessons: number;
  status: NoteStatus;
  reason?: string;
}

const INITIAL_ABSENCES: AbsenceNote[] = [
  { id: 'maths-2026-06-22', date: '22. 6. 2026', lessons: 4, status: 'unexcused' },
  { id: 'physics-2026-06-20', date: '20. 6. 2026', lessons: 3, status: 'unexcused' },
  { id: 'english-2026-06-18', date: '18. 6. 2026', lessons: 2, status: 'unexcused' },
  { id: 'czech-2026-06-14', date: '14. 6. 2026', lessons: 5, status: 'unexcused' },
  { id: 'pe-2026-06-10', date: '10. 6. 2026', lessons: 4, status: 'unexcused' },
  { id: 'history-2026-06-06', date: '6. 6. 2026', lessons: 3, status: 'unexcused' },
  { id: 'chemistry-2026-06-03', date: '3. 6. 2026', lessons: 3, status: 'unexcused' },
];

const AbsenceNotesPage: React.FC = () => {
  const [absences, setAbsences] = useState<AbsenceNote[]>(INITIAL_ABSENCES);
  const [selectedAbsenceId, setSelectedAbsenceId] = useState(INITIAL_ABSENCES[0]?.id ?? '');
  const [reason, setReason] = useState('');

  const selectedAbsence = absences.find((absence) => absence.id === selectedAbsenceId) ?? null;
  const totalUnexcusedLessons = useMemo(
    () =>
      absences.reduce(
        (total, absence) => total + (absence.status === 'unexcused' ? absence.lessons : 0),
        0,
      ),
    [absences],
  );

  const handleSelectAbsence = (absence: AbsenceNote) => {
    setSelectedAbsenceId(absence.id);
    setReason(absence.reason ?? '');
  };

  const handleSubmitExcuse = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedAbsence || !reason.trim()) {
      return;
    }

    setAbsences((currentAbsences) =>
      currentAbsences.map((absence) =>
        absence.id === selectedAbsence.id
          ? {
              ...absence,
              status: 'sent',
              reason: reason.trim(),
            }
          : absence,
      ),
    );
  };

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
            <h2 className="text-xl font-bold text-palette-pine">Unexcused absences</h2>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-palette-pine">
              {totalUnexcusedLessons} lessons
            </span>
          </div>

          <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1">
            {absences.map((absence) => {
              const isSelected = selectedAbsenceId === absence.id;
              const isSent = absence.status === 'sent';

              return (
                <button
                  key={absence.id}
                  type="button"
                  onClick={() => handleSelectAbsence(absence)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    isSelected
                      ? 'border-palette-leaf bg-white shadow-soft'
                      : 'border-palette-lichen/45 bg-white hover:border-palette-leaf hover:bg-palette-sage/15'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-black text-palette-pine">
                        {absence.date} - {absence.lessons} lessons
                      </p>
                    </div>
                    <span
                      className={`rounded-md px-3 py-1 text-xs font-bold ${
                        isSent ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isSent ? 'Sent' : 'Excuse'}
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
        </div>

        <aside className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-5 shadow-soft">
          <h2 className="text-xl font-bold text-palette-pine">Excuse</h2>

          {selectedAbsence ? (
            <form onSubmit={handleSubmitExcuse} className="mt-4 space-y-4">
              <div className="rounded-lg border border-palette-lichen/45 bg-white p-3">
                <p className="text-sm font-black text-palette-pine">{selectedAbsence.date}</p>
                <p className="mt-1 text-xs font-bold text-palette-moss">
                {selectedAbsence.lessons} lessons
                </p>
              </div>

              <label className="flex flex-col gap-2 text-sm font-bold text-palette-pine">
                Reason for excuse
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Write the reason for the absence..."
                  rows={7}
                  className="resize-none rounded-md border border-palette-lichen/60 bg-white px-3 py-2 text-sm font-medium text-palette-pine outline-none focus:border-palette-leaf focus:ring-2 focus:ring-palette-leaf/20"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={!reason.trim()}
                className="w-full rounded-md bg-palette-fern px-4 py-2.5 text-sm font-bold text-white transition hover:bg-palette-leaf disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send excuse to teacher
              </button>

              {selectedAbsence.status === 'sent' && (
                <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                  Excuse note has been prepared for the teacher.
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
