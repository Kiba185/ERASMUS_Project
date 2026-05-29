import React, {useState} from 'react';



const GradesPage: React.FC = () => {
  // 1. FIKTIVNÍ DATA (MOCK DATA) - až zapojíš databázi, tohle pole smažeš
  const mockGrades = [
    { id: '1', subject: 'Mathematics', value: '1', weight: 10, date: '25. 05. 2026', topic: 'Geometry - Pythagorean theorem' },
    { id: '2', subject: 'Czech Language', value: '2-', weight: 5, date: '22. 05. 2026', topic: 'Dictation - adjective spelling' },
    { id: '3', subject: 'English Language', value: '1', weight: 3, date: '20. 05. 2026', topic: 'Vocabulary - Unit 5' },
    { id: '4', subject: 'Mathematics', value: '3', weight: 8, date: '15. 05. 2026', topic: 'Pop quiz - fractions' },
    { id: '5', subject: 'Physics', value: '5', weight: 10, date: '12. 05. 2026', topic: 'Test - Optics' },
    { id: '6', subject: 'Czech Language', value: '4', weight: 2, date: '10. 05. 2026', topic: 'Reading journal' },
  ];

  // 2. REAKTOVÉ STAVY A LOGIKA FILTROVÁNÍ
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Automaticky vytáhne unikátní předměty z našich fiktivních dat pro dropdown
  const subjects = ['All', ...Array.from(new Set(mockGrades.map(g => g.subject)))];

  // Filtruje známky podle vybraného dropdownu
  const filteredGrades = selectedSubject === 'All' 
    ? mockGrades 
    : mockGrades.filter(g => g.subject === selectedSubject);

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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.174a2.25 2.25 0 0 0-1.042 3.477 2.25 2.25 0 0 0 2.51.536l.094-.047m12.44-3.966a2.25 2.25 0 0 0 1.042 3.477 2.25 2.25 0 0 0-2.51.536l-.094.047m-9.656-.533a2.25 2.25 0 0 0-2.251 2.255v1.322c0 .984.662 1.847 1.63 2.007L12 21.75l5.523-1.002A1.986 1.986 0 0 0 19.125 18.74v-1.322A2.25 2.25 0 0 0 16.875 15.16M12 4.5l8.25 3-8.25 3-8.25-3 8.25-3Z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Overall Average</p>
                        <p className="text-2xl font-bold text-gray-800">1.67</p>
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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a1.194 1.194 0 0 0 1.586.006L21.75 6.75m0 0V12m0-5.25H16.5" /></svg>
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
                                <td className="py-4 px-6 font-semibold text-gray-900">{grade.subject}</td>
                                <td className="py-4 px-6 text-center">
                                <span className={`inline-block w-9 h-9 text-center leading-9 rounded-full font-bold border shadow-sm text-base ${getGradeBadgeColor(grade.value)}`}>
                                    {grade.value}
                                </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-medium border border-gray-200">{grade.weight}</span>
                                </td>
                                <td className="py-4 px-6 text-gray-500 whitespace-nowrap">{grade.date}</td>
                                <td className="py-4 px-6 text-gray-600 max-w-xs md:max-w-md truncate" title={grade.topic}>{grade.topic}</td>
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
