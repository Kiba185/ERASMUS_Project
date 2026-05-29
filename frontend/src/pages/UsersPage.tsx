import React, { useState, useMemo } from 'react';

// --- MOCK DATA ---
type Role = 'student' | 'teacher' | 'parent' | 'admin';

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
}

const initialClasses: MockClass[] = [
  { id: 1, name: '1.A' },
  { id: 2, name: '1.B' },
  { id: 3, name: '2.A' },
  { id: 4, name: '2.B' },
];

const initialUsers: MockUser[] = [
  { id: 1, firstName: 'Jan', lastName: 'Novák', username: 'jnovak', email: 'jan.novak@example.com', phone: '+420123456789', adress: 'Praha', birthday: '2008-05-15', role: 'student', classId: 1 },
  { id: 2, firstName: 'Petr', lastName: 'Svoboda', username: 'psvoboda', email: 'petr.svoboda@example.com', phone: '+420987654321', adress: 'Brno', birthday: '2008-03-22', role: 'student', classId: 2 },
  { id: 3, firstName: 'Karel', lastName: 'Učitel', username: 'teacher', email: 'ucitel@school.com', phone: '+420111222333', adress: 'Ostrava', birthday: '1980-01-01', role: 'teacher', classId: 1 },
  { id: 4, firstName: 'Eva', lastName: 'Nováková', username: 'parent', email: 'eva@example.com', phone: '+420444555666', adress: 'Praha', birthday: '1975-10-10', role: 'parent', childrenIds: [1] },
  { id: 5, firstName: 'Admin', lastName: 'Admin', username: 'admin', email: 'admin@school.com', phone: '+420000000000', adress: 'Server', birthday: '1990-01-01', role: 'admin' },
];

// --- COMPONENT ---
const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<MockUser[]>(initialUsers);
  const [classes] = useState<MockClass[]>(initialClasses);

  // Filtering & Sorting State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [classFilter, setClassFilter] = useState<number | 'all'>('all');
  const [sortField, setSortField] = useState<keyof MockUser>('lastName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<MockUser | null>(null);

  // Derived Data
  const students = useMemo(() => users.filter(u => u.role === 'student'), [users]);

  const filteredAndSortedUsers = useMemo(() => {
    let result = users;

    // Search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(u => 
        u.firstName.toLowerCase().includes(s) || 
        u.lastName.toLowerCase().includes(s) || 
        u.username.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s)
      );
    }

    // Role Filter
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }

    // Class Filter
    if (classFilter !== 'all') {
      result = result.filter(u => u.classId === classFilter);
    }

    // Sort
    result.sort((a, b) => {
      const aVal = String(a[sortField] || '');
      const bVal = String(b[sortField] || '');
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    return result;
  }, [users, search, roleFilter, classFilter, sortField, sortOrder]);

  const handleSort = (field: keyof MockUser) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const openAddModal = () => {
    setEditingUser({
      id: Date.now(), // Mock ID
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '',
      adress: '',
      birthday: '',
      role: 'student',
      classId: null,
      childrenIds: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: MockUser) => {
    setEditingUser({ ...user });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUsers(prev => {
      const exists = prev.find(u => u.id === editingUser.id);
      if (exists) {
        return prev.map(u => u.id === editingUser.id ? editingUser : u);
      } else {
        return [...prev, editingUser];
      }
    });
    setIsModalOpen(false);
  };

  const getClassBadge = (user: MockUser) => {
    if (user.role === 'student' || user.role === 'teacher') {
      const c = classes.find(c => c.id === user.classId);
      if (c) return <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">{c.name}</span>;
    }
    if (user.role === 'parent' && user.childrenIds?.length) {
      return <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">{user.childrenIds.length} children</span>;
    }
    return <span className="text-gray-400">-</span>;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <button onClick={openAddModal} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition">
          + Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <input 
            type="text" 
            placeholder="Search by name, email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none">
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="parent">Parent</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none">
            <option value="all">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort('lastName')}>
                Name {sortField === 'lastName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort('role')}>
                Role {sortField === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">Class / Assigned</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">Email</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600">Phone</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{user.lastName} {user.firstName}</div>
                  <div className="text-gray-500 text-xs">@{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize 
                    ${user.role === 'admin' ? 'bg-red-100 text-red-800' : ''}
                    ${user.role === 'teacher' ? 'bg-green-100 text-green-800' : ''}
                    ${user.role === 'parent' ? 'bg-purple-100 text-purple-800' : ''}
                    ${user.role === 'student' ? 'bg-blue-100 text-blue-800' : ''}
                  `}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getClassBadge(user)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button onClick={() => openEditModal(user)} className="text-green-600 hover:text-green-900 font-semibold">Edit</button>
                </td>
              </tr>
            ))}
            {filteredAndSortedUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{editingUser.id < 1000000 ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                  <input type="text" required value={editingUser.firstName} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                  <input type="text" required value={editingUser.lastName} onChange={e => setEditingUser({...editingUser, lastName: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                  <input type="text" required value={editingUser.username} onChange={e => setEditingUser({...editingUser, username: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" required value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                  <input type="text" value={editingUser.phone} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" value={editingUser.birthday} onChange={e => setEditingUser({...editingUser, birthday: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                  <input type="text" value={editingUser.adress} onChange={e => setEditingUser({...editingUser, adress: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                
                <div className="md:col-span-2 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                  <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as Role, classId: null, childrenIds: []})} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Role Specific Fields */}
                {(editingUser.role === 'student' || editingUser.role === 'teacher') && (
                  <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label className="block text-sm font-semibold text-blue-900 mb-1">
                      {editingUser.role === 'student' ? 'Assign to Class' : 'Head Teacher of Class (Optional)'}
                    </label>
                    <select value={editingUser.classId || ''} onChange={e => setEditingUser({...editingUser, classId: e.target.value ? Number(e.target.value) : null})} className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                      <option value="">-- No class assigned --</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                {editingUser.role === 'parent' && (
                  <div className="md:col-span-2 bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <label className="block text-sm font-semibold text-purple-900 mb-2">Assign Children (Students)</label>
                    <div className="max-h-48 overflow-y-auto bg-white border border-purple-200 rounded-md p-2 space-y-1 shadow-inner">
                      {students.length === 0 ? (
                        <p className="text-sm text-gray-500 p-2">No students available.</p>
                      ) : (
                        students.map(student => {
                          const isSelected = editingUser.childrenIds?.includes(student.id);
                          return (
                            <label key={student.id} className="flex items-center space-x-3 p-2 hover:bg-purple-50 rounded cursor-pointer border border-transparent hover:border-purple-200 transition">
                              <input 
                                type="checkbox" 
                                checked={!!isSelected}
                                onChange={(e) => {
                                  const currentIds = editingUser.childrenIds || [];
                                  if (e.target.checked) {
                                    setEditingUser({...editingUser, childrenIds: [...currentIds, student.id]});
                                  } else {
                                    setEditingUser({...editingUser, childrenIds: currentIds.filter(id => id !== student.id)});
                                  }
                                }}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer" 
                              />
                              <span className="text-sm font-medium text-gray-800">{student.lastName} {student.firstName} <span className="text-gray-400">(@{student.username})</span></span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition">
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
