import React, { useState, useMemo } from 'react';

// --- MOCK DATA ---
interface MockStudent {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  classId: number | null; 
}

interface MockTeacher {
  id: number;
  firstName: string;
  lastName: string;
}

interface MockClass {
  id: number;
  name: string;
  schoolYear: string;
  headTeacherId: number | null;
  averageAttendance: number;
  averageGrade: number;
}

const initialTeachers: MockTeacher[] = [
  { id: 101, firstName: 'Karel', lastName: 'Učitel' },
  { id: 102, firstName: 'Jana', lastName: 'Nováková' },
  { id: 103, firstName: 'Petr', lastName: 'Svoboda' },
];

const initialStudents: MockStudent[] = [
  { id: 1, firstName: 'Jan', lastName: 'Novák', username: 'jnovak', classId: 1 },
  { id: 2, firstName: 'Eva', lastName: 'Svobodová', username: 'esvobodova', classId: 1 },
  { id: 3, firstName: 'Tomáš', lastName: 'Marný', username: 'tmarny', classId: 2 },
  { id: 4, firstName: 'Anna', lastName: 'Dvořáková', username: 'advorakova', classId: 2 },
  { id: 5, firstName: 'Lukáš', lastName: 'Černý', username: 'lcerny', classId: null },
  { id: 6, firstName: 'Markéta', lastName: 'Bílá', username: 'mbila', classId: null },
  { id: 7, firstName: 'Jakub', lastName: 'Zelený', username: 'jzeleny', classId: null },
  { id: 8, firstName: 'Karolína', lastName: 'Modrá', username: 'kmodra', classId: null },
  { id: 9, firstName: 'Filip', lastName: 'Rychlý', username: 'frychly', classId: null },
  { id: 10, firstName: 'Tereza', lastName: 'Krásná', username: 'tkrasna', classId: null },
];

const initialClasses: MockClass[] = [
  { id: 1, name: '1.A', schoolYear: '2025/2026', headTeacherId: 101, averageAttendance: 94.5, averageGrade: 1.6 },
  { id: 2, name: '1.B', schoolYear: '2025/2026', headTeacherId: 102, averageAttendance: 98.2, averageGrade: 1.2 },
];

// --- COMPONENT ---
const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<MockClass[]>(initialClasses);
  const [students, setStudents] = useState<MockStudent[]>(initialStudents);
  const [teachers] = useState<MockTeacher[]>(initialTeachers);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<MockClass | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  const openAddModal = () => {
    setEditingClass({
      id: Date.now(),
      name: '',
      schoolYear: '2025/2026',
      headTeacherId: null,
      averageAttendance: 100, 
      averageGrade: 1.0,      
    });
    setSelectedStudentIds([]);
    setIsModalOpen(true);
  };

  const openEditModal = (cls: MockClass) => {
    setEditingClass({ ...cls });
    setSelectedStudentIds(students.filter(s => s.classId === cls.id).map(s => s.id));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    setClasses(prev => {
      const exists = prev.find(c => c.id === editingClass.id);
      if (exists) {
        return prev.map(c => c.id === editingClass.id ? editingClass : c);
      }
      return [...prev, editingClass];
    });

    setStudents(prev => prev.map(s => {
      if (selectedStudentIds.includes(s.id)) {
        return { ...s, classId: editingClass.id };
      }
      if (s.classId === editingClass.id && !selectedStudentIds.includes(s.id)) {
        return { ...s, classId: null };
      }
      return s;
    }));

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!editingClass || editingClass.id >= 1000000) return;
    if (window.confirm(`Are you sure you want to delete class ${editingClass.name}?`)) {
      setClasses(prev => prev.filter(c => c.id !== editingClass.id));
      setStudents(prev => prev.map(s => s.classId === editingClass.id ? { ...s, classId: null } : s));
      setIsModalOpen(false);
    }
  };

  const availableStudentsForModal = useMemo(() => {
    if (!editingClass) return [];
    return students.filter(s => s.classId === editingClass.id || s.classId === null);
  }, [students, editingClass]);

  const getTeacherName = (id: number | null) => {
    if (!id) return 'No head teacher';
    const t = teachers.find(t => t.id === id);
    return t ? `${t.firstName} ${t.lastName}` : 'Unknown';
  };

  const getStudentCount = (classId: number) => {
    return students.filter(s => s.classId === classId).length;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-palette-pine">Classes Management</h1>
          <p className="text-palette-moss mt-1 font-medium">Manage school classes, assign head teachers, and bulk-enroll students.</p>
        </div>
        <button 
          onClick={openAddModal} 
          className="px-5 py-2.5 bg-palette-fern text-white font-bold rounded-xl shadow-soft hover:bg-palette-leaf hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Create New Class
        </button>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(cls => (
          <div key={cls.id} className="bg-white rounded-2xl shadow-soft hover:shadow-lg transition-shadow border border-palette-mist overflow-hidden flex flex-col group">
            {/* Card Header */}
            <div className="bg-palette-mist p-5 border-b border-palette-mist flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-palette-pine tracking-tight">{cls.name}</h2>
                <span className="inline-block mt-1 px-2.5 py-1 bg-white text-palette-fern text-xs font-bold rounded-md border border-palette-sage shadow-sm">
                  {cls.schoolYear}
                </span>
              </div>
              <button onClick={() => openEditModal(cls)} className="p-2 bg-white rounded-full text-palette-moss hover:text-palette-fern hover:bg-white transition shadow-sm border border-palette-mist">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col gap-4 bg-white">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-palette-mist text-palette-fern flex items-center justify-center border border-palette-sage/30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <p className="text-xs text-palette-moss font-bold uppercase tracking-wider">Head Teacher</p>
                  <p className="font-bold text-palette-pine">{getTeacherName(cls.headTeacherId)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-palette-mist text-palette-fern flex items-center justify-center border border-palette-sage/30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                  <p className="text-xs text-palette-moss font-bold uppercase tracking-wider">Students</p>
                  <p className="font-bold text-palette-pine">{getStudentCount(cls.id)} enrolled</p>
                </div>
              </div>

              {/* Statistics */}
              <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="bg-palette-mist/40 rounded-xl p-3 text-center border border-palette-mist">
                  <p className="text-xs text-palette-moss font-bold mb-1 uppercase tracking-wider">Avg Grade</p>
                  <p className="text-xl font-black text-palette-pine">{cls.averageGrade.toFixed(2)}</p>
                </div>
                <div className="bg-palette-mist/40 rounded-xl p-3 text-center border border-palette-mist">
                  <p className="text-xs text-palette-moss font-bold mb-1 uppercase tracking-wider">Attendance</p>
                  <div className="flex items-center justify-center gap-1.5">
                    <p className="text-xl font-black text-palette-pine">{cls.averageAttendance}%</p>
                    {cls.averageAttendance > 95 ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm"></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick action to view students */}
            <div className="bg-gray-50 px-5 py-3.5 border-t border-gray-100 text-center">
              <button onClick={() => openEditModal(cls)} className="text-sm font-bold text-palette-fern hover:text-palette-leaf transition">
                Manage Class & Students &rarr;
              </button>
            </div>
          </div>
        ))}
        
        {/* Create Class Card */}
        <div 
          onClick={openAddModal} 
          className="border-2 border-dashed border-palette-sage rounded-2xl flex flex-col items-center justify-center p-8 text-palette-moss hover:text-palette-fern hover:border-palette-fern hover:bg-palette-mist transition-all cursor-pointer min-h-[300px]"
        >
          <div className="w-16 h-16 rounded-full bg-palette-mist flex items-center justify-center mb-4 group-hover:bg-white transition shadow-sm border border-palette-sage/30">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </div>
          <h3 className="text-lg font-bold text-palette-pine">Create New Class</h3>
          <p className="text-sm font-medium text-center mt-2">Setup a new class and assign students.</p>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && editingClass && (
        <div className="fixed inset-0 bg-palette-pine/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-palette-mist">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-palette-mist/30">
              <h2 className="text-2xl font-bold text-palette-pine">
                {editingClass.id < 1000000 ? `Edit Class: ${editingClass.name}` : 'Create New Class'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-palette-moss hover:text-palette-pine text-3xl font-light leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="overflow-y-auto flex-1 flex flex-col">
              <div className="p-6 space-y-8 flex-1">
                
                {/* Basic Info Section */}
                <div>
                  <h3 className="text-sm font-bold text-palette-fern uppercase tracking-wider mb-4 border-b border-palette-mist pb-2">Class Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-palette-pine mb-1.5">Class Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. 1.A"
                        value={editingClass.name} 
                        onChange={e => setEditingClass({...editingClass, name: e.target.value})} 
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow outline-none transition font-medium" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-palette-pine mb-1.5">School Year</label>
                      <select 
                        value={editingClass.schoolYear} 
                        onChange={e => setEditingClass({...editingClass, schoolYear: e.target.value})} 
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow outline-none transition font-medium text-palette-pine"
                      >
                        <option value="2024/2025">2024/2025</option>
                        <option value="2025/2026">2025/2026</option>
                        <option value="2026/2027">2026/2027</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-palette-pine mb-1.5">Head Teacher</label>
                      <select 
                        value={editingClass.headTeacherId || ''} 
                        onChange={e => setEditingClass({...editingClass, headTeacherId: e.target.value ? Number(e.target.value) : null})} 
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-palette-meadow outline-none transition font-medium text-palette-pine"
                      >
                        <option value="">-- Select Teacher --</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.lastName} {t.firstName}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bulk Student Assignment Section */}
                <div>
                  <div className="flex justify-between items-end mb-4 border-b border-palette-mist pb-2">
                    <h3 className="text-sm font-bold text-palette-fern uppercase tracking-wider">Student Enrollment</h3>
                    <span className="text-xs font-bold bg-palette-mist text-palette-fern px-3 py-1 rounded-full border border-palette-sage">
                      {selectedStudentIds.length} Selected
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 max-h-[300px] overflow-y-auto">
                    {availableStudentsForModal.length === 0 ? (
                      <div className="p-8 text-center text-palette-moss">
                        <p className="mb-2 font-bold">No unassigned students available.</p>
                        <p className="text-xs font-medium">All students are already enrolled in other classes.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {availableStudentsForModal.map(student => {
                          const isSelected = selectedStudentIds.includes(student.id);
                          return (
                            <label 
                              key={student.id} 
                              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-palette-mist border-palette-sage shadow-sm' 
                                  : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex-shrink-0 mr-3">
                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                                  isSelected ? 'bg-palette-fern border-palette-fern text-white' : 'border-gray-300 bg-white'
                                }`}>
                                  {isSelected && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input 
                                  type="checkbox" 
                                  className="hidden"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedStudentIds([...selectedStudentIds, student.id]);
                                    } else {
                                      setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-sm font-bold ${isSelected ? 'text-palette-pine' : 'text-gray-800'}`}>
                                  {student.lastName} {student.firstName}
                                </span>
                                <span className={`text-xs font-medium ${isSelected ? 'text-palette-moss' : 'text-gray-500'}`}>
                                  @{student.username}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center gap-3">
                <div>
                  {editingClass.id < 1000000 && (
                    <button 
                      type="button" 
                      onClick={handleDelete}
                      className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-100 transition"
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
                    className="px-5 py-2.5 bg-palette-fern text-white font-bold rounded-xl shadow-soft hover:bg-palette-leaf hover:-translate-y-0.5 transition-all"
                  >
                    Save Class
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
