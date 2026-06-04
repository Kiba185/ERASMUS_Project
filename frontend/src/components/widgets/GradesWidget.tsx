import API_URL from '../../config/config.tsx';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

type Grade = { id: string; gColumnId: string; userId: string; grade: string, subjectName: string; subjectId: number; date: string; gColumnName?: string; weight?: number };

const GradesWidget: React.FC = () => {
    const navigate = useNavigate();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGrades = async () => {
            try {
                const response = await fetch(`${API_URL}/api/mygrades`, {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) throw new Error(`Failed to load grades: ${response.statusText}`);

                const toDisplayGrade = (val: number): string => {
                    val = parseFloat(val.toString());
                    if (val === 1.5) return '1-';
                    if (val === 2.5) return '2-';
                    if (val === 3.5) return '3-';
                    if (val === 4.5) return '4-';
                    return String(Math.round(val));
                };

                const data = await response.json();
                const mapped: Grade[] = data.map((g: any) => ({
                    id: String(g.id),
                    gColumnId: String(g.gColumnId),
                    userId: String(g.userId),
                    grade: toDisplayGrade(g.grade),
                    subjectName: g.subjectName,
                    subjectId: g.subjectId,
                    date: g.date,
                    gColumnName: g.gColumnName,
                    weight: g.weight
                }));
                setGrades(mapped);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadGrades();
    }, []);

    const getGradeBadgeColor = (gradeValue: string) => {
        const mainGrade = gradeValue[0];
        switch (mainGrade) {
            case '1': return 'bg-green-600 text-white border-green-700 font-bold';
            case '2': return 'bg-lime-600 text-white border-lime-700 font-bold';
            case '3': return 'bg-amber-500 text-white border-amber-600 font-bold';
            case '4': return 'bg-orange-600 text-white border-orange-700 font-bold';
            case '5': return 'bg-red-600 text-white border-red-700 font-black';
            default:  return 'bg-gray-500 text-white border-gray-600';
        }
    };

    const newestGrades = grades.slice(0, 3); // ✅ fixed

    return (
        <div
            onClick={() => navigate('/grades')}
            className="bg-white p-6 rounded-2xl shadow-soft border border-palette-mist hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
        >
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-palette-pine flex items-center gap-2">
                    <svg className="w-6 h-6 text-palette-fern" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recent Grades
                </h2>
            </div>

            <ul className="space-y-3 flex-1">
                {loading ? (
                    // Loading state
                    <li className="flex flex-col items-center justify-center py-6 gap-3 text-palette-moss">
                        <svg
                            className="w-7 h-7 animate-spin text-palette-fern"
                            fill="none" viewBox="0 0 24 24"
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span className="text-sm font-semibold text-palette-moss">Loading grades...</span>
                    </li>
                ) : newestGrades.length === 0 ? (
                    <li className="text-center text-gray-400 py-4">No grades yet.</li>
                ) : (
                    newestGrades.map(grade => (
                        <li key={grade.id} className="flex justify-between items-center bg-gray-50 hover:bg-palette-mist p-3 rounded-xl border border-gray-100 transition-colors">
                            <div className="flex flex-col">
                                <span className="font-bold text-palette-pine text-[15px]">{grade.subjectName}</span>
                                {grade.gColumnName && (
                                    <span className="text-xs text-gray-400">{grade.gColumnName}</span>
                                )}
                            </div>
                            <span className={`w-9 h-9 rounded-full flex items-center justify-center border shadow-sm text-sm ${getGradeBadgeColor(grade.grade)}`}>
                                {grade.grade}
                            </span>
                        </li>
                    ))
                )}
            </ul>

            <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-palette-fern font-bold group-hover:text-palette-leaf flex justify-between items-center transition-colors">
                View All Grades <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
        </div>
    );
};

export default GradesWidget;