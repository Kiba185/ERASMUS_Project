import API_URL from '../config/config.tsx';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AbsenceRecord {
  id: number;
  date: string;
  subjectId: number;
  subjectName: string;
  absenceReason: string | null;
  attendanceId?: number;
}

interface AbsenceDateGroup {
  date: string;
  label: string;
  records: AbsenceRecord[];
}

// Cycle through green-family colors for subjects
const SUBJECT_COLORS = [
  { dot: 'bg-lime-500',    bar: 'bg-lime-500'    },
  { dot: 'bg-green-400',   bar: 'bg-green-400'   },
  { dot: 'bg-emerald-400', bar: 'bg-emerald-400' },
  { dot: 'bg-emerald-600', bar: 'bg-emerald-600' },
  { dot: 'bg-teal-500',    bar: 'bg-teal-500'    },
  { dot: 'bg-teal-700',    bar: 'bg-teal-700'    },
];

const ABSENCE_WARNING_LIMIT = 25;

const formatDateLabel = (isoDate: string) => {
  const d = new Date(isoDate);
  return `${d.getDate()}. ${d.getMonth() + 1}.`;
};

const AbsencePage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AbsenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateSearch, setDateSearch] = useState('');

  useEffect(() => {
    //if (!user?.id) return;
    const load = async () => {
      setLoading(true);
      try {
        //const res = await fetch(`${API_URL}/api/attendance/student/${user.id}`, {
        const res = await fetch(`${API_URL}/api/myattendance`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Failed to load absences (${res.status})`);
        const data: any[] = await res.json();
        setRecords(data.map(r => ({
          id: r.id,
          date: r.date.slice(0, 10),
          subjectId: r.subjectId,
          subjectName: r.subject?.name ?? 'Unknown',
          absenceReason: r.absenceReason ?? null,
        })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  // Build a stable subject → color index map
  const subjectColorMap = useMemo(() => {
    const map: Record<number, number> = {};
    let i = 0;
    records.forEach(r => {
      if (!(r.subjectId in map)) map[r.subjectId] = i++ % SUBJECT_COLORS.length;
    });
    return map;
  }, [records]);

  // Group records by date
  const dateGroups = useMemo<AbsenceDateGroup[]>(() => {
    const map = new Map<string, AbsenceRecord[]>();
    records.forEach(r => {
      const list = map.get(r.date) ?? [];
      list.push(r);
      map.set(r.date, list);
    });
    return Array.from(map.entries())
      .map(([date, recs]) => ({ date, label: formatDateLabel(date), records: recs }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [records]);

  // Subject totals across all dates
  const subjectSummary = useMemo(() => {
    const totals = new Map<number, { name: string; count: number }>();
    records.forEach(r => {
      const curr = totals.get(r.subjectId) ?? { name: r.subjectName, count: 0 };
      totals.set(r.subjectId, { ...curr, count: curr.count + 1 });
    });
    const max = Math.max(...Array.from(totals.values()).map(v => v.count), 1);
    return Array.from(totals.entries())
      .map(([subjectId, v]) => ({ subjectId, name: v.name, count: v.count, percent: (v.count / max) * 100 }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  const totalAbsences = records.length;
  // We don't have ELAPSED_LESSONS from API, so show raw count
  const selectedGroup = dateGroups.find(g => g.date === selectedDate) ?? null;

  const filteredGroups = dateGroups.filter(g => {
    const s = dateSearch.trim().toLowerCase();
    if (!s) return true;
    return (
      g.label.toLowerCase().includes(s) ||
      g.date.includes(s) ||
      g.records.some(r => r.subjectName.toLowerCase().includes(s))
    );
  });

  const chartData = selectedGroup
    ? selectedGroup.records.map(r => ({ subjectId: r.subjectId, name: r.subjectName, count: 1 }))
    : subjectSummary.map(s => ({ subjectId: s.subjectId, name: s.name, count: s.count }));
  const maxChart = Math.max(...chartData.map(d => d.count), 1);

  if (loading) return (
    <div className="flex items-center justify-center gap-3 p-12 text-palette-pine font-bold text-lg">
      <svg className="w-6 h-6 animate-spin text-palette-fern" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      Loading absences...
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-2 py-2">
      <header className="grid gap-3 rounded-lg border border-palette-lichen/45 bg-palette-mist p-5 shadow-soft md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-palette-pine">
            Absence — {user?.firstName} {user?.lastName}
          </h1>
          <p className="mt-1 text-sm font-medium text-palette-moss">
            {totalAbsences} missed lesson{totalAbsences !== 1 ? 's' : ''} recorded.
          </p>
        </div>
        <div className="rounded-lg border border-palette-lichen/45 bg-white px-5 py-3 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-palette-moss">Total absences</p>
          <p className="text-4xl font-black text-palette-pine">{totalAbsences}</p>
          <p className="text-xs font-bold text-palette-moss">
            {selectedGroup ? `${selectedGroup.records.length} on selected date` : 'across all dates'}
          </p>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-palette-pine">Missed lessons by subject</h2>
            <span className="text-sm font-bold text-palette-moss">
              {selectedGroup ? selectedGroup.label : 'All dates'}
            </span>
          </div>
          <div className="space-y-3">
            {chartData.length === 0 ? (
              <p className="py-4 text-center text-palette-moss font-medium">No absences recorded.</p>
            ) : chartData.map(item => {
              const colors = SUBJECT_COLORS[subjectColorMap[item.subjectId] ?? 0];
              const pct = (item.count / maxChart) * 100;
              return (
                <div key={item.subjectId} className="rounded-lg border border-palette-lichen/45 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${colors.dot}`} />
                      <span className="text-sm font-bold text-palette-pine">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-palette-moss">{item.count} lesson{item.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-palette-sage/20">
                    <div className={`h-full rounded-full transition-all ${colors.bar}`} style={{ width: `${Math.max(pct, 8)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-5 shadow-soft">
          <h2 className="text-lg font-bold text-palette-pine">
            {selectedGroup ? `${selectedGroup.label} detail` : 'Date detail'}
          </h2>
          <p className="mt-1 text-sm text-palette-moss">
            {selectedGroup ? 'Subjects missed on selected date.' : 'Choose a date to highlight exact lessons.'}
          </p>
          <div className="mt-4 space-y-2">
            {(selectedGroup?.records ?? subjectSummary.map(s => ({ subjectId: s.subjectId, subjectName: s.name, count: s.count }))).map((item: any) => {
              const colors = SUBJECT_COLORS[subjectColorMap[item.subjectId] ?? 0];
              return (
                <div key={item.subjectId} className="flex items-center justify-between rounded-md border border-palette-lichen/45 bg-white px-3 py-2">
                  <span className="flex items-center gap-2 text-sm font-bold text-palette-pine">
                    <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                    {item.subjectName ?? item.name}
                  </span>
                  <span className="text-sm font-black text-palette-moss">{item.count ?? 1}</span>
                </div>
              );
            })}
          </div>
        </aside>
      </section>

      <section className="rounded-lg border border-palette-lichen/45 bg-palette-mist p-4 shadow-soft">
        <div className="mb-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <input
            type="search"
            value={dateSearch}
            onChange={e => setDateSearch(e.target.value)}
            placeholder="Search date or subject..."
            className="h-10 rounded-md border border-palette-lichen/60 bg-white px-3 text-sm text-palette-pine outline-none focus:border-palette-leaf focus:ring-2 focus:ring-palette-leaf/20"
          />
          <button
            type="button"
            onClick={() => { setSelectedDate(null); setDateSearch(''); }}
            className="h-10 rounded-md border border-palette-lichen/60 bg-white px-4 text-sm font-bold text-palette-pine hover:bg-palette-sage/15"
          >
            Show all
          </button>
        </div>
        <div className="max-h-40 overflow-y-auto pr-1">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredGroups.length === 0 && (
              <p className="col-span-full py-4 text-center text-palette-moss text-sm font-medium">No absences found.</p>
            )}
            {filteredGroups.map(group => {
              const isSelected = selectedDate === group.date;
              return (
                <button
                  key={group.date}
                  type="button"
                  onClick={() => setSelectedDate(isSelected ? null : group.date)}
                  className={`rounded-md border px-3 py-2 text-left transition ${isSelected ? 'border-palette-leaf bg-palette-leaf text-white shadow-soft' : 'border-palette-lichen/45 bg-white text-palette-pine hover:border-palette-leaf hover:bg-palette-sage/15'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black">{group.label}</span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-palette-mist' : 'text-palette-moss'}`}>
                      {group.records.length}
                    </span>
                  </div>
                  <p className={`mt-1 truncate text-xs font-medium ${isSelected ? 'text-palette-mist' : 'text-palette-moss'}`}>
                    {group.records.map(r => r.subjectName).join(', ')}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AbsencePage;