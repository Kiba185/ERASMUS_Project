import React, { useEffect, useState } from 'react';

type Grade = { id: string; gColumnId: string; userId: string; grade: string, subjectName: string; subjectId: number; date: string; gColumnName?: string; weight?: number };

const GradesPage: React.FC = () => {
    //DOMINIK JE CERNY

    const [grades, setGrades] = useState<Grade[]>([]);

    useEffect(() => {
        const loadGrades = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/mygrades', {
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
                    grade: toDisplayGrade(g.grade), // 👈 convert 3.5 → "3-" on load
                    subjectName: g.subjectName,
                    subjectId: g.subjectId,
                    date: g.date,
                    gColumnName: g.gColumnName,
                    weight: g.weight
                }));
                setGrades(mapped);
            } catch (error) {
                console.error(error);
            }
        };

        loadGrades();
    }, []);

    // 2. REAKTOVÉ STAVY A LOGIKA FILTROVÁNÍ
    const [selectedSubject, setSelectedSubject] = useState('All');

    const subjects = ['All', ...Array.from(new Set(grades.map(g => g.subjectName)))];

    // Filtruje známky podle vybraného dropdownu
    const filteredGrades = selectedSubject === 'All'
        ? grades
        : grades.filter(g => g.subjectName === selectedSubject);

    // 3. POMOCNÁ FUNKCE PRO DYNAMICKÉ BARVY KOLEČEK SE ZNÁMKAMI
    const getGradeBadgeColor = (gradeValue: string) => {
        const mainGrade = gradeValue[0]; // Ošetří případy jako "2-" (vezme jen "2")
        switch (mainGrade) {
            case '1': return 'bg-green-600 text-white border-green-700 font-bold';   // Bez problému (Sytá zelená)
            case '2': return 'bg-lime-600 text-white border-lime-700 font-bold';     // Chvalitebně (Sytá azurová/modrá)
            case '3': return 'bg-amber-500 text-white border-amber-600 font-bold';   // Pozor (Jasná žlutá/oranžová)
            case '4': return 'bg-orange-600 text-white border-orange-700 font-bold'; // Velké varování (Sytá oranžová)
            case '5': return 'bg-red-600 text-white border-red-700 font-black'; // Kritické (Ostrá červená, můžeš nechat i blikání 'animate-pulse')
            default: return 'bg-gray-500 text-white border-gray-600';
        }
    };

    //Calculate overall average for the currently filtered grades with weights and minuses taken into account
    const overallAverage = filteredGrades.reduce((acc, grade) => {
        let numericGrade = parseFloat(grade.grade.replace('-', '.5'));
        if (isNaN(numericGrade)) return acc; // skip if grade is not a number
        const weight = grade.weight || 1;
        return acc + numericGrade * weight;
    }, 0) / filteredGrades.reduce((acc, grade) => acc + (grade.weight || 1), 0);


    return (
        <div className="p-8">

            <div className="p-6 max-w-7xl mx-auto">

                {/* HLAVIČKA STRÁNKY A FILTR */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Grades Overview</h1>
                        <p className="text-gray-500 mt-1">Continuous assessment for the current period</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="subject-filter" className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                            Filter by subject:
                        </label>
                        <select
                            id="subject-filter"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="p-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium focus:ring-2 focus:ring-green-500 outline-none shadow-sm transition"
                        >
                            {subjects.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* STATISTICKÉ KARTIČKY */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    {/* Průměr */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <span className="material-symbols-outlined">school</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Overall Average</p>
                            <p className="text-2xl font-bold text-gray-800">{overallAverage.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Počet známek */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Number of Grades</p>
                            <p className="text-2xl font-bold text-gray-800">{filteredGrades.length}</p>
                        </div>
                    </div>

                    {/* Vybraný filtr */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                            <span className="material-symbols-outlined">filter_alt</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Filter</p>
                            <p className="text-lg font-bold text-gray-800 truncate">{selectedSubject}</p>
                        </div>
                    </div>
                </div>

                {/* TABULKA SE ZNÁMKAMI */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {filteredGrades.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No grades found for the subject "{selectedSubject}".
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-600">
                                        <th className="py-4 px-6">Subject</th>
                                        <th className="py-4 px-6 text-center">Grade</th>
                                        <th className="py-4 px-6 text-center">Weight</th>
                                        <th className="py-4 px-6">Date</th>
                                        <th className="py-4 px-6">Topic / Note</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                    {filteredGrades.map((grade) => (
                                        <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6 font-semibold text-gray-900">{grade.subjectName}</td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-block w-9 h-9 text-center leading-9 rounded-full font-bold border shadow-sm text-base ${getGradeBadgeColor(grade.grade)}`}>
                                                    {grade.grade}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-medium border border-gray-200">{grade.weight}</span>
                                            </td>
                                            <td className="py-4 px-6 text-gray-500 whitespace-nowrap">{new Date(grade.date).toLocaleDateString()}</td>
                                            <td className="py-4 px-6 text-gray-600 max-w-xs md:max-w-md truncate" title={grade.gColumnName}>
                                                {grade.gColumnName || 'No topic/note'} {/* Zobrazí název sloupce známky, nebo "No topic/note" pokud není k dispozici */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default GradesPage;
