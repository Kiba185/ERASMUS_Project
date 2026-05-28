import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const UserPage: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    // State pro data uživatelského profilu
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        userName: '',
    });

    // State pro změnu hesla
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                userName: user.userName || '',
            });
        }
    }, [user]);

    if (!user) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-700">Uživatel nenalezen</h1>
                <p className="text-gray-500">Pro zobrazení profilu se prosím přihlaste.</p>
            </div>
        );
    }

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // V reálné aplikaci by zde byl API call pro uložení dat
        console.log('Ukládání profilu:', formData);
        setMessage({ type: 'success', text: 'Profil byl úspěšně aktualizován!' });
        setIsEditing(false);
        // Zde by se také aktualizoval user v AuthContextu
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Nová hesla se neshodují.' });
            return;
        }
        // V reálné aplikaci by zde byl API call pro změnu hesla
        console.log('Změna hesla pro uživatele:', user.id);
        setMessage({ type: 'success', text: 'Heslo bylo úspěšně změněno!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const UserInfoRow: React.FC<{ label: string; value: string | undefined; name?: keyof typeof formData; isEditing?: boolean }> = ({ label, value, name, isEditing: editing }) => (
        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 px-4">
            <dt className="text-sm font-medium text-gray-500 self-center">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editing && name ? (
                    <input
                        type="text"
                        name={name}
                        value={formData[name]}
                        onChange={handleFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                ) : (
                    <span className="font-medium">{value || '-'}</span>
                )}
            </dd>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-palette-pine">Uživatelský profil</h1>

            {message && (
                <div className={`p-4 mb-4 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* --- Sekce s informacemi o profilu --- */}
            <div className="bg-white shadow-soft overflow-hidden sm:rounded-lg border border-palette-lichen/30">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Informace o uživateli</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Osobní údaje a informace o účtu.</p>
                    </div>
                    {isAdmin && !isEditing && (
                        <button onClick={() => { setIsEditing(true); setMessage(null); }} className="px-4 py-2 bg-palette-pine text-white rounded-md hover:bg-palette-fern transition shadow-sm">
                            Upravit profil
                        </button>
                    )}
                </div>
                <form onSubmit={handleProfileSubmit}>
                    <div className="border-t border-gray-200">
                        <dl className="divide-y divide-gray-200">
                            <UserInfoRow label="Jméno" value={formData.firstName} name="firstName" isEditing={isEditing} />
                            <UserInfoRow label="Příjmení" value={formData.lastName} name="lastName" isEditing={isEditing} />
                            <UserInfoRow label="Uživatelské jméno" value={formData.userName} name="userName" isEditing={isEditing} />
                            <UserInfoRow label="Role" value={user.role} />
                            <UserInfoRow label="ID uživatele" value={user.id} />
                        </dl>
                    </div>
                    {isEditing && (
                        <div className="px-4 py-4 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
                            <button onClick={() => { setIsEditing(false); setMessage(null); }} type="button" className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition font-semibold">
                                Zrušit
                            </button>
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-semibold">
                                Uložit změny
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* --- Sekce pro změnu hesla --- */}
            <div className="bg-white shadow-soft overflow-hidden sm:rounded-lg border border-palette-lichen/30">
                <form onSubmit={handlePasswordSubmit}>
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Změna hesla</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Pro vyšší bezpečnost doporučujeme heslo pravidelně měnit.</p>
                    </div>
                    <div className="border-t border-gray-200 p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Současné heslo</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nové heslo</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Potvrďte nové heslo</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="px-4 py-4 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
                        <button type="submit" className="px-4 py-2 bg-palette-pine text-white rounded-md hover:bg-palette-fern transition font-semibold">
                            Změnit heslo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default UserPage;
