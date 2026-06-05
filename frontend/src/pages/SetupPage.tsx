import API_URL from '../config/config.tsx';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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

interface Period {
  id?: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

const SetupPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roomInput, setRoomInput] = useState('');
  const [roomError, setRoomError] = useState('');
  const [roomSaving, setRoomSaving] = useState(false);

  // Periods wizard states
  const [wizardStart, setWizardStart] = useState('08:00');
  const [wizardDuration, setWizardDuration] = useState(45);
  const [wizardBreak, setWizardBreak] = useState(10);
  const [wizardLongBreak, setWizardLongBreak] = useState(20);
  const [wizardLongBreakAfter, setWizardLongBreakAfter] = useState(2);
  const [wizardCount, setWizardCount] = useState(6);
  const [wizardIncludeZero, setWizardIncludeZero] = useState(false);
  const [periodsSaving, setPeriodsSaving] = useState(false);

  const [subjectInput, setSubjectInput] = useState('');
  const [subjectAbbreviationInput, setSubjectAbbreviationInput] = useState('');
  const [subjectSaving, setSubjectSaving] = useState(false);

  // --- FETCH ---

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomRes, subjectRes, periodRes] = await Promise.all([
        fetch(`${API_URL}/api/rooms`, { credentials: 'include' }),
        fetch(`${API_URL}/api/subjects`, { credentials: 'include' }),
        fetch(`${API_URL}/api/periods`, { credentials: 'include' }),
      ]);
      if (!roomRes.ok) throw new Error(`Failed to load rooms (${roomRes.status})`);
      if (!subjectRes.ok) throw new Error(`Failed to load subjects (${subjectRes.status})`);
      if (!periodRes.ok) throw new Error(`Failed to load periods (${periodRes.status})`);
      setRooms(await roomRes.json());
      setSubjects(await subjectRes.json());
      const pData = await periodRes.json();
      setPeriods(pData.data || []);
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

  // --- PERIODS CONFIGURATION ---

  const handlePeriodChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setPeriods(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handlePeriodNumberChange = (index: number, value: string) => {
    const num = parseInt(value);
    if (isNaN(num)) return;
    setPeriods(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], periodNumber: num };
      return updated;
    });
  };

  const addPeriodSlot = () => {
    setPeriods(prev => {
      const nextNum = prev.length > 0 ? Math.max(...prev.map(p => p.periodNumber)) + 1 : 1;
      const lastPeriod = prev[prev.length - 1];
      let proposedStart = '08:00';
      let proposedEnd = '08:45';
      if (lastPeriod) {
        // Add 10 mins break to last end time
        const [h, m] = lastPeriod.endTime.split(':').map(Number);
        const startMin = h * 60 + m + 10;
        const endMin = startMin + 45;
        
        const sh = String(Math.floor(startMin / 60) % 24).padStart(2, '0');
        const sm = String(startMin % 60).padStart(2, '0');
        const eh = String(Math.floor(endMin / 60) % 24).padStart(2, '0');
        const em = String(endMin % 60).padStart(2, '0');
        
        proposedStart = `${sh}:${sm}`;
        proposedEnd = `${eh}:${em}`;
      }
      const newSlot: Period = {
        periodNumber: nextNum,
        startTime: proposedStart,
        endTime: proposedEnd
      };
      return [...prev, newSlot].sort((a, b) => a.periodNumber - b.periodNumber);
    });
  };

  const removePeriodSlot = (index: number) => {
    setPeriods(prev => prev.filter((_, i) => i !== index));
  };

  const savePeriods = async () => {
    setPeriodsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/periods`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periods }),
      });
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      const result = await res.json();
      if (result.success) {
        setPeriods(result.data);
        alert("Periods configuration saved successfully!");
      } else {
        throw new Error(result.message || "Failed to save periods");
      }
    } catch (e: any) {
      alert(e.message || "Failed to save periods settings.");
    } finally {
      setPeriodsSaving(false);
    }
  };

  const generatePeriodsWizard = () => {
    const result: Period[] = [];
    const [startH, startM] = wizardStart.split(':').map(Number);
    let currentMinutes = startH * 60 + startM;

    const totalPeriods = wizardCount;
    
    // Optional zero period
    if (wizardIncludeZero) {
      const zeroStartMin = currentMinutes - wizardDuration - 10; // Zero period is 10 mins before period 1
      const zeroEndMin = zeroStartMin + wizardDuration;
      
      const zsh = String(Math.floor(zeroStartMin / 60) % 24).padStart(2, '0');
      const zsm = String(zeroStartMin % 60).padStart(2, '0');
      const zeh = String(Math.floor(zeroEndMin / 60) % 24).padStart(2, '0');
      const zem = String(zeroEndMin % 60).padStart(2, '0');
      
      result.push({
        periodNumber: 0,
        startTime: `${zsh}:${zsm}`,
        endTime: `${zeh}:${zem}`
      });
    }

    for (let i = 1; i <= totalPeriods; i++) {
      const periodStart = currentMinutes;
      const periodEnd = currentMinutes + wizardDuration;
      
      const sh = String(Math.floor(periodStart / 60) % 24).padStart(2, '0');
      const sm = String(periodStart % 60).padStart(2, '0');
      const eh = String(Math.floor(periodEnd / 60) % 24).padStart(2, '0');
      const em = String(periodEnd % 60).padStart(2, '0');
      
      result.push({
        periodNumber: i,
        startTime: `${sh}:${sm}`,
        endTime: `${eh}:${em}`
      });

      // Add break
      const isLongBreak = i === wizardLongBreakAfter;
      const currentBreak = isLongBreak ? wizardLongBreak : wizardBreak;
      currentMinutes = periodEnd + currentBreak;
    }

    setPeriods(result.sort((a, b) => a.periodNumber - b.periodNumber));
  };

  // --- RENDER ---
  const isSavingAny = roomSaving || periodsSaving || subjectSaving;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-palette-fern border-t-transparent rounded-full animate-spin" />
      <p className="text-palette-moss font-bold animate-pulse">Loading setup data...</p>
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
      {isSavingAny && createPortal(
        <div className="fixed inset-0 bg-palette-pine/40 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-palette-fern border-t-transparent rounded-full animate-spin" />
            <p className="text-palette-pine font-bold text-lg">Processing...</p>
          </div>
        </div>,
        document.body
      )}
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

      {/* PERIODS CONFIGURATION SETUP */}
      <section className="rounded-lg border border-palette-lichen/45 bg-white p-5 shadow-soft space-y-6">
        <div>
          <h2 className="text-xl font-black text-palette-pine">School Periods Configuration</h2>
          <p className="text-sm font-medium text-palette-moss mt-1">
            Configure the default school period slots (0th, 1st, 2nd, 7th, 8th, etc.) with custom start and end times.
          </p>
        </div>

        {/* Dynamic Wizard Calculator */}
        <div className="bg-palette-mist/40 border border-palette-lichen/30 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-palette-lichen/20">
            <h3 className="font-black text-sm text-palette-pine uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span> Smart Periods Generator
            </h3>
            <span className="text-[10px] bg-palette-sage/20 text-palette-pine px-2.5 py-0.5 rounded-full font-bold uppercase">Helper Wizard</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            <label className="flex flex-col gap-1 text-xs font-black uppercase text-palette-moss">
              First Class Start
              <input type="time" value={wizardStart} onChange={(e) => setWizardStart(e.target.value)} className="h-10 border border-palette-lichen/40 rounded-lg px-2 text-sm outline-none focus:border-palette-leaf bg-white" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-black uppercase text-palette-moss">
              Class Length (min)
              <input type="number" min="1" max="180" value={wizardDuration} onChange={(e) => setWizardDuration(Number(e.target.value))} className="h-10 border border-palette-lichen/40 rounded-lg px-2 text-sm outline-none focus:border-palette-leaf bg-white" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-black uppercase text-palette-moss">
              Standard Break (min)
              <input type="number" min="0" max="120" value={wizardBreak} onChange={(e) => setWizardBreak(Number(e.target.value))} className="h-10 border border-palette-lichen/40 rounded-lg px-2 text-sm outline-none focus:border-palette-leaf bg-white" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-black uppercase text-palette-moss">
              Long Break (min)
              <input type="number" min="0" max="120" value={wizardLongBreak} onChange={(e) => setWizardLongBreak(Number(e.target.value))} className="h-10 border border-palette-lichen/40 rounded-lg px-2 text-sm outline-none focus:border-palette-leaf bg-white" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-black uppercase text-palette-moss">
              After Period No.
              <input type="number" min="1" max="20" value={wizardLongBreakAfter} onChange={(e) => setWizardLongBreakAfter(Number(e.target.value))} className="h-10 border border-palette-lichen/40 rounded-lg px-2 text-sm outline-none focus:border-palette-leaf bg-white" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-black uppercase text-palette-moss">
              Periods Count
              <input type="number" min="1" max="24" value={wizardCount} onChange={(e) => setWizardCount(Number(e.target.value))} className="h-10 border border-palette-lichen/40 rounded-lg px-2 text-sm outline-none focus:border-palette-leaf bg-white" />
            </label>
            <label className="flex items-center gap-2 text-xs font-black uppercase text-palette-moss self-end h-10 select-none cursor-pointer">
              <input type="checkbox" checked={wizardIncludeZero} onChange={(e) => setWizardIncludeZero(e.target.checked)} className="w-4 h-4 rounded text-palette-leaf border-palette-lichen focus:ring-palette-leaf" />
              Include 0. Period
            </label>
          </div>

          <button
            type="button"
            onClick={generatePeriodsWizard}
            className="w-full h-10 bg-palette-pine text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-palette-leaf transition shadow-sm"
          >
            Auto-Generate Period Times
          </button>
        </div>

        {/* Periods Table Configuration Editor */}
        <div className="overflow-x-auto rounded-lg border border-palette-lichen/45">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead className="bg-palette-sage/20 text-xs font-black uppercase tracking-wider text-palette-moss">
              <tr>
                <th className="px-4 py-3 w-[150px]">Period Number</th>
                <th className="px-4 py-3">Start Time</th>
                <th className="px-4 py-3">End Time</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-palette-lichen/35 bg-white">
              {periods.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-palette-moss font-medium">
                    No periods configured. Use the wizard above or click "Add Period Slot" to start.
                  </td>
                </tr>
              )}
              {periods.map((p, idx) => (
                <tr key={idx} className="hover:bg-palette-mist/30 transition">
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={p.periodNumber}
                      onChange={(e) => handlePeriodNumberChange(idx, e.target.value)}
                      className="w-20 h-9 border border-palette-lichen/45 rounded-lg px-2 font-bold text-palette-pine bg-palette-mist/20 focus:bg-white outline-none focus:border-palette-leaf text-center"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="time"
                      value={p.startTime}
                      onChange={(e) => handlePeriodChange(idx, 'startTime', e.target.value)}
                      className="w-32 h-9 border border-palette-lichen/45 rounded-lg px-2 font-semibold text-palette-pine outline-none focus:border-palette-leaf"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="time"
                      value={p.endTime}
                      onChange={(e) => handlePeriodChange(idx, 'endTime', e.target.value)}
                      className="w-32 h-9 border border-palette-lichen/45 rounded-lg px-2 font-semibold text-palette-pine outline-none focus:border-palette-leaf"
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removePeriodSlot(idx)}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition flex items-center justify-end w-full"
                      title="Delete slot"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-end pt-2 border-t border-palette-lichen/20">
          <button
            type="button"
            onClick={addPeriodSlot}
            className="w-full sm:w-auto px-5 py-2.5 bg-palette-mist text-palette-pine hover:bg-palette-lichen/20 rounded-xl font-bold text-sm transition border border-palette-sage/30 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">add</span> Add Period Slot
          </button>
          <button
            type="button"
            disabled={periodsSaving}
            onClick={savePeriods}
            className="w-full sm:w-auto px-6 py-2.5 bg-palette-fern text-white hover:bg-palette-leaf rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {periodsSaving ? "Saving Configuration..." : "Save Configuration"}
          </button>
        </div>
      </section>
    </section>
  );
};

export default SetupPage;