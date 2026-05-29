import React from 'react';

const AbsenceNotesPage: React.FC = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-center">Absence notes</h1>
            <p className="text-gray-600 text-center">Start by sending a new absence note.</p>
            <p className="text-gray-600 text-center text-sm font-bold" style={{ fontSize: '24px' }}>
                Number of unexcused absences: 0
            </p>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    </div>
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                        <p className="text-gray-600">You have no absence notes yet.</p>
                    </div>
                </div>  
        </div>
    );
};
export default AbsenceNotesPage;
