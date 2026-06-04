import React, { useState, useMemo } from 'react';
import { usePDF } from 'react-to-pdf';
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
    second?: SemesterData;
  };
};

const SemesterPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  // --- ROLE LOGIC ---
  const userRole = currentUser?.role || 'admin'; 
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
  const activeYearData = useMemo(() => 
    academicHistory.find(y => y.id === activeYearId) || academicHistory[0], 
  [academicHistory, activeYearId]);

  const hasSecondSemester = !!activeYearData.semesters.second;

  // --- PDF HOOK ---
  const { toPDF, targetRef } = usePDF({
    filename: `Report_Card_${activeYearData.yearName.replace('/','-')}_${currentUser?.userName || 'Student'}.pdf`,
    page: { margin: 10 }
  });

  const { lifetimeGPA, lifetimeAttendance, totalYears } = useMemo(() => {
    if (!academicHistory.length) return { lifetimeGPA: '0.00', lifetimeAttendance: '0.0', totalYears: 0 };
    let totalSemesters = 0;
    let gpaSum = 0;
    let attendanceSum = 0;
    academicHistory.forEach(year => {
      if (year.semesters.first) { totalSemesters++; gpaSum += year.semesters.first.gpa; attendanceSum += year.semesters.first.attendanceRate; }
      if (year.semesters.second) { totalSemesters++; gpaSum += year.semesters.second.gpa; attendanceSum += year.semesters.second.attendanceRate; }
    });
    return {
      lifetimeGPA: (gpaSum / totalSemesters).toFixed(2),
      lifetimeAttendance: (attendanceSum / totalSemesters).toFixed(1),
      totalYears: academicHistory.length,
    };
  }, [academicHistory]);

  const toggleGradeSheet = (sheetId: string) => {
    setExpandedSheets((prev) => ({ ...prev, [sheetId]: !prev[sheetId] }));
  };

  const getDistinctionColors = (status: DistinctionType) => {
    switch (status) {
      case 'With Distinction': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Passed': return 'bg-green-50 text-green-700 border-green-200';
      case 'Failed': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-green-50/30 p-4 sm:p-6 lg:p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* WEB HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 rounded-2xl shadow-sm border border-green-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                Student Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Semester Overview
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Currently viewing: <span className="font-semibold text-gray-700">{currentUser?.userName || 'Active Student'}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {canViewAllStudents && (
              <>
                <select aria-label="Select Class" className="bg-white border border-green-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none w-full sm:w-auto">
                  <option>Class: {activeYearData.className}</option>
                </select>
                <select aria-label="Select Student" className="bg-white border border-green-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none w-full sm:w-auto">
                  <option>Student: {currentUser?.userName || 'Active Student'}</option>
                  <option>Student: John Doe</option>
                </select>
              </>
            )}

            {isAdmin && (
              <button 
                onClick={() => toPDF()}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap self-stretch sm:self-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate PDF
              </button>
            )}
          </div>
        </header>

        {/* WEB STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'GPA', value: lifetimeGPA },
            { label: 'Attendance', value: `${lifetimeAttendance}%` },
            { label: 'Years', value: totalYears },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-green-100">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* WEB NAVIGATION */}
        <nav className="flex space-x-1 border-b border-green-200 overflow-x-auto pb-px">
          {academicHistory.map((year) => (
            <button
              key={year.id}
              onClick={() => setActiveYearId(year.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap outline-none ${
                activeYearId === year.id ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-gray-500 hover:text-emerald-600'
              }`}
            >
              Year {year.yearName}
            </button>
          ))}
        </nav>

        {/* WEB SEMESTER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {activeYearData.semesters.first && renderSemesterCard(activeYearData.semesters.first, "1st Semester", `${activeYearId}-sem1`)}
          {activeYearData.semesters.second && renderSemesterCard(activeYearData.semesters.second, "2nd Semester", `${activeYearId}-sem2`)}
        </div>

        {/* ============================================================ */}
        {/* HIDDEN PRINTABLE PDF TEMPLATE (Plain Paper Design) */}
        {/* ============================================================ */}
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <div ref={targetRef} className="bg-white p-12 text-black w-[794px] font-sans">
             <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold uppercase tracking-tight">Official Academic Report</h1>
                  <p className="text-gray-600 text-sm">Issued by the Academic Registry</p>
                </div>
                <div className="text-right text-sm space-y-0.5">
                  <p><strong>Student:</strong> {currentUser?.userName || 'N/A'}</p>
                  <p><strong>Class:</strong> {activeYearData.className}</p>
                  <p><strong>Academic Year:</strong> {activeYearData.yearName}</p>
                </div>
             </div>

             <div className="space-y-10">
                {/* Semester 1 Table */}
                <div>
                  <h2 className="text-base font-bold border-b border-gray-400 pb-1 mb-2">1st Semester Results</h2>
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-300 text-gray-600">
                        <th className="py-2 font-semibold">Subject</th>
                        <th className="py-2 text-right font-semibold">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeYearData.semesters.first.grades.map((g, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="py-2 text-gray-800">{g.subject}</td>
                          <td className="py-2 text-right font-bold">{g.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-xs grid grid-cols-3 bg-gray-50 p-3 rounded border border-gray-200">
                    <p><strong>GPA:</strong> {activeYearData.semesters.first.gpa.toFixed(2)}</p>
                    <p><strong>Attendance:</strong> {activeYearData.semesters.first.attendanceRate}%</p>
                    <p><strong>Status:</strong> {activeYearData.semesters.first.distinction}</p>
                  </div>
                </div>

                {/* Semester 2 Table (If exists) */}
                {hasSecondSemester && activeYearData.semesters.second && (
                   <div>
                   <h2 className="text-base font-bold border-b border-gray-400 pb-1 mb-2">2nd Semester Results</h2>
                   <table className="w-full text-left text-sm border-collapse">
                     <thead>
                       <tr className="border-b border-gray-300 text-gray-600">
                         <th className="py-2 font-semibold">Subject</th>
                         <th className="py-2 text-right font-semibold">Grade</th>
                       </tr>
                     </thead>
                     <tbody>
                       {activeYearData.semesters.second.grades.map((g, i) => (
                         <tr key={i} className="border-b border-gray-100">
                           <td className="py-2 text-gray-800">{g.subject}</td>
                           <td className="py-2 text-right font-bold">{g.grade}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                   <div className="mt-4 text-xs grid grid-cols-3 bg-gray-50 p-3 rounded border border-gray-200">
                     <p><strong>GPA:</strong> {activeYearData.semesters.second.gpa.toFixed(2)}</p>
                     <p><strong>Attendance:</strong> {activeYearData.semesters.second.attendanceRate}%</p>
                     <p><strong>Status:</strong> {activeYearData.semesters.second.distinction}</p>
                   </div>
                 </div>
                )}
             </div>

             {/* Signatures & Seal footprint */}
             <div className="mt-24 flex justify-between border-t border-gray-200 pt-8 text-xs">
                <div>
                  <p className="font-bold text-gray-700">Official Certification Seal</p>
                  <div className="w-24 h-24 border border-dashed border-gray-300 mt-2 flex items-center justify-center text-gray-400 italic rounded">Stamp Area</div>
                </div>
                <div className="text-right">
                  <p className="mt-12 border-t border-gray-400 pt-2 w-48 inline-block font-medium">Registrar Signature</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );

  // --- WEB CARD SUB-COMPONENT ---
  function renderSemesterCard(semData: SemesterData, title: string, sheetId: string) {
    const isExpanded = expandedSheets[sheetId] || false;
    return (
      <article className="bg-white rounded-2xl shadow-sm border border-green-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-green-50 flex justify-between items-start">
          <div><h2 className="text-lg font-bold text-gray-900">{title}</h2><p className="text-sm text-gray-500">Evaluation</p></div>
          <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border ${getDistinctionColors(semData.distinction)}`}>{semData.distinction}</span>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4 bg-green-50/30">
          <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm"><span className="text-[11px] font-semibold text-green-600 block">Avg</span><span className="text-2xl font-bold">{semData.gpa.toFixed(2)}</span></div>
          <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm"><span className="text-[11px] font-semibold text-green-600 block">Attendance</span><span className="text-2xl font-bold text-emerald-600">{semData.attendanceRate}%</span></div>
        </div>
        <div className="mt-auto border-t border-green-50">
          <button onClick={() => toggleGradeSheet(sheetId)} className="w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-green-50/50 transition-colors outline-none"><span className="text-sm font-semibold text-gray-700">Detailed Grade Sheet</span><svg className={`w-5 h-5 text-green-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></button>
          <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <table className="w-full text-left text-sm"><thead className="bg-green-50/50 border-y border-green-100"><tr><th className="px-6 py-3">Subject</th><th className="px-6 py-3 text-right">Grade</th></tr></thead>
              <tbody className="divide-y divide-green-50">{semData.grades.map((g, idx) => (<tr key={idx} className="hover:bg-green-50/30 transition-colors"><td className="px-6 py-3 text-gray-700">{g.subject}</td><td className="px-6 py-3 text-right"><span className="font-bold">{g.grade}</span></td></tr>))}</tbody>
            </table>
          </div>
        </div>
      </article>
    );
  }
};

export default SemesterPage;