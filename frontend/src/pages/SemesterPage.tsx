import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

// --- TYPES & INTERFACES ---
type DistinctionType = 'With Distinction' | 'Passed' | 'Failed';

type SubjectGrade = {
  subject: string;
  grade: number;
};

type SemesterData = {
  semesterNumber: number;
  gpa: number;
  attendanceRate: number;
  excusedHours: number;
  unexcusedHours: number;
  distinction: DistinctionType;
  grades: SubjectGrade[];
};

type AcademicYearGroup = {
  id: string;
  yearName: string;
  className: string;
  semesters: {
    first: SemesterData;
    second: SemesterData;
  };
};

const SemesterPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  // --- ROLE LOGIC ---
  const userRole = currentUser?.role || 'student';
  const isTeacher = userRole === 'teacher';
  const isAdmin = userRole === 'admin';
  const canViewAllStudents = isTeacher || isAdmin;

  // --- MOCK DATA ---
  const academicHistory: AcademicYearGroup[] = useMemo(() => [
    {
      id: 'y3',
      yearName: '2025/2026',
      className: '4.A',
      semesters: {
        first: {
          semesterNumber: 1,
          gpa: 1.35,
          attendanceRate: 94.2,
          excusedHours: 24,
          unexcusedHours: 0,
          distinction: 'With Distinction',
          grades: [
            { subject: 'Mathematics', grade: 1 },
            { subject: 'English Language', grade: 1 },
            { subject: 'Czech Language', grade: 2 },
            { subject: 'Physics', grade: 1 },
            { subject: 'Computer Science', grade: 1 },
          ],
        },
        second: {
          semesterNumber: 2,
          gpa: 1.16,
          attendanceRate: 96.8,
          excusedHours: 12,
          unexcusedHours: 0,
          distinction: 'With Distinction',
          grades: [
            { subject: 'Mathematics', grade: 1 },
            { subject: 'English Language', grade: 1 },
            { subject: 'Czech Language', grade: 1 },
            { subject: 'Physics', grade: 1 },
            { subject: 'Computer Science', grade: 1 },
          ],
        },
      },
    },
    {
      id: 'y2',
      yearName: '2024/2025',
      className: '3.A',
      semesters: {
        first: {
          semesterNumber: 1,
          gpa: 1.66,
          attendanceRate: 91.5,
          excusedHours: 36,
          unexcusedHours: 0,
          distinction: 'Passed',
          grades: [
            { subject: 'Mathematics', grade: 2 },
            { subject: 'English Language', grade: 1 },
            { subject: 'Czech Language', grade: 2 },
            { subject: 'Physics', grade: 2 },
            { subject: 'Computer Science', grade: 1 },
          ],
        },
        second: {
          semesterNumber: 2,
          gpa: 1.5,
          attendanceRate: 93.0,
          excusedHours: 28,
          unexcusedHours: 0,
          distinction: 'With Distinction',
          grades: [
            { subject: 'Mathematics', grade: 2 },
            { subject: 'English Language', grade: 1 },
            { subject: 'Czech Language', grade: 1 },
            { subject: 'Physics', grade: 2 },
            { subject: 'Computer Science', grade: 1 },
          ],
        },
      },
    },
  ], []);

  // --- STATE ---
  const [activeYearId, setActiveYearId] = useState<string>(academicHistory[0]?.id);
  const [expandedSheets, setExpandedSheets] = useState<Record<string, boolean>>({});

  // --- MEMOIZED CALCULATIONS ---
  const { lifetimeGPA, lifetimeAttendance, totalYears } = useMemo(() => {
    if (!academicHistory.length) return { lifetimeGPA: '0.00', lifetimeAttendance: '0.0', totalYears: 0 };
    
    const totalSemesters = academicHistory.length * 2;
    const gpaSum = academicHistory.reduce((acc, curr) => acc + curr.semesters.first.gpa + curr.semesters.second.gpa, 0);
    const attendanceSum = academicHistory.reduce((acc, curr) => acc + curr.semesters.first.attendanceRate + curr.semesters.second.attendanceRate, 0);

    return {
      lifetimeGPA: (gpaSum / totalSemesters).toFixed(2),
      lifetimeAttendance: (attendanceSum / totalSemesters).toFixed(1),
      totalYears: academicHistory.length,
    };
  }, [academicHistory]);

  const activeYearData = useMemo(() => 
    academicHistory.find(y => y.id === activeYearId) || academicHistory[0], 
  [academicHistory, activeYearId]);

  // --- HANDLERS ---
  const toggleGradeSheet = (sheetId: string) => {
    setExpandedSheets((prev) => ({ ...prev, [sheetId]: !prev[sheetId] }));
  };

  // --- UI HELPERS ---
  const getDistinctionColors = (status: DistinctionType) => {
    switch (status) {
      case 'With Distinction': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Passed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Failed': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                Academic Record
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Student Performance
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {canViewAllStudents ? "Viewing record for: " : "Overview for "}
              <span className="font-semibold text-slate-700">{currentUser?.userName || 'Active Student'}</span>
            </p>
          </div>

          {canViewAllStudents && (
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <select 
                aria-label="Select Class"
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 transition-shadow"
              >
                <option>Class: 4.A (Current)</option>
                <option>Class: 3.B</option>
              </select>
              <select 
                aria-label="Select Student"
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 transition-shadow"
              >
                <option>Student: {currentUser?.userName || 'Active Student'}</option>
                <option>Student: John Doe</option>
              </select>
            </div>
          )}
        </header>

        {/* LIFETIME STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Career GPA', value: lifetimeGPA, icon: '' },
            { label: 'Avg. Attendance', value: `${lifetimeAttendance}%`, icon: '' },
            { label: 'Tracked Years', value: totalYears, icon: '' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className="text-2xl bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100">
                {stat.icon}
              </div>
            </div>
          ))}
        </section>

        {/* YEAR NAVIGATION TABS */}
        <nav className="flex space-x-1 border-b border-slate-200 overflow-x-auto pb-px" aria-label="Academic Years">
          {academicHistory.map((year) => {
            const isActive = activeYearId === year.id;
            return (
              <button
                key={year.id}
                onClick={() => setActiveYearId(year.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                  isActive 
                    ? 'border-green-600 text-green-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                School Year {year.yearName} <span className="ml-1 text-xs px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">{year.className}</span>
              </button>
            );
          })}
        </nav>

        {/* ACTIVE YEAR SEMESTERS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {renderSemesterCard(activeYearData.semesters.first, "1st Semester", `${activeYearId}-sem1`)}
          {renderSemesterCard(activeYearData.semesters.second, "2nd Semester", `${activeYearId}-sem2`)}
        </div>

      </div>
    </div>
  );

  // --- SUB-COMPONENT ---
  function renderSemesterCard(semData: SemesterData, title: string, sheetId: string) {
    const isExpanded = expandedSheets[sheetId] || false;

    return (
      <article className="bg-white rounded-2xl shadow-sm border border-slate-200/60 flex flex-col overflow-hidden">
        
        {/* Card Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500 mt-1">End of term evaluation</p>
          </div>
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getDistinctionColors(semData.distinction)}`}>
            {semData.distinction}
          </span>
        </div>

        {/* Key Metrics */}
        <div className="p-6 grid grid-cols-2 gap-4 bg-slate-50/50">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">Grade Average</span>
            <span className="text-2xl font-bold text-slate-900">{semData.gpa.toFixed(2)}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">Attendance</span>
            <span className="text-2xl font-bold text-emerald-600">{semData.attendanceRate}%</span>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${semData.attendanceRate}%` }} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 flex justify-between items-center">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">Absences</span>
              <span className="text-lg font-bold text-slate-900">{semData.excusedHours}h <span className="text-sm font-normal text-slate-500">excused</span></span>
            </div>
            {semData.unexcusedHours > 0 ? (
              <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg text-sm font-semibold">
                {semData.unexcusedHours}h unexcused
              </span>
            ) : (
              <span className="bg-slate-50 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium">
                0h unexcused
              </span>
            )}
          </div>
        </div>

        {/* Collapsible Grade Sheet */}
        <div className="mt-auto border-t border-slate-100">
          <button 
            onClick={() => toggleGradeSheet(sheetId)}
            aria-expanded={isExpanded}
            aria-controls={`grades-${sheetId}`}
            className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors focus:outline-hidden focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
          >
            <span className="text-sm font-semibold text-slate-700">Detailed Grade Sheet</span>
            <svg 
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div 
            id={`grades-${sheetId}`}
            role="region"
            aria-hidden={!isExpanded}
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-y border-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold text-slate-500">Subject</th>
                  <th scope="col" className="px-6 py-3 font-semibold text-slate-500 text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {semData.grades.map((g, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 text-slate-700">{g.subject}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md font-bold ${
                        g.grade === 1 ? 'bg-emerald-100 text-emerald-800' :
                        g.grade === 2 ? 'bg-blue-100 text-blue-800' :
                        g.grade === 3 ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {g.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </article>
    );
  }
};

export default SemesterPage;