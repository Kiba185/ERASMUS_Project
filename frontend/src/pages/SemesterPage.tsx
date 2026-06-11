import React, { useState, useEffect } from 'react';
import API_URL from '../config/config.tsx';
import { useAuth } from '../context/AuthContext';

interface Semester {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const SemesterPage: React.FC = () => {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/semesters`, { credentials: 'include' });
      if (res.ok) {
        setSemesters(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/semesters`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, startDate, endDate, isActive })
      });
      if (res.ok) {
        setName('');
        setStartDate('');
        setEndDate('');
        setIsActive(false);
        fetchSemesters();
      } else {
        alert('Failed to create semester');
      }
    } catch (e) {
      alert('Error creating semester');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this semester?')) return;
    try {
      const res = await fetch(`${API_URL}/api/semesters/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchSemesters();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        Access Denied. Admins only.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-palette-pine">Semesters</h1>
      <p className="text-palette-moss font-semibold">Manage school semesters and terms.</p>

      <div className="bg-white p-6 rounded-2xl shadow-soft border border-palette-mist/60">
        <h2 className="text-xl font-bold text-palette-pine mb-4">Create New Semester</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-palette-moss uppercase tracking-wider mb-2">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border rounded-xl px-4 py-2" placeholder="e.g. Fall 2026" />
          </div>
          <div>
            <label className="block text-xs font-bold text-palette-moss uppercase tracking-wider mb-2">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full border rounded-xl px-4 py-2" />
          </div>
          <div>
            <label className="block text-xs font-bold text-palette-moss uppercase tracking-wider mb-2">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full border rounded-xl px-4 py-2" />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 text-palette-fern" />
            <label htmlFor="isActive" className="text-sm font-bold text-palette-pine cursor-pointer">Set as Active Semester</label>
          </div>
          <div className="md:col-span-2 pt-2">
            <button type="submit" className="px-5 py-2.5 bg-palette-fern text-white font-bold rounded-xl hover:bg-palette-leaf transition">
              Create Semester
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-palette-mist/60 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-palette-moss font-medium">Loading...</p>
        ) : semesters.length === 0 ? (
          <p className="p-8 text-center text-palette-moss font-medium">No semesters defined.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-palette-mist/80 border-b border-palette-sage/30 text-xs text-palette-pine uppercase tracking-wider">
                <th className="p-4 font-black">Name</th>
                <th className="p-4 font-black">Duration</th>
                <th className="p-4 font-black">Status</th>
                <th className="p-4 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map(s => (
                <tr key={s.id} className="border-b border-palette-sage/20 last:border-0 hover:bg-palette-mist/30 transition">
                  <td className="p-4 font-bold text-palette-pine">{s.name}</td>
                  <td className="p-4 text-palette-moss text-sm">
                    {new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {s.isActive ? (
                      <span className="px-2.5 py-1 rounded bg-green-100 text-green-800 text-xs font-black uppercase">Active</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-gray-100 text-gray-800 text-xs font-black uppercase">Inactive</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 font-bold text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SemesterPage;