<<<<<<< Updated upstream
import React, { useState } from 'react';

// --- TYPES ---
type Student = { id: string; name: string; className: string };
type Assignment = { id: string; classId: string; subject: string; title: string; weight: number };
type Grade = { studentId: string; assignmentId: string; value: string };

const TeacherSpreadsheet: React.FC = () => {
  // 1. MOCK DATABASE
  const [students] = useState<Student[]>([
    { id: 's1', name: 'Jan Novák', className: '4.A' },
    { id: 's2', name: 'Eva Dvořáková', className: '4.A' },
    { id: 's3', name: 'Petr Svoboda', className: '4.A' },
    { id: 's4', name: 'Klára Zelená', className: '4.A' },
    { id: 's5', name: 'Anna Kovářová', className: '3.B' },
  ]);

  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: 'a1', classId: '4.A', subject: 'Mathematics', title: 'Midterm Exam', weight: 10 },
    { id: 'a2', classId: '4.A', subject: 'Mathematics', title: 'Pop Quiz', weight: 2 },
  ]);

  const [grades, setGrades] = useState<Grade[]>([
    { studentId: 's1', assignmentId: 'a1', value: '1' },
    { studentId: 's2', assignmentId: 'a1', value: '2-' },
    { studentId: 's1', assignmentId: 'a2', value: '3' },
  ]);

  // 2. FILTER STATES
  const [selectedClass, setSelectedClass] = useState<string>('4.A');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');

  // 3. NEW COLUMN STATES
  const [newColTitle, setNewColTitle] = useState('');
  const [newColWeight, setNewColWeight] = useState<number>(10);

  const classes = Array.from(new Set(students.map(s => s.className)));
  const subjects = ['Mathematics', 'Physics', 'Czech Language', 'English Language'];

  const currentStudents = students.filter(s => s.className === selectedClass);
  const currentAssignments = assignments.filter(a => a.classId === selectedClass && a.subject === selectedSubject);

  // --- ADD COLUMN LOGIC ---
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle) return;
    
    const newAssignment: Assignment = {
      id: `a${Date.now()}`,
      classId: selectedClass,
      subject: selectedSubject,
      title: newColTitle,
      weight: newColWeight,
    };
    setAssignments([...assignments, newAssignment]);
    setNewColTitle('');
  };

  // --- DELETE COLUMN LOGIC ---
  const handleDeleteColumn = (assignmentId: string, assignmentTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the entire column "${assignmentTitle}" and all its grades?`)) {
      setAssignments(assignments.filter(a => a.id !== assignmentId));
      setGrades(grades.filter(g => g.assignmentId !== assignmentId));
    }
  };

  // --- GRADE CHANGE LOGIC ---
  const handleGradeChange = (studentId: string, assignmentId: string, value: string) => {
    setGrades(prev => {
      const filtered = prev.filter(g => !(g.studentId === studentId && g.assignmentId === assignmentId));
      if (value.trim() === '') return filtered;
      return [...filtered, { studentId, assignmentId, value }];
    });
  };

  // Clear single grade cell button click
  const handleClearCell = (studentId: string, assignmentId: string) => {
    setGrades(grades.filter(g => !(g.studentId === studentId && g.assignmentId === assignmentId)));
  };

  const getGradeValue = (studentId: string, assignmentId: string) => {
    const grade = grades.find(g => g.studentId === studentId && g.assignmentId === assignmentId);
    return grade ? grade.value : '';
  };

  // --- AVERAGE CALCULATION LOGIC ---
  const calculateAverage = (studentId: string) => {
    let sum = 0;
    let weightSum = 0;

    currentAssignments.forEach(assignment => {
      const grade = grades.find(g => g.studentId === studentId && g.assignmentId === assignment.id);
      if (grade && grade.value) {
        const numValue = grade.value.includes('-') ? parseInt(grade.value[0]) + 0.5 : parseInt(grade.value[0]);
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
=======
import React from 'react';

const GradesEditPage: React.FC = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Grades Editing (Detail)</h1>
>>>>>>> Stashed changes
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
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-bold focus:ring-2 focus:ring-green-500 outline-none"
            >
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
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
                <th key={assignment.id} className="p-2 border-r border-gray-200 text-center min-w-[140px] group/header relative">
                  <div className="text-xs uppercase tracking-wider text-gray-500 truncate pr-8 pl-2" title={assignment.title}>
                    {assignment.title}
                  </div>
                  <div className="text-[10px] bg-white border border-gray-300 rounded px-2 py-0.5 inline-block mt-1 text-gray-600 mr-6">
                    W: {assignment.weight}
                  </div>
                  
                  {/* Larger delete column button positioned near the right side */}
                  <button
                    onClick={() => handleDeleteColumn(assignment.id, assignment.title)}
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
                            className={`w-full h-12 text-center text-lg font-bold outline-none transition-all pr-6 focus:bg-green-100 focus:text-green-900 focus:ring-inset focus:ring-2 focus:ring-green-500 ${
                              val ? 'text-gray-800' : 'text-transparent'
                            }`}
                            placeholder="-"
                          />

                          {/* Larger grade clear button centered vertically and aligned close to the right edge */}
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

    </div>
  );
};
<<<<<<< Updated upstream

export default TeacherSpreadsheet;
=======
export default GradesEditPage;
>>>>>>> Stashed changes
