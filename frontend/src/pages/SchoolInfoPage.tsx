import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// --- TYPES ---
type SchoolData = {
  schoolName: string;
  registrationId: string;
  principal: string;
  street: string;
  city: string;
  zipCode: string;
  email: string;
  phone: string;
  website: string;
};

const SchoolInfoPage: React.FC = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin';

  // --- STATE ---
  const [isSaving, setIsSaving] = useState(false);
  const [schoolData, setSchoolData] = useState<SchoolData>({
    schoolName: 'John Amos Comenius Grammar School',
    registrationId: '12345678',
    principal: 'John Doe, M.A.',
    street: 'School Street 123',
    city: 'Prague 1',
    zipCode: '110 00',
    email: 'office@gjak.cz',
    phone: '+420 123 456 789',
    website: 'https://www.gjak.cz',
  });

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSchoolData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // API call to save data would go here
    setTimeout(() => {
      setIsSaving(false);
      alert('School information has been successfully saved.');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-green-50/30 p-4 sm:p-6 lg:p-8 font-sans text-gray-900 break-words">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* WEB HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 rounded-2xl shadow-sm border border-green-100">
          <div className="w-full md:max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                Administration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 truncate">
              School Information
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Edit basic information, address, and contact details.
            </p>
          </div>

          <div className="flex w-full md:w-auto shrink-0 flex-col items-end gap-3">
            {!canEdit && (
              <div>
                
              </div>
            )}
            {canEdit && (
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-black text-white shadow-soft transition focus:outline-none focus:ring-2 focus:ring-palette-leaf/30x ${
                  isSaving ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </header>

        {/* SETTINGS FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Basic Information */}
          <article className="bg-white rounded-2xl shadow-sm border border-green-100 flex flex-col overflow-hidden md:col-span-2">
            <div className="p-6 border-b border-green-50">
              <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
              <p className="text-sm text-gray-500">Official name and school leadership</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-green-50/10 flex-1">
              {/* Max 250 chars for school name covers even extreme international or combined names */}
              {renderInput('schoolName', 'School Name', schoolData.schoolName, handleChange, 250, 'text', 'md:col-span-2 lg:col-span-1', !canEdit)}
              {renderInput('registrationId', 'Registration ID', schoolData.registrationId, handleChange, 30, 'text', '', !canEdit)}
              {renderInput('principal', 'Principal', schoolData.principal, handleChange, 150, 'text', '', !canEdit)}
            </div>
          </article>

          {/* Address */}
          <article className="bg-white rounded-2xl shadow-sm border border-green-100 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-green-50">
              <h2 className="text-lg font-bold text-gray-900">Address</h2>
              <p className="text-sm text-gray-500">Educational institution headquarters</p>
            </div>
            <div className="p-6 space-y-4 bg-green-50/10 flex-1 flex flex-col justify-between">
              {renderInput('street', 'Street Address', schoolData.street, handleChange, 150, 'text', '', !canEdit)}
              <div className="grid grid-cols-2 gap-4">
                {renderInput('city', 'City', schoolData.city, handleChange, 100, 'text', '', !canEdit)}
                {renderInput('zipCode', 'ZIP / Postal Code', schoolData.zipCode, handleChange, 20, 'text', '', !canEdit)}
              </div>
            </div>
          </article>

          {/* Contact Details */}
          <article className="bg-white rounded-2xl shadow-sm border border-green-100 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-green-50">
              <h2 className="text-lg font-bold text-gray-900">Contact</h2>
              <p className="text-sm text-gray-500">Public and communication details</p>
            </div>
            <div className="p-6 space-y-4 bg-green-50/10 flex-1 flex flex-col justify-between">
              {renderInput('email', 'Official Email', schoolData.email, handleChange, 100, 'email', '', !canEdit)}
              {renderInput('phone', 'Phone Number', schoolData.phone, handleChange, 30, 'tel', '', !canEdit)}
              {renderInput('website', 'Website', schoolData.website, handleChange, 200, 'url', '', !canEdit)}
            </div>
          </article>

        </div>
      </div>
    </div>
  );

  // --- HELPER COMPONENT FOR INPUTS ---
  function renderInput(
    name: string,
    label: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    maxLength: number,
    type: string = 'text',
    className: string = '',
    disabled: boolean = false
  ) {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        <label htmlFor={name} className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex justify-between gap-2">
          <span>{label}</span>
          {!disabled && (
            <span className="text-[10px] text-gray-400 font-normal normal-case">Max {maxLength}</span>
          )}
        </label>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          disabled={disabled}
          className={`bg-white border border-green-200 text-gray-900 text-sm rounded-lg p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow w-full shadow-sm ${disabled ? 'bg-slate-100 cursor-default text-slate-500' : ''}`}
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      </div>
    );
  }
};

export default SchoolInfoPage;