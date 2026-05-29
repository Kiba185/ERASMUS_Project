import React, { useState, useEffect } from 'react';

// --- TYPES ---
type Student = { id: string; name: string; classes: string[] };
type Assignment = { id: string; subjectId: number; name: string; weight: number; date: string, classId: string };
type Grade = { id: string; gColumnId: string; userId: string; grade: string };

const GradesEditPage: React.FC = () => {
  // 1. DATABASE

  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users/student', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to load students: ${response.statusText}`);
        }

        const data = await response.json();
        const mapped: Student[] = data.map((s: any) => ({
          id: String(s.id),
          name: `${s.firstName} ${s.lastName}`,
          classes: s.classes.map((c: any) => c.name), // 👈 extract name strings
        }));
        setStudents(mapped);

        // at the end of loadStudents, after setStudents(mapped):
        const uniqueClasses = [...new Set(mapped.flatMap(s => s.classes))];
        if (uniqueClasses.length > 0) setSelectedClass(uniqueClasses[0]);
      } catch (error) {
        console.error(error);
      }
    };

    const loadAssignments = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/gradeColumns', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to load assignments: ${response.statusText}`);
        }

        const data = await response.json();
        const mapped: Assignment[] = data.map((a: any) => ({
          id: String(a.id),
          subjectId: a.subjectId,
          name: a.name,       // was commented out as "title"
          weight: a.weight,
          date: a.date
        }));
        setAssignments(mapped);
      } catch (error) {
        console.error(error);
      }
    };

    const loadGrades = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/grades', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to load students: ${response.statusText}`);
        }

        const toDisplayGrade = (val: number): string => {
          val = parseFloat(val.toString()); // ensure it's a number
          if (val === 1.5) return '1-';
          if (val === 2.5) return '2-';
          if (val === 3.5) return '3-';
          if (val === 4.5) return '4-';
          return String(Math.round(val)); // 1, 2, 3, 4, 5
        };

        const data = await response.json();
        const mapped: Grade[] = data.map((g: any) => ({
          id: String(g.id),
          gColumnId: String(g.gColumnId),
          userId: String(g.userId),
          grade: toDisplayGrade(g.grade) // 👈 convert 3.5 → "3-" on load
        }));
        setGrades(mapped);
      } catch (error) {
        console.error(error);
      }
    };

    // inside your useEffect, add:
    const loadSubjects = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/subjects', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to load subjects');

        const data = await response.json();
        setSubjects(data); // assuming API returns [{ id, name }]
        if (data.length > 0) setSelectedSubjectId(data[0].id);
      } catch (error) {
        console.error(error);
      }
    };

    const loadClasses = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/classes', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to load classes');

        const data = await response.json();
        const classNames = data.map((c: any) => c.name);
        setClasses(classNames);

        if (classNames.length > 0) setSelectedClass(classNames[0]); // default to first
      } catch (error) {
        console.error(error);
      }
    };

    loadSubjects();
    loadStudents();
    loadAssignments();
    loadGrades();
    loadClasses();
  }, []);

  // 2. FILTER STATES
  const [selectedClass, setSelectedClass] = useState<string>('');
  //const [selectedSubject, setSelectedSubject] = useState<string>('');

  // 3. NEW COLUMN STATES (Supports empty string to allow deletion)
  const [newColTitle, setNewColTitle] = useState('');
  const [newColWeight, setNewColWeight] = useState<number | ''>(10);

  // 4. EDIT COLUMN MODAL STATES
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editWeight, setEditWeight] = useState<number | ''>(10);

  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(0);

  const currentStudents = students.filter(s => s.classes.includes(selectedClass));
  const currentAssignments = assignments.filter(a => a.subjectId === selectedSubjectId);


  // --- ADD COLUMN LOGIC ---
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle || newColWeight === '') return;

    fetch('http://localhost:3000/api/gradeColumns', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newColTitle,
        subjectId: selectedSubjectId,
        weight: newColWeight,
        date: new Date().toISOString()
      })
    })
      .then(res => res.json())
      .then(updatedGradeColumn => {
        setAssignments([...assignments, updatedGradeColumn]);
        setNewColTitle('');
      });
  };



  // --- DELETE COLUMN LOGIC ---
  const handleDeleteColumn = async (assignmentId: string, assignmentName: string) => {
    if (!window.confirm(`Delete column "${assignmentName}" and all its grades?`)) return;

    try {
      const res = await fetch(`http://localhost:3000/api/gradeColumns/${assignmentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to delete');

      // Only remove from UI if backend succeeded
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      setGrades(prev => prev.filter(g => g.gColumnId !== assignmentId));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete column.');
    }
  };



  // --- OPEN EDIT MODAL ---
  const startEditingColumn = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setEditTitle(assignment.name);
    setEditWeight(assignment.weight);
  };



  // --- SAVE EDIT LOGIC ---
  const handleSaveEditColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment || !editTitle || editWeight === '') return;

    setAssignments(prev =>
      prev.map(a => a.id === editingAssignment.id ? { ...a, name: editTitle, weight: Number(editWeight) } : a)
    );

    const assignmentId = editingAssignment.id;
    try {
      const res = await fetch(`http://localhost:3000/api/gradeColumns/${assignmentId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editTitle,
          subjectId: selectedSubjectId,
          weight: Number(editWeight),
          date: new Date().toISOString()
        })
      });

      if (!res.ok) throw new Error('Failed to update');

      // Only remove from UI if backend succeeded
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      setGrades(prev => prev.filter(g => g.gColumnId !== assignmentId));
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update column.');
    }

    setEditingAssignment(null);
  };




  // --- GRADE CHANGE LOGIC (WITH VALIDATIONS & TRANSFORMATIONS) ---
  const handleGradeChange = (studentId: string, assignmentId: string, value: string) => {
    let val = value.trim();

    // Clear cell if empty
    if (val === '') {
      setGrades(prev => prev.filter(g => !(g.userId === studentId && g.gColumnId === assignmentId)));

      fetch(`http://localhost:3000/api/grades/${studentId}/${assignmentId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: studentId,
          gradeColumnId: assignmentId
        })
      })

      return;
    }

    // Allow typing intermediate dot while inputting valid decimal values
    if (val === '1.' || val === '2.' || val === '3.' || val === '4.') {
      setGrades(prev => {
        const filtered = prev.filter(g => !(g.userId === studentId && g.gColumnId === assignmentId));
        return [...filtered, { id: `${studentId}-${assignmentId}`, userId: studentId, gColumnId: assignmentId, grade: val }];
      });
      return;
    }

    // Auto-transform allowed decimals to minus format notation
    if (val === '1.5' || val === '1.50') val = '1-';
    if (val === '2.5' || val === '2.50') val = '2-';
    if (val === '3.5' || val === '3.50') val = '3-';
    if (val === '4.5' || val === '4.50') val = '4-';

    // Strictly validate final allowed grade strings (Whole numbers 1-5 & half-grades 1- to 4-)
    const validGrades = ['1', '2', '3', '4', '5', '1-', '2-', '3-', '4-'];
    if (validGrades.includes(val)) {
      setGrades(prev => {
        const filtered = prev.filter(g => !(g.userId === studentId && g.gColumnId === assignmentId));
        return [...filtered, { id: `${studentId}-${assignmentId}`, userId: studentId, gColumnId: assignmentId, grade: val }];
      });

      fetch('http://localhost:3000/api/grades', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: val.includes('-') ? parseInt(val[0]) + 0.5 : parseInt(val),
          userId: studentId,
          gradeColumnId: assignmentId
        })
      })
    } else {
      alert('Invalid grade format! Only whole numbers (1-5) and specific half-grades (.5 values transformed to minus notation, e.g., 1.5 -> 1-) are allowed.');
    }
  };

  const handleClearCell = (studentId: string, assignmentId: string) => {
    setGrades(grades.filter(g => !(g.userId === studentId && g.gColumnId === assignmentId)));

    fetch(`http://localhost:3000/api/grades/${studentId}/${assignmentId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: studentId,
        gradeColumnId: assignmentId
      })
    })
  };

  const getGradeValue = (studentId: string, assignmentId: string) => {
    const grade = grades.find(g => g.userId === studentId && g.gColumnId === assignmentId);
    return grade ? grade.grade : '';
  };




  // --- AVERAGE CALCULATION LOGIC ---
  const calculateAverage = (studentId: string) => {
    let sum = 0;
    let weightSum = 0;

    currentAssignments.forEach(assignment => {
      const grade = grades.find(g => g.userId === studentId && g.gColumnId === assignment.id);
      if (grade && grade.grade) {
        const numValue = grade.grade.includes('-') ? parseInt(grade.grade[0]) + 0.5 : parseInt(grade.grade[0]);
        if (!isNaN(numValue)) {
          sum += numValue * assignment.weight;
          weightSum += assignment.weight;
        }
      }
    });

    return weightSum > 0 ? (sum / weightSum).toFixed(2) : '-';
  };




  // --- ARROW & ENTER KEY NAVIGATION ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    let targetRow = rowIndex;
    let targetCol = colIndex;

    switch (e.key) {
      case 'ArrowUp':
        targetRow = rowIndex - 1;
        break;
      case 'Enter':
      case 'ArrowDown':
        targetRow = rowIndex + 1;
        break;
      case 'ArrowLeft':
        if ((e.target as HTMLInputElement).selectionStart === 0) {
          targetCol = colIndex - 1;
        }
        break;
      case 'ArrowRight':
        const valLen = (e.target as HTMLInputElement).value.length;
        if ((e.target as HTMLInputElement).selectionStart === valLen) {
          targetCol = colIndex + 1;
        }
        break;
      default:
        return;
    }

    const targetCell = document.getElementById(`cell-${targetRow}-${targetCol}`);
    if (targetCell) {
      e.preventDefault();
      targetCell.focus();
      (targetCell as HTMLInputElement).select();
    }
  };




  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* 1. HEADER AND FILTERS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quick Grading</h1>
          <p className="text-gray-500">Enter and delete grades or columns rapidly</p>
        </div>

        <div className="flex gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-bold focus:ring-2 focus:ring-green-500 outline-none"
            >
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
              className="p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-bold focus:ring-2 focus:ring-green-500 outline-none"
            >
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 2. ADD NEW COLUMN */}
      <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-end gap-4">
        <form onSubmit={handleAddColumn} className="flex items-end gap-4 w-full">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-green-800 mb-1">New Column Title (e.g., Test)</label>
            <input
              type="text"
              value={newColTitle}
              onChange={(e) => setNewColTitle(e.target.value)}
              placeholder="Enter topic/category..."
              className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-semibold text-green-800 mb-1">Weight</label>
            <input
              type="number"
              min="1" max="10"
              value={newColWeight}
              onChange={(e) => setNewColWeight(Number(e.target.value))}
              className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>
          <button type="submit" className="py-2.5 px-6 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition h-[46px]">
            + Add Column
          </button>
        </form>
      </div>

      {/* 3. INTERACTIVE SPREADSHEET */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300 text-sm font-bold text-gray-700">
              <th className="p-4 w-48 border-r border-gray-200">Student</th>

              {/* Dynamic Column Headers */}
              {currentAssignments.map((assignment) => (
                <th key={assignment.id} className="p-3 border-r border-gray-200 text-center min-w-[160px] max-w-[220px] group/header relative align-middle">
                  <div className="text-xs uppercase tracking-tight text-gray-600 font-bold pr-14 pl-1 break-words whitespace-normal line-clamp-2" title={assignment.name}>
                    {assignment.name}
                  </div>
                  <div className="text-[10px] bg-white border border-gray-300 rounded px-1.5 py-0.5 inline-block mt-1.5 text-gray-500 mr-12 font-medium">
                    W: {assignment.weight}
                  </div>

                  <button
                    onClick={() => startEditingColumn(assignment)}
                    className="absolute top-1/2 -translate-y-1/2 right-10 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded px-2 py-1 opacity-0 group-hover/header:opacity-100 transition-all text-xs font-semibold border border-blue-200 shadow-sm"
                    title="Edit column properties"
                  >
                    ✎
                  </button>

                  <button
                    onClick={() => handleDeleteColumn(assignment.id, assignment.name)}
                    className="absolute top-1/2 -translate-y-1/2 right-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded px-2 py-1 opacity-0 group-hover/header:opacity-100 transition-all text-xs font-semibold border border-red-200 shadow-sm"
                    title="Delete entire column"
                  >
                    ✕
                  </button>
                </th>
              ))}

              <th className="p-4 w-24 text-center bg-gray-200">Average</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {currentStudents.length === 0 ? (
              <tr><td colSpan={currentAssignments.length + 2} className="p-8 text-center text-gray-500">No students found.</td></tr>
            ) : (
              currentStudents.map((student, rowIndex) => {
                const avg = calculateAverage(student.id);

                return (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 border-r border-gray-200 bg-white">
                      {student.name}
                    </td>

                    {/* Grade Input Cells */}
                    {currentAssignments.map((assignment, colIndex) => {
                      const val = getGradeValue(student.id, assignment.id);

                      return (
                        <td key={assignment.id} className="p-0 border-r border-gray-200 relative group/cell">
                          <input
                            id={`cell-${rowIndex}-${colIndex}`}
                            type="text"
                            value={val}
                            onChange={(e) => handleGradeChange(student.id, assignment.id, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                            className={`w-full h-12 text-center text-lg font-bold outline-none transition-all pr-6 focus:bg-green-100 focus:text-green-900 focus:ring-inset focus:ring-2 focus:ring-green-500 ${val ? 'text-gray-800' : 'text-transparent'
                              }`}
                            placeholder="-"
                          />

                          {/* Large grade clear cross button aligned vertically center, close to right side */}
                          {val && (
                            <button
                              onClick={() => handleClearCell(student.id, assignment.id)}
                              className="absolute top-1/2 -translate-y-1/2 right-2 w-6 h-6 bg-red-100 text-red-600 rounded-md flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition hover:bg-red-500 hover:text-white border border-red-200 shadow-sm"
                              title="Delete grade"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                              </svg>
                            </button>
                          )}
                        </td>
                      );
                    })}

                    <td className="p-4 text-center border-l-2 border-gray-300 bg-gray-50">
                      <span className={`font-black text-lg ${avg === '-' ? 'text-gray-300' : Number(avg) <= 2.5 ? 'text-green-600' : Number(avg) >= 4 ? 'text-red-600' : 'text-orange-500'}`}>
                        {avg}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. EDIT COLUMN POPUP/MODAL OVERLAY */}
      {editingAssignment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xl max-w-md w-full mx-4 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-bold text-gray-800">Edit Column Properties</h3>
              <button
                onClick={() => setEditingAssignment(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditColumn} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Column Title (Max 75 chars)</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={25}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Weight</label>
                <input
                  type="number"
                  min="1" max="10"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAssignment(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GradesEditPage;