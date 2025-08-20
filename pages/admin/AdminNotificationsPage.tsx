import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { Notification } from '../../types';
import { Database } from '../../database.types';

type SentNotification = Pick<Notification, "message" | "link" | "created_at">;

const AdminNotificationsPage: React.FC = () => {
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [sentHistory, setSentHistory] = useState<SentNotification[]>([]);

    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        try {
            // This query fetches the most recent notification for each unique message content.
            // It's a common pattern but requires some SQL knowledge.
            // For simplicity here, we'll fetch recent notifications and de-duplicate client-side.
            const { data, error } = await supabase
                .from('notifications')
                .select('message, link, created_at')
                .order('created_at', { ascending: false })
                .limit(100); // Limit to a reasonable number to process
            
            if (error) throw error;

            // De-duplicate based on the message content
            const uniqueMessages = new Map<string, SentNotification>();
            ((data as unknown as SentNotification[]) || []).forEach((notif) => {
                if (!uniqueMessages.has(notif.message)) {
                    uniqueMessages.set(notif.message, notif);
                }
            });

            setSentHistory(Array.from(uniqueMessages.values()));
        } catch (err: any) {
            setError('Could not fetch notification history.');
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            setError("Message cannot be empty.");
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // 1. Get all user IDs
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('id');

            if (profileError) throw profileError;
            if (!profiles || profiles.length === 0) {
                throw new Error("No users found to send notifications to.");
            }

            // 2. Prepare notifications for batch insert
            const notificationsToInsert = (profiles as { id: string }[]).map(profile => ({
                user_id: profile.id,
                message: message.trim(),
                link: link.trim() || '/profile'
            }));

            // 3. Batch insert
            const { error: insertError } = await supabase
                .from('notifications')
                .insert(notificationsToInsert);

            if (insertError) throw insertError;

            setSuccessMessage(`Notification sent successfully to ${profiles.length} users.`);
            setMessage('');
            setLink('');
            fetchHistory(); // Refresh history

        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Form Section */}
            <div className="bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border">
                <h2 className="text-xl font-bold text-admin-heading">Broadcast a New Notification</h2>
                <p className="text-admin-light/80 mt-1 mb-6">Send a notification to all registered users.</p>
                <form onSubmit={handleSendNotification} className="space-y-6 border-t border-admin-card-border pt-6">
                    <div>
                        <label htmlFor="notif-message" className="block text-base font-semibold text-admin-heading mb-2">
                            Message <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            id="notif-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="e.g., Scheduled maintenance this weekend. Services may be unavailable."
                            required
                            className="w-full p-3 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg min-h-[100px] focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="notif-link" className="block text-base font-semibold text-admin-heading mb-2">
                            Link (Optional)
                        </label>
                        <p className="text-sm text-admin-light/80 mb-2">
                            An internal path for the user to navigate to (e.g., <code className="bg-admin-main-bg px-1.5 py-0.5 rounded-sm">/services</code>). Defaults to <code className="bg-admin-main-bg px-1.5 py-0.5 rounded-sm">/profile</code> if empty.
                        </p>
                        <input
                            id="notif-link"
                            type="text"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="/profile"
                            className="w-full p-3 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-4 border-t border-admin-card-border pt-6">
                        {successMessage && <p className="text-sm font-medium text-green-400 flex-1">{successMessage}</p>}
                        {error && <p className="text-sm font-medium text-red-400 flex-1">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-admin-accent rounded-lg shadow-sm hover:bg-admin-accent/90 disabled:bg-slate-400 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                            {loading ? 'Sending...' : 'Send to All Users'}
                        </button>
                    </div>
                </form>
            </div>


            {/* History Section */}
            <div className="bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border">
                 <h2 className="text-xl font-bold text-admin-heading mb-4">Sent History</h2>
                 <div className="space-y-4">
                    {historyLoading ? (
                        <p className="text-center p-4 text-admin-light">Loading history...</p>
                    ) : sentHistory.length === 0 ? (
                        <p className="text-center p-4 text-admin-light/70">No broadcast notifications have been sent yet.</p>
                    ) : (
                        sentHistory.map((notif, index) => (
                            <div key={index} className="p-4 bg-admin-main-bg border border-admin-card-border rounded-lg">
                                <p className="font-semibold text-admin-heading">{notif.message}</p>
                                <div className="flex justify-between items-center mt-2 text-xs">
                                    <span className="text-admin-light/60">Sent on: {new Date(notif.created_at).toLocaleString()}</span>
                                    <span className="text-admin-light/60">Link: <code className="font-mono bg-admin-card-bg px-1.5 py-0.5 rounded-sm">{notif.link}</code></span>
                                </div>
                            </div>
                        ))
                    )}
                 </div>
            </div>

        </div>
    );
};

export default AdminNotificationsPage;
