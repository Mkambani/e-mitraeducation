import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

interface ContactMessage {
    id: number;
    full_name: string;
    email: string;
    subject: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

const AdminMessagesPage: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (err: any) {
            setError(`Failed to load messages: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);
    
    const handleToggleRead = async (message: ContactMessage) => {
        const newStatus = !message.is_read;
        setMessages(messages.map(m => m.id === message.id ? { ...m, is_read: newStatus } : m));
        
        const { error } = await supabase
            .from('contact_messages')
            .update({ is_read: newStatus })
            .eq('id', message.id);
        
        if (error) {
            setError(`Failed to update message status: ${error.message}`);
            fetchMessages(); // Revert on error
        }
    };

    const handleDelete = async (messageId: number) => {
        if (!window.confirm("Are you sure you want to delete this message permanently?")) return;

        setMessages(messages.filter(m => m.id !== messageId));
        const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', messageId);

        if (error) {
            setError(`Failed to delete message: ${error.message}`);
            fetchMessages(); // Revert on error
        } else {
            if (selectedMessage && selectedMessage.id === messageId) {
                setSelectedMessage(null); // Close detail view if it was deleted
            }
        }
    };
    
    const handleSelectMessage = async (message: ContactMessage) => {
        setSelectedMessage(message);
        if (!message.is_read) {
            // Update status without a full re-render of the list to feel faster
            const { error } = await supabase
                .from('contact_messages')
                .update({ is_read: true })
                .eq('id', message.id);
            
            if (!error) {
                 setMessages(messages.map(m => m.id === message.id ? { ...m, is_read: true } : m));
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Message List */}
            <div className="lg:col-span-1 bg-admin-card-bg p-4 rounded-xl shadow-sm border border-admin-card-border h-[calc(100vh-12rem)] flex flex-col">
                <h2 className="text-lg font-bold text-admin-heading px-2 pb-3">Inbox ({messages.filter(m => !m.is_read).length} unread)</h2>
                {loading ? (
                    <div className="text-center py-10 text-admin-light">Loading messages...</div>
                ) : error ? (
                     <div className="p-4 text-red-400 bg-red-500/10 rounded-lg">{error}</div>
                ) : (
                    <ul className="divide-y divide-admin-card-border overflow-y-auto flex-1">
                        {messages.length === 0 ? (
                             <li className="p-10 text-center text-admin-light/70">No messages found.</li>
                        ) : (
                            messages.map(msg => (
                                <li key={msg.id} onClick={() => handleSelectMessage(msg)} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedMessage?.id === msg.id ? 'bg-admin-main-bg' : 'hover:bg-admin-main-bg/50'}`}>
                                    <div className="flex justify-between items-start">
                                        <p className={`font-bold text-admin-heading truncate pr-2 ${!msg.is_read ? '' : 'text-admin-light'}`}>{msg.full_name}</p>
                                        {!msg.is_read && <div className="w-2.5 h-2.5 bg-admin-accent rounded-full mt-1.5 flex-shrink-0"></div>}
                                    </div>
                                    <p className="text-sm text-admin-light truncate">{msg.subject}</p>
                                    <p className="text-xs text-admin-light/70 mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </div>

            {/* Message Detail View */}
            <div className="lg:col-span-2 bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border h-[calc(100vh-12rem)] flex flex-col">
                {selectedMessage ? (
                    <>
                        <div className="pb-4 border-b border-admin-card-border flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-admin-heading">{selectedMessage.subject}</h3>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => handleToggleRead(selectedMessage)} className="p-2 text-admin-light hover:bg-admin-main-bg rounded-full" title={selectedMessage.is_read ? "Mark as Unread" : "Mark as Read"}>
                                        {selectedMessage.is_read ? 
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" /></svg> :
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                                        }
                                    </button>
                                     <button onClick={() => handleDelete(selectedMessage.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full" title="Delete">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-admin-light mt-1">
                                From: <span className="font-semibold text-admin-heading">{selectedMessage.full_name}</span> &lt;<a href={`mailto:${selectedMessage.email}`} className="text-admin-accent hover:underline">{selectedMessage.email}</a>&gt;
                            </p>
                            <p className="text-xs text-admin-light/70 mt-1">{new Date(selectedMessage.created_at).toLocaleString()}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto py-4">
                            <p className="text-admin-heading whitespace-pre-wrap">{selectedMessage.message}</p>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-admin-light/70">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <h3 className="text-lg font-bold text-admin-heading">Select a message</h3>
                        <p>Choose a message from the list to view its contents.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMessagesPage;