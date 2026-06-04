import API_URL from '../config/config.tsx';
import React, { useEffect, useState } from 'react';

interface Room {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;   // abbreviation
  color: string;
}

const SetupPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roomInput, setRoomInput] = useState('');
  const [roomError, setRoomError] = useState('');
  const [roomSaving, setRoomSaving] = useState(false);

  const [subjectInput, setSubjectInput] = useState('');
  const [subjectAbbreviationInput, setSubjectAbbreviationInput] = useState('');
  const [subjectSaving, setSubjectSaving] = useState(false);

  // --- FETCH ---

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomRes, subjectRes] = await Promise.all([
        fetch(`${API_URL}/api/rooms`, { credentials: 'include' }),
        fetch(`${API_URL}/api/subjects`, { credentials: 'include' }),
      ]);
      if (!roomRes.ok) throw new Error(`Failed to load rooms (${roomRes.status})`);
      if (!subjectRes.ok) throw new Error(`Failed to load subjects (${subjectRes.status})`);
      setRooms(await roomRes.json());
      setSubjects(await subjectRes.json());
    } catch (e: any) {
      setError(e.message ?? 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // --- ROOMS ---

  const addRoom = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = roomInput.trim();
    const name = trimmed.toLowerCase() === 'gym' ? 'Gym' : trimmed;
    const isValid = /^\d+$/.test(trimmed) || trimmed.toLowerCase() === 'gym';

    if (!name) { setRoomError('Room is required.'); return; }
    if (!isValid) { setRoomError('Use only a room number. The only text exception is Gym.'); return; }
    if (rooms.some(r => r.name.toLowerCase() === name.toLowerCase())) {
      setRoomError('This room already exists.');
      return;
    }

    setRoomSaving(true);
    setRoomError('');
    try {
      const res = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Server error ${res.status}`);
      }
      const newRoom: Room = await res.json();
      setRooms(prev => [...prev, newRoom]);
      setRoomInput('');
    } catch (e: any) {
      setRoomError(e.message ?? 'Failed to add room');
    } finally {
      setRoomSaving(false);
    }
  };

  const removeRoom = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/rooms/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Failed to delete room (${res.status})`);
      setRooms(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      alert(e.message ?? 'Failed to delete room');
    }
  };

  // --- SUBJECTS ---

  const addSubject = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = subjectInput.trim();
    const code =
      subjectAbbreviationInput.trim().toUpperCase() ||
      name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() ||
      name.slice(0, 3).toUpperCase();

    if (!name) return;

    setSubjectSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/subjects`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, color: 'blue' }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Server error ${res.status}`);
      }
      const newSubject: Subject = await res.json();
      setSubjects(prev => [...prev, newSubject]);
      setSubjectInput('');
      setSubjectAbbreviationInput('');
    } catch (e: any) {
      alert(e.message ?? 'Failed to add subject');
    } finally {
      setSubjectSaving(false);
    }
  };

  const removeSubject = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/subjects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Failed to delete subject (${res.status})`);
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (e: any) {
      alert(e.message ?? 'Failed to delete subject');
    }
  };

  // --- RENDER ---

  if (loading) return (
    <div className="flex items-center justify-center gap-3 p-12 text-palette-pine font-bold text-lg">
      <svg className="w-6 h-6 animate-spin text-palette-fern" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      Loading setup data...
    </div>
  );

  if (error) return (
    <div className="p-8 text-center space-y-4">
      <p className="text-red-600 font-bold">{error}</p>
      <button onClick={fetchAll} className="px-5 py-2.5 bg-palette-fern text-white font-bold rounded-xl hover:bg-palette-leaf transition">
        Retry
      </button>
    </div>
  );

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
        {/* ROOMS FORM */}
        <form onSubmit={addRoom} className="rounded-lg border border-palette-lichen/45 bg-white p-4 shadow-soft">
          <h2 className="text-lg font-black text-palette-pine">Rooms</h2>
          <p className="mt-1 text-sm font-medium text-palette-moss">Use room numbers only. Gym is the only text exception.</p>

          <label className="mt-4 flex flex-col gap-1.5 text-xs font-black uppercase tracking-wide text-palette-moss">
            Room number
            <input
              type="text"
              value={roomInput}
              onChange={(e) => { setRoomInput(e.target.value); setRoomError(''); }}
              placeholder="e.g. 305 or Gym"
              className="h-11 rounded-md border border-palette-lichen/60 bg-palette-mist/40 px-3 text-sm font-semibold normal-case tracking-normal text-palette-pine outline-none transition placeholder:text-palette-moss/60 focus:border-palette-leaf focus:bg-white focus:ring-2 focus:ring-palette-leaf/20"
            />
          </label>
          {roomError && <p className="mt-2 text-xs font-bold text-red-600">{roomError}</p>}

          <button
            type="submit"
            disabled={roomSaving}
            className="mt-3 h-10 w-full rounded-md bg-palette-fern px-4 text-sm font-black text-white shadow-soft transition hover:bg-palette-leaf disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {roomSaving ? 'Adding...' : 'Add room'}
          </button>

          <div className="mt-4 flex flex-wrap gap-2">
            {rooms.map((room) => (
              <span
                key={room.id}
                className="group flex items-center gap-1.5 rounded-full bg-palette-mist px-3 py-1 text-xs font-black text-palette-pine"
              >
                Room {room.name}
                <button
                  type="button"
                  onClick={() => removeRoom(room.id)}
                  className="ml-1 text-palette-moss opacity-0 group-hover:opacity-100 hover:text-red-600 transition font-bold leading-none"
                  title="Remove room"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </form>

        {/* SUBJECTS FORM */}
        <form onSubmit={addSubject} className="rounded-lg border border-palette-lichen/45 bg-white p-4 shadow-soft">
          <h2 className="text-lg font-black text-palette-pine">Subjects</h2>
          <p className="mt-1 text-sm font-medium text-palette-moss">Create the subject names and their short labels.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
            <label className="flex flex-col gap-1.5 text-xs font-black uppercase tracking-wide text-palette-moss">
              Subject name
              <input
                type="text"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                placeholder="e.g. Chemistry"
                className="h-11 rounded-md border border-palette-lichen/60 bg-palette-mist/40 px-3 text-sm font-semibold normal-case tracking-normal text-palette-pine outline-none transition placeholder:text-palette-moss/60 focus:border-palette-leaf focus:bg-white focus:ring-2 focus:ring-palette-leaf/20"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-black uppercase tracking-wide text-palette-moss">
              Abbreviation
              <input
                type="text"
                value={subjectAbbreviationInput}
                onChange={(e) => setSubjectAbbreviationInput(e.target.value)}
                placeholder="e.g. CHEM"
                maxLength={8}
                className="h-11 rounded-md border border-palette-lichen/60 bg-palette-mist/40 px-3 text-sm font-semibold uppercase tracking-normal text-palette-pine outline-none transition placeholder:text-palette-moss/60 focus:border-palette-leaf focus:bg-white focus:ring-2 focus:ring-palette-leaf/20"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={subjectSaving}
            className="mt-3 h-10 w-full rounded-md bg-palette-fern px-4 text-sm font-black text-white shadow-soft transition hover:bg-palette-leaf disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {subjectSaving ? 'Adding...' : 'Add subject'}
          </button>
        </form>
      </div>

      {/* SUBJECTS TABLE */}
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
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-palette-moss font-medium">
                    No subjects yet. Add one above.
                  </td>
                </tr>
              )}
              {subjects.map((subject) => (
                <tr key={subject.id} className="transition hover:bg-palette-mist/60">
                  <td className="px-4 py-3 font-black text-palette-pine">{subject.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-palette-mist px-3 py-1 text-xs font-black text-palette-pine">
                      {subject.code}
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