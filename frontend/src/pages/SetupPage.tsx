import React, { useEffect, useState } from 'react';
import { loadSetupMockData, saveSetupMockData } from '../data/setupMockData';

const SetupPage: React.FC = () => {
  const [initialSetupData] = useState(loadSetupMockData);
  const [rooms, setRooms] = useState<string[]>(initialSetupData.rooms);
  const [subjects, setSubjects] = useState(initialSetupData.subjects);

  const [roomInput, setRoomInput] = useState('');
  const [roomError, setRoomError] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [subjectAbbreviationInput, setSubjectAbbreviationInput] = useState('');

  useEffect(() => {
    saveSetupMockData({ rooms, subjects });
  }, [rooms, subjects]);

  const addRoom = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedRoom = roomInput.trim();
    const nextRoom = trimmedRoom.toLowerCase() === 'gym' ? 'Gym' : trimmedRoom;
    const isValidRoom = /^\d+$/.test(trimmedRoom) || trimmedRoom.toLowerCase() === 'gym';

    if (!nextRoom) {
      setRoomError('Room is required.');
      return;
    }

    if (!isValidRoom) {
      setRoomError('Use only a room number. The only text exception is Gym.');
      return;
    }

    if (rooms.some((room) => room.toLowerCase() === nextRoom.toLowerCase())) {
      setRoomError('This room already exists.');
      return;
    }

    setRooms((currentRooms) => [...currentRooms, nextRoom]);
    setRoomInput('');
    setRoomError('');
  };

  const addSubject = (event: React.FormEvent) => {
    event.preventDefault();
    const nextSubject = subjectInput.trim();
    const nextAbbreviation =
      subjectAbbreviationInput.trim().toUpperCase() ||
      nextSubject.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() ||
      nextSubject.slice(0, 3).toUpperCase();

    if (!nextSubject) {
      return;
    }

    setSubjects((currentSubjects) => [
      ...currentSubjects,
      {
        id: Date.now(),
        subject: nextSubject,
        abbreviation: nextAbbreviation,
      },
    ]);
    setSubjectInput('');
    setSubjectAbbreviationInput('');
  };

  const removeSubject = (subjectId: number) => {
    setSubjects((currentSubjects) => currentSubjects.filter((subject) => subject.id !== subjectId));
  };

  return (
    <section className="mx-auto max-w-7xl space-y-5 px-2 py-2 text-palette-pine">
      <header className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-5 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-palette-pine">Setup</h1>
            <p className="mt-1 max-w-2xl text-sm font-medium text-palette-moss">
              Add base school rooms and subjects before creating schedules.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-md border border-palette-lichen/45 bg-white px-4 py-3">
              <p className="text-2xl font-black text-palette-pine">{rooms.length}</p>
              <p className="text-[11px] font-bold uppercase text-palette-moss">Rooms</p>
            </div>
            <div className="rounded-md border border-palette-lichen/45 bg-white px-4 py-3">
              <p className="text-2xl font-black text-palette-pine">{subjects.length}</p>
              <p className="text-[11px] font-bold uppercase text-palette-moss">Subjects</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={addRoom} className="rounded-lg border border-palette-lichen/45 bg-white p-4 shadow-soft">
          <h2 className="text-lg font-black text-palette-pine">Rooms</h2>
          <p className="mt-1 text-sm font-medium text-palette-moss">Use room numbers only. Gym is the only text exception.</p>

          <label className="mt-4 flex flex-col gap-1.5 text-xs font-black uppercase tracking-wide text-palette-moss">
            Room number
            <input
              type="text"
              value={roomInput}
              onChange={(event) => {
                setRoomInput(event.target.value);
                setRoomError('');
              }}
              placeholder="e.g. 305 or Gym"
              className="h-11 rounded-md border border-palette-lichen/60 bg-palette-mist/40 px-3 text-sm font-semibold normal-case tracking-normal text-palette-pine outline-none transition placeholder:text-palette-moss/60 focus:border-palette-leaf focus:bg-white focus:ring-2 focus:ring-palette-leaf/20"
            />
          </label>
          {roomError && <p className="mt-2 text-xs font-bold text-red-600">{roomError}</p>}

          <button
            type="submit"
            className="mt-3 h-10 w-full rounded-md bg-palette-fern px-4 text-sm font-black text-white shadow-soft transition hover:bg-palette-leaf"
          >
            Add room
          </button>

          <div className="mt-4 flex flex-wrap gap-2">
            {rooms.map((room) => (
              <span key={room} className="rounded-full bg-palette-mist px-3 py-1 text-xs font-black text-palette-pine">
                Room {room}
              </span>
            ))}
          </div>
        </form>

        <form onSubmit={addSubject} className="rounded-lg border border-palette-lichen/45 bg-white p-4 shadow-soft">
          <h2 className="text-lg font-black text-palette-pine">Subjects</h2>
          <p className="mt-1 text-sm font-medium text-palette-moss">Create the subject names and their short labels.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
            <label className="flex flex-col gap-1.5 text-xs font-black uppercase tracking-wide text-palette-moss">
              Subject name
              <input
                type="text"
                value={subjectInput}
                onChange={(event) => setSubjectInput(event.target.value)}
                placeholder="e.g. Chemistry"
                className="h-11 rounded-md border border-palette-lichen/60 bg-palette-mist/40 px-3 text-sm font-semibold normal-case tracking-normal text-palette-pine outline-none transition placeholder:text-palette-moss/60 focus:border-palette-leaf focus:bg-white focus:ring-2 focus:ring-palette-leaf/20"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-black uppercase tracking-wide text-palette-moss">
              Abbreviation
              <input
                type="text"
                value={subjectAbbreviationInput}
                onChange={(event) => setSubjectAbbreviationInput(event.target.value)}
                placeholder="e.g. CHEM"
                maxLength={8}
                className="h-11 rounded-md border border-palette-lichen/60 bg-palette-mist/40 px-3 text-sm font-semibold uppercase tracking-normal text-palette-pine outline-none transition placeholder:text-palette-moss/60 focus:border-palette-leaf focus:bg-white focus:ring-2 focus:ring-palette-leaf/20"
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-3 h-10 w-full rounded-md bg-palette-fern px-4 text-sm font-black text-white shadow-soft transition hover:bg-palette-leaf"
          >
            Add subject
          </button>
        </form>
      </div>

      <section className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-4 shadow-soft">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black text-palette-pine">Subject Setup</h2>
            <p className="text-sm font-medium text-palette-moss">This list is the base subject data for schedules and attendance.</p>
          </div>
          <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-palette-moss">
            {subjects.length} subjects
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-palette-lichen/45 bg-white">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead className="bg-palette-sage/20 text-xs font-black uppercase tracking-wide text-palette-moss">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Abbreviation</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-palette-lichen/35">
              {subjects.map((subject) => (
                <tr key={subject.id} className="transition hover:bg-palette-mist/60">
                  <td className="px-4 py-3 font-black text-palette-pine">{subject.subject}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-palette-mist px-3 py-1 text-xs font-black text-palette-pine">
                      {subject.abbreviation}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeSubject(subject.id)}
                      className="rounded-md border border-red-200 px-4 py-2 text-xs font-black text-red-600 transition hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
};

export default SetupPage;
