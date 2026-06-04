import API_URL from '../config/config.tsx';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserInfoRowProps {
    label: string;
    value: string | undefined;
    name?: string;
    isEditing?: boolean;
    inputValue?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}

const UserInfoRow: React.FC<UserInfoRowProps> = ({
    label, value, name, isEditing, inputValue, onChange, type = 'text',
}) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 px-4">
        <dt className="text-sm font-medium text-gray-500 self-center">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {isEditing && name && onChange ? (
                <input
                    type={type}
                    name={name}
                    value={inputValue || ''}
                    onChange={onChange}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
            ) : (
                <span className="font-medium">{value || '-'}</span>
            )}
        </dd>
    </div>
);

const UserPage: React.FC = () => {
    const { user, logout, login } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin';

    const handleLogout = () => { logout(); navigate('/login'); };

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '',
        birthday: '', phone: '', adress: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '', newPassword: '', confirmPassword: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                birthday: user.birthday ? user.birthday.split('T')[0] : '',
                phone: user.phone || '',
                adress: user.adress || '',
            });
        }
    }, [user]);

    if (!user) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-700">User not found</h1>
                <p className="text-gray-500">Please log in to view your profile.</p>
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

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setSavingProfile(true);
        try {
            const res = await fetch(`${API_URL}/api/profile/me`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    birthday: formData.birthday ? new Date(formData.birthday).toISOString() : null
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update profile');

            login(String(user.id), { ...user, ...data.user });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        setSavingPassword(true);
        try {
            const res = await fetch(`${API_URL}/api/profile/password`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to change password');

            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSavingPassword(false);
        }
    };

    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-palette-pine">User Profile</h1>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-50 text-red-600 font-bold border-2 border-red-400 rounded-lg shadow-sm hover:bg-red-100 hover:border-red-500 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* --- Profile Information Section --- */}
            <div className="bg-white shadow-soft overflow-hidden sm:rounded-lg border border-palette-lichen/30">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">User Information</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and account information.</p>
                    </div>
                    {isAdmin && !isEditing && (
                        <button
                            onClick={() => { setIsEditing(true); setMessage(null); }}
                            className="px-4 py-2 bg-palette-pine text-white rounded-md hover:bg-palette-fern transition shadow-sm"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
                <form onSubmit={handleProfileSubmit}>
                    <div className="border-t border-gray-200">
                        <dl className="divide-y divide-gray-200">
                            <UserInfoRow label="First Name"    value={formData.firstName} name="firstName" isEditing={isEditing} inputValue={formData.firstName} onChange={handleFormChange} />
                            <UserInfoRow label="Last Name"     value={formData.lastName}  name="lastName"  isEditing={isEditing} inputValue={formData.lastName}  onChange={handleFormChange} />
                            <UserInfoRow label="Email Address" value={formData.email}     name="email"     isEditing={isEditing} inputValue={formData.email}     onChange={handleFormChange} type="email" />
                            <UserInfoRow label="Date of Birth" value={formatDisplayDate(formData.birthday)} name="birthday" isEditing={isEditing} inputValue={formData.birthday} onChange={handleFormChange} type="date" />
                            <UserInfoRow label="Phone Number"  value={formData.phone}     name="phone"     isEditing={isEditing} inputValue={formData.phone}     onChange={handleFormChange} type="tel" />
                            <UserInfoRow label="Address"       value={formData.adress}    name="adress"    isEditing={isEditing} inputValue={formData.adress}    onChange={handleFormChange} />
                            <UserInfoRow label="Role"    value={user.role} />
                            <UserInfoRow label="User ID" value={user.id} />
                        </dl>
                    </div>
                    {isEditing && (
                        <div className="px-4 py-4 bg-gray-50 text-right sm:px-6 border-t border-gray-200 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => { setIsEditing(false); setMessage(null); }}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={savingProfile}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-semibold disabled:opacity-60 flex items-center gap-2"
                            >
                                {savingProfile && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* --- Password Change Section --- */}
            <div className="bg-white shadow-soft overflow-hidden sm:rounded-lg border border-palette-lichen/30">
                <form onSubmit={handlePasswordSubmit}>
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Change Password</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">For better security, we recommend changing your password regularly.</p>
                    </div>
                    <div className="border-t border-gray-200 p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <input
                                type="password" name="currentPassword" value={passwordData.currentPassword}
                                onChange={handlePasswordChange} required
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password" name="newPassword" value={passwordData.newPassword}
                                onChange={handlePasswordChange} required
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                                type="password" name="confirmPassword" value={passwordData.confirmPassword}
                                onChange={handlePasswordChange} required
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>
                    <div className="px-4 py-4 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={savingPassword}
                            className="px-4 py-2 bg-palette-pine text-white rounded-md hover:bg-palette-fern transition font-semibold disabled:opacity-60 flex items-center gap-2 ml-auto"
                        >
                            {savingPassword && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            Change Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserPage;