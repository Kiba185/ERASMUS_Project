import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API_URL from '../config/config.tsx';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// --- TYPES ---
interface Student {
  id: number;
  firstName: string;
  lastName: string;
  username?: string;
  role: string;          // "student" | "teacher" | etc.
  classId: number | null;
}

interface ApiClass {
  id: number;
  name: string;
  students: { id: number; name: string; role?: string }[];
  groups?: Group[];
}

interface Group {
  id: number;
  name: string;
  studentIds: number[];
}

interface UIClass {
  id: number;
  name: string;
  headTeacherId: number | null;
  studentIds: number[];
  groups: Group[];
}

// --- HELPERS ---
const splitName = (fullName: string): { firstName: string; lastName: string } => {
  const [firstName, ...rest] = fullName.split(' ');
  return { firstName, lastName: rest.join(' ') };
};

// --- COMPONENT ---
const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<UIClass[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: number; name: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewClass, setIsNewClass] = useState(false);
  const [editingClass, setEditingClass] = useState<UIClass | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [selectedHeadTeacherId, setSelectedHeadTeacherId] = useState<number | null>(null);
  const [className, setClassName] = useState('');
  const [saving, setSaving] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);

  // --- FETCH ALL CLASSES + ALL USERS ---
  const fetchData = async () => {
    setLoading(true);
    setIsLoading(true);
    setError(null);
    try {
      // Fetch classes
      const classRes = await fetch(`${API_URL}/api/classes`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!classRes.ok) throw new Error('Failed to load classes');
      const classData: ApiClass[] = await classRes.json();

      // Fetch all students (for the student picker)
      const studentRes = await fetch(`${API_URL}/api/users/student`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!studentRes.ok) throw new Error('Failed to load students');
      const studentData: any[] = await studentRes.json();

      // Fetch all teachers
      const teacherRes = await fetch(`${API_URL}/api/users/teacher`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      // If no teacher endpoint exists yet, gracefully fall back to empty
      const teacherData: any[] = teacherRes.ok ? await teacherRes.json() : [];

      // Build a flat list of all users with roles
      const users = [
        ...studentData.map((u: any) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, role: 'student' })),
        ...teacherData.map((u: any) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, role: 'teacher' })),
      ];
      setAllUsers(users);

      // Map API classes → UI classes
      // Head teacher = the one member whose role is "teacher"
      const uiClasses: UIClass[] = classData.map((c) => {
        const memberIds = c.students.map((s) => s.id);
        const headTeacher = c.students.find((s) => {
          const found = users.find((u) => u.id === s.id);
          return found?.role === 'teacher';
        });
        return {
          id: c.id,
          name: c.name,
          headTeacherId: headTeacher?.id ?? null,
          studentIds: c.students
            .filter((s) => {
              const found = users.find((u) => u.id === s.id);
              return found?.role !== 'teacher';
            })
            .map((s) => s.id),

          groups: c.groups || []
        };
      });

      setClasses(uiClasses);
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- MODAL HELPERS ---
  const teachers = allUsers.filter((u) => u.role === 'teacher');
  const students = allUsers.filter((u) => u.role === 'student');

  // Students available in modal = unassigned OR already in this class
  const assignedStudentIds = useMemo(() => {
    return classes.flatMap((c) =>
      editingClass && c.id === editingClass.id ? [] : c.studentIds
    );
  }, [classes, editingClass]);

  const availableStudents = useMemo(() => {
    return students.filter(
      (s) => !assignedStudentIds.includes(s.id) || (editingClass?.studentIds ?? []).includes(s.id)
    );
  }, [students, assignedStudentIds, editingClass]);

  const openAddModal = () => {
    setIsNewClass(true);
    setEditingClass(null);
    setClassName('');
    setSelectedStudentIds([]);
    setSelectedHeadTeacherId(null);
    setGroups([]);
    setIsModalOpen(true);

  };

  const openEditModal = (cls: UIClass) => {
    setIsNewClass(false);
    setEditingClass(cls);
    setClassName(cls.name);
    setSelectedStudentIds([...cls.studentIds]);
    setSelectedHeadTeacherId(cls.headTeacherId);
    setGroups(cls.groups || []);
    setIsModalOpen(true);
  };

  // Build the studentIds array to send: students + optionally the head teacher
  const buildPayload = () => {
    const ids = [...selectedStudentIds];
    if (selectedHeadTeacherId && !ids.includes(selectedHeadTeacherId)) {
      ids.push(selectedHeadTeacherId);
    }
    return { name: className, studentIds: ids };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    if (editingClass) {
      setClasses(
        classes.map((c) =>
          c.id === editingClass.id
            ? {
              ...c,
              groups,
            }
            : c
        )
      );
      try {
        await fetch(`${API_URL}/api/classes/${editingClass.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
          credentials: 'include'
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    } else {
      try {
        const response = await fetch(`${API_URL}/api/classes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
          credentials: 'include'
        });
        const data = await response.json();
        setClasses([...classes, {
          id: data.id,
          name: data.name,
          studentIds: selectedStudentIds,
          headTeacherId: selectedHeadTeacherId,
          groups,
        }]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
    setIsModalOpen(false);
    await fetchData();
  };

  const handleDelete = async (id: number) => {
    setIsSaving(true);
    try {
      await fetch(`${API_URL}/api/classes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      setClasses(classes.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const addGroup = () => {
    if (!newGroupName.trim()) return;

    const newGroup: Group = {
      id: Date.now(),
      name: newGroupName,
      studentIds: [],
    };

    setGroups([...groups, newGroup]);
    setNewGroupName('');
  };

  const getTeacherName = (id: number | null) => {
    if (!id) return 'No head teacher';
    const t = teachers.find((t) => t.id === id);
    return t ? t.name : 'Unknown';
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-palette-fern border-t-transparent rounded-full animate-spin" />
      <p className="text-palette-moss font-bold animate-pulse">Loading classes...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center space-y-4">
      <p className="text-red-600 font-bold">{error}</p>
      <button onClick={fetchData} className="px-5 py-2.5 bg-palette-fern text-white font-bold rounded-xl hover:bg-palette-leaf transition">
        Retry
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">

      // Make this above all other elements with a portal, so it covers the entire screen
      
      
      {saving && createPortal(
        <div className="fixed inset-0 bg-palette-pine/40 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-palette-fern border-t-transparent rounded-full animate-spin"></div>
            <p className="text-palette-pine font-bold text-lg">Saving...</p>
          </div>
        </div>,
        document.body
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-palette-pine">Classes Management</h1>
          <p className="text-palette-moss mt-1 font-medium">
            Manage school classes, assign head teachers, and bulk-enroll students.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-palette-fern text-white font-bold rounded-xl shadow-soft hover:bg-palette-leaf hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Class
        </button>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="bg-white rounded-2xl shadow-soft hover:shadow-lg transition-shadow border border-palette-mist overflow-hidden flex flex-col group"
          >
            {/* Card Header */}
            <div className="bg-palette-mist p-5 border-b border-palette-mist flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-palette-pine tracking-tight">{cls.name}</h2>
              </div>
              <button
                onClick={() => openEditModal(cls)}
                className="p-2 bg-white rounded-full text-palette-moss hover:text-palette-fern hover:bg-white transition shadow-sm border border-palette-mist"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col gap-4 bg-white">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-palette-mist text-palette-fern flex items-center justify-center border border-palette-sage/30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-palette-moss font-bold uppercase tracking-wider">Head Teacher</p>
                  <p className="font-bold text-palette-pine">{getTeacherName(cls.headTeacherId)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-palette-mist text-palette-fern flex items-center justify-center border border-palette-sage/30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-palette-moss font-bold uppercase tracking-wider">Students</p>
                  <p className="font-bold text-palette-pine">{cls.studentIds.length} enrolled</p>
                </div>
              </div>
            </div>

            {/* Quick action */}
            <div className="bg-gray-50 px-5 py-3.5 border-t border-gray-100 text-center">
              <button
                onClick={() => openEditModal(cls)}
                className="text-sm font-bold text-palette-fern hover:text-palette-leaf transition"
              >
                Manage Class &amp; Students &rarr;
              </button>
            </div>
          </div>
        ))}

        {/* Create Class Card */}
        <div
          onClick={openAddModal}
          className="border-2 border-dashed border-palette-sage rounded-2xl flex flex-col items-center justify-center p-8 text-palette-moss hover:text-palette-fern hover:border-palette-fern hover:bg-palette-mist transition-all cursor-pointer min-h-[300px]"
        >
          <div className="w-16 h-16 rounded-full bg-palette-mist flex items-center justify-center mb-4 border border-palette-sage/30">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-palette-pine">Create New Class</h3>
          <p className="text-sm font-medium text-center mt-2">Setup a new class and assign students.</p>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-palette-sage/45 px-4 py-6 backdrop-blur-[1px]">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-palette-mist">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-palette-mist/30">
                <h2 className="text-2xl font-bold text-palette-pine">
                  {isNewClass ? 'Create New Class' : `Edit Class: ${editingClass?.name}`}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-palette-moss hover:text-palette-pine text-3xl font-light leading-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSave} className="overflow-y-auto flex-1 flex flex-col">
                <div className="p-6 space-y-8 flex-1">
                  {/* Class Settings */}
                  <div>
                    <h3 className="text-sm font-bold text-palette-fern uppercase tracking-wider mb-4 border-b border-palette-mist pb-2">
                      Class Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-palette-pine mb-1.5">Class Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 1.A"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow outline-none transition font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-palette-pine mb-1.5">Head Teacher</label>
                        <select
                          value={selectedHeadTeacherId ?? ''}
                          onChange={(e) =>
                            setSelectedHeadTeacherId(e.target.value ? Number(e.target.value) : null)
                          }
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow outline-none transition font-medium text-palette-pine"
                        >
                          <option value="">-- No Head Teacher --</option>
                          {teachers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Student Enrollment */}
                  <div>
                    <div className="flex justify-between items-end mb-4 border-b border-palette-mist pb-2">
                      <h3 className="text-sm font-bold text-palette-fern uppercase tracking-wider">
                        Student Enrollment
                      </h3>
                      <span className="text-xs font-bold bg-palette-mist text-palette-fern px-3 py-1 rounded-full border border-palette-sage">
                        {selectedStudentIds.length} Selected
                      </span>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 max-h-[300px] overflow-y-auto">
                      {availableStudents.length === 0 ? (
                        <div className="p-8 text-center text-palette-moss">
                          <p className="mb-2 font-bold">No unassigned students available.</p>
                          <p className="text-xs font-medium">All students are already enrolled in other classes.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {availableStudents.map((student) => {
                            const isSelected = selectedStudentIds.includes(student.id);
                            return (
                              <label
                                key={student.id}
                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                  ? 'bg-palette-mist border-palette-sage shadow-sm'
                                  : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                                  }`}
                              >
                                <div className="flex-shrink-0 mr-3">
                                  <div
                                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected
                                      ? 'bg-palette-fern border-palette-fern text-white'
                                      : 'border-gray-300 bg-white'
                                      }`}
                                  >
                                    {isSelected && (
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedStudentIds([...selectedStudentIds, student.id]);
                                      } else {
                                        setSelectedStudentIds(selectedStudentIds.filter((id) => id !== student.id));
                                      }
                                    }}
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span
                                    className={`text-sm font-bold ${isSelected
                                        ? 'text-palette-pine'
                                        : 'text-gray-800'
                                      }`}
                                  >
                                    {student.name}
                                  </span>

                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {groups
                                      .filter(group =>
                                        group.studentIds.includes(student.id)
                                      )
                                      .map(group => (
                                        <span
                                          key={group.id}
                                          className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800"
                                        >
                                          {group.name}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-4 border-b border-palette-mist pb-2">
                      <h3 className="text-sm font-bold text-palette-fern uppercase tracking-wider">
                        Groups
                      </h3>
                    </div>

                    <div className="space-y-3">

                      <div className="flex gap-2">
                        <input
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          placeholder="Group name..."
                          className="flex-1 p-2 border border-gray-300 rounded-lg"
                        />

                        <button
                          type="button"
                          onClick={addGroup}
                          className="px-4 py-2 bg-palette-fern text-white rounded-lg"
                        >
                          Add Group
                        </button>
                      </div>

                      {groups.map((group) => (
                        <div
                          key={group.id}
                          className="border rounded-lg p-3 bg-gray-50"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <div className="font-bold text-palette-pine">
                                {group.name}
                              </div>

                              <div className="text-sm text-gray-500">
                                {group.studentIds.length} students
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingGroupId(
                                    editingGroupId === group.id ? null : group.id
                                  )
                                }
                                className="px-3 py-1 bg-palette-mist rounded"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setGroups(
                                    groups.filter(
                                      (g) => g.id !== group.id
                                    )
                                  );
                                }}
                                className="px-3 py-1 bg-red-100 text-red-600 rounded"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {editingGroupId === group.id && (
                            <div className="mt-3 space-y-2">
                              {selectedStudentIds.map((studentId) => {
                                const student = students.find(
                                  (s) => s.id === studentId
                                );

                                if (!student) return null;

                                const checked =
                                  group.studentIds.includes(studentId);

                                return (
                                  <label
                                    key={studentId}
                                    className="flex items-center gap-2"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => {
                                        setGroups(
                                          groups.map((g) => {
                                            if (g.id !== group.id) return g;

                                            return {
                                              ...g,
                                              studentIds: e.target.checked
                                                ? [...g.studentIds, studentId]
                                                : g.studentIds.filter(
                                                  (id) => id !== studentId
                                                ),
                                            };
                                          })
                                        );
                                      }}
                                    />

                                    <span>{student.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center gap-3">
                  <div>
                    {!isNewClass && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={saving}
                        className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-100 transition disabled:opacity-50"
                      >
                        Delete Class
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 bg-palette-fern text-white font-bold rounded-xl shadow-soft hover:bg-palette-leaf hover:-translate-y-0.5 transition-all disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Class'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ClassesPage;