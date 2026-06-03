import API_URL from '../config/config.tsx';
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Role = 'student' | 'teacher' | 'parent' | 'admin';

interface MockSubject {
  id: number;
  name: string;
}

interface MockClass {
  id: number;
  name: string;
}

interface MockUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  adress: string;
  birthday: string;
  role: Role;
  classId?: number | null;
  childrenIds?: number[];
  subjectIds?: number[];
}

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [users, setUsers] = useState<MockUser[]>([]);
  const [classes, setClasses] = useState<MockClass[]>([]);
  const [subjects, setSubjects] = useState<MockSubject[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [classFilter, setClassFilter] = useState<number | 'all'>('all');
  const [sortField, setSortField] = useState<keyof MockUser>('lastName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<MockUser | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/api/admin/users`, { credentials: 'include' });
    const data = await res.json();
    const mapped = data.map((u: any) => ({
      ...u,
      classId: u.classes?.[0]?.id ?? null,
      subjectIds: u.subjects?.map((s: any) => s.id) ?? []
    }));
    setUsers(mapped);
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/classes`, { credentials: 'include' });
      if (!res.ok) { console.error('fetchClasses failed:', res.status); return; }
      const data = await res.json();
      if (!Array.isArray(data)) { console.error('fetchClasses: expected array, got:', data); return; }
      setClasses(data);
    } catch (err) {
      console.error('fetchClasses error:', err);
    }
  };

  const fetchSubjects = async () => {
    const res = await fetch(`${API_URL}/api/subjects`, { credentials: 'include' });
    const data = await res.json();
    setSubjects(data);
  };

  useEffect(() => {
    Promise.all([fetchUsers(), fetchClasses(), fetchSubjects()]).finally(() => setLoading(false));
  }, []);

  const filteredAndSortedUsers = useMemo(() => {
    let result = users;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(u =>
        u.firstName.toLowerCase().includes(s) ||
        u.lastName.toLowerCase().includes(s) ||
        u.username.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s)
      );
    }
    if (roleFilter !== 'all') result = result.filter(u => u.role === roleFilter);
    if (classFilter !== 'all') result = result.filter(u => u.classId === classFilter);
    result = [...result].sort((a, b) => {
      const aVal = String(a[sortField] || '');
      const bVal = String(b[sortField] || '');
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    return result;
  }, [users, search, roleFilter, classFilter, sortField, sortOrder]);

  const handleSort = (field: keyof MockUser) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  const openAddModal = () => {
    setIsNew(true);
    setNewPassword('');
    setEditingUser({ id: 0, firstName: '', lastName: '', username: '', email: '', phone: '', adress: '', birthday: '', role: 'student', classId: null, childrenIds: [], subjectIds: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (user: MockUser) => {
    setIsNew(false);
    setNewPassword('');
    setEditingUser({ ...user, birthday: user.birthday ? user.birthday.split('T')[0] : '' });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editingUser.birthday) {
      alert('Datum narození je povinné!');
      return;
    }

    if (isNew) {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingUser, password: newPassword })
      });
      if (!res.ok) { const err = await res.json(); alert(err.message); return; }
    } else {
      const res = await fetch(`${API_URL}/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser)
      });
      if (!res.ok) { const err = await res.json(); alert(err.message); return; }

      if (newPassword.length >= 6) {
        await fetch(`${API_URL}/api/admin/users/${editingUser.id}/password`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword })
        });
      }

      await fetch(`${API_URL}/api/admin/users/${editingUser.id}/classes`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: editingUser.classId ?? null })
      });

      if (editingUser.role === 'teacher') {
        await fetch(`${API_URL}/api/admin/users/${editingUser.id}/subjects`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subjectIds: editingUser.subjectIds ?? [] })
        });
      }
    }

    await fetchUsers();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Opravdu smazat uživatele?')) return;
    await fetch(`${API_URL}/api/admin/users/${id}`, { method: 'DELETE', credentials: 'include' });
    await fetchUsers();
  };

  const handleLoginAs = (user: MockUser) => {
    login(String(user.id), { ...user, id: String(user.id) } as any);
    navigate('/dashboard');
  };

  const getClassBadge = (user: MockUser) => {
    if (user.role === 'student' || user.role === 'teacher') {
      const c = classes.find(c => c.id === user.classId);
      if (c) return <span className="px-2 py-1 text-xs font-semibold bg-palette-mist text-palette-fern rounded-full border border-palette-sage">{c.name}</span>;
    }
    if (user.role === 'parent' && user.childrenIds?.length) {
      return <span className="px-2 py-1 text-xs font-semibold bg-palette-mist text-palette-moss rounded-full border border-palette-sage">{user.childrenIds.length} children</span>;
    }
    return <span className="text-gray-400">-</span>;
  };

  if (loading) return <div className="p-8 text-palette-pine font-bold">Načítání...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-palette-pine">User Management</h1>
        <button onClick={openAddModal} className="px-5 py-2.5 bg-palette-fern text-white font-semibold rounded-xl shadow-soft hover:bg-palette-leaf hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add New User
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-soft border border-palette-mist flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <input type="text" placeholder="Search by name, email..." value={search} onChange={e => setSearch(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow focus:border-palette-meadow outline-none transition" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow outline-none transition text-palette-pine font-medium">
          <option value="all">All Roles</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
          <option value="admin">Admin</option>
        </select>
        <select value={classFilter} onChange={e => setClassFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow outline-none transition text-palette-pine font-medium">
          <option value="all">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-palette-mist overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-palette-mist">
            <tr>
              <th className="px-6 py-4 text-left font-bold text-palette-pine cursor-pointer hover:bg-palette-sage hover:text-white transition" onClick={() => handleSort('lastName')}>Name {sortField === 'lastName' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th className="px-6 py-4 text-left font-bold text-palette-pine cursor-pointer hover:bg-palette-sage hover:text-white transition" onClick={() => handleSort('role')}>Role {sortField === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th className="px-6 py-4 text-left font-bold text-palette-pine">Class / Assigned</th>
              <th className="px-6 py-4 text-left font-bold text-palette-pine">Email</th>
              <th className="px-6 py-4 text-left font-bold text-palette-pine">Phone</th>
              <th className="px-6 py-4 text-right font-bold text-palette-pine">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAndSortedUsers.map(user => (
              <tr key={user.id} className="hover:bg-palette-mist/50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-bold text-palette-pine">{user.lastName} {user.firstName}</div>
                  <div className="text-palette-moss text-xs mt-0.5">@{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize border
                    ${user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                    ${user.role === 'teacher' ? 'bg-palette-mist text-palette-fern border-palette-sage' : ''}
                    ${user.role === 'parent' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                    ${user.role === 'student' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                  `}>{user.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getClassBadge(user)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">{user.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end gap-3">
                  <button onClick={() => handleLoginAs(user)} className="text-palette-moss hover:text-palette-pine font-bold transition">Login As</button>
                  <button onClick={() => openEditModal(user)} className="text-palette-fern hover:text-palette-leaf font-bold transition">Edit</button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-400 hover:text-red-600 font-bold transition">Delete</button>
                </td>
              </tr>
            ))}
            {filteredAndSortedUsers.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-palette-moss font-medium">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && editingUser && createPortal(
        <div className="fixed inset-0 bg-palette-pine/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-palette-mist">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-palette-mist/30">
              <h2 className="text-2xl font-bold text-palette-pine">{isNew ? 'Add New User' : 'Edit User'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-palette-moss hover:text-palette-pine text-3xl font-light leading-none">&times;</button>
            </div>
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-palette-pine mb-1.5">First Name</label>
                  <input type="text" required value={editingUser.firstName} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-palette-pine mb-1.5">Last Name</label>
                  <input type="text" required value={editingUser.lastName} onChange={e => setEditingUser({...editingUser, lastName: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-palette-pine mb-1.5">Username</label>
                  <input type="text" required value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-palette-pine mb-1.5">Email</label>
                  <input type="email" required value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-palette-pine mb-1.5">Phone</label>
                  <input type="text" value={editingUser.phone} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-palette-pine mb-1.5">Date of Birth *</label>
                  <input type="date" required value={editingUser.birthday} onChange={e => setEditingUser({...editingUser, birthday: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow outline-none transition" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-palette-pine mb-1.5">Address</label>
                  <input type="text" value={editingUser.adress} onChange={e => setEditingUser({...editingUser, adress: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow outline-none transition" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-palette-pine mb-1.5">{isNew ? 'Password *' : 'New Password (nechej prázdné pokud nechceš měnit)'}</label>
                  <input type="password" required={isNew} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow outline-none transition" />
                </div>
                <div className="md:col-span-2 pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-palette-pine mb-1.5">Role</label>
                  <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as Role, classId: null, childrenIds: [], subjectIds: []})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow outline-none transition font-medium">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {(editingUser.role === 'student' || editingUser.role === 'teacher') && (
                  <div className="md:col-span-2 bg-palette-mist/50 p-5 rounded-xl border border-palette-sage/30 space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-palette-pine mb-1.5">
                        {editingUser.role === 'student' ? 'Assign to Class' : 'Head Teacher of Class (Optional)'}
                      </label>
                      <select value={editingUser.classId || ''} onChange={e => setEditingUser({...editingUser, classId: e.target.value ? Number(e.target.value) : null})} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-palette-meadow outline-none transition">
                        <option value="">-- No class assigned --</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    {editingUser.role === 'teacher' && (
                      <div className="pt-2 border-t border-palette-sage/30">
                        <label className="block text-sm font-bold text-palette-pine mb-2">Assign Subjects</label>
                        <div className="max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg p-2 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-1">
                          {subjects.map(subject => {
                            const isSelected = editingUser.subjectIds?.includes(subject.id);
                            return (
                              <label key={subject.id} className={`flex items-center space-x-3 p-2.5 rounded-md cursor-pointer border transition ${isSelected ? 'bg-palette-mist border-palette-sage' : 'border-transparent hover:bg-gray-50'}`}>
                                <input type="checkbox" checked={!!isSelected} onChange={(e) => {
                                  const currentIds = editingUser.subjectIds || [];
                                  if (e.target.checked) setEditingUser({...editingUser, subjectIds: [...currentIds, subject.id]});
                                  else setEditingUser({...editingUser, subjectIds: currentIds.filter(id => id !== subject.id)});
                                }} className="w-4 h-4 text-palette-fern border-gray-300 rounded focus:ring-palette-meadow cursor-pointer" />
                                <span className="text-sm font-bold text-palette-pine">{subject.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="pt-6 mt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-palette-fern text-white font-bold rounded-xl shadow-soft hover:bg-palette-leaf hover:-translate-y-0.5 transition-all">Save User</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UsersPage;