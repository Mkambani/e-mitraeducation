import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { Profile } from '../../types';
import { Database } from '../../database.types';

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false, nullsFirst: false });

            if (error) throw error;
            setUsers((data as unknown as Profile[]) || []);
        } catch (err: any) {
            setError(`Failed to load users: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleCodToggle = async (userId: string, currentStatus: boolean) => {
        // Optimistically update UI
        setUsers(users.map(u => u.id === userId ? { ...u, cod_enabled: !currentStatus } : u));
        
        const payload = { cod_enabled: !currentStatus };
        const { error } = await supabase
            .from('profiles')
            .update(payload)
            .eq('id', userId);
        
        if (error) {
            // Revert UI on error
            setUsers(users.map(u => u.id === userId ? { ...u, cod_enabled: currentStatus } : u));
            setError(`Failed to update user ${userId}: ${error.message}`);
        }
    };

    return (
        <div className="bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border">
            {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg mb-4">{error}</p>}

            <div className="overflow-x-auto">
                {loading ? (
                    <p className="p-6 text-center text-admin-light">Loading users...</p>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="text-admin-light">
                            <tr>
                                <th className="p-4 font-semibold">User</th>
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold text-center">COD Enabled</th>
                                <th className="p-4 font-semibold">Mobile</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-card-border">
                            {users.length === 0 ? (
                                <tr><td colSpan={4} className="p-6 text-center text-admin-light/70">No users found.</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-admin-main-bg transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-admin-heading">{user.full_name || 'N/A'}</div>
                                            <div className="text-admin-light">{user.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${user.role === 'admin' ? 'bg-admin-purple/20 text-admin-purple' : 'bg-admin-light/20 text-admin-light'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                             <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={user.cod_enabled}
                                                    onChange={() => handleCodToggle(user.id, user.cod_enabled)}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-11 h-6 bg-admin-main-bg peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-admin-accent/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-admin-accent"></div>
                                            </label>
                                        </td>
                                        <td className="p-4 text-admin-light font-mono">{user.mobile_number || 'N/A'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminUsersPage;
