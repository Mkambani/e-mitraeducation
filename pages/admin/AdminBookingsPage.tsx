

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { Booking, UploadedFileRecord, AdminNote, UserMessage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Database, Json } from '../../database.types';


const BOOKING_STATUSES = ['Pending', 'Awaiting Payment', 'In Review', 'Requires Action', 'Approved', 'Rejected', 'Completed'];

const STATUS_TEXT_COLORS: { [key: string]: string } = {
  'Pending': 'text-yellow-400',
  'Awaiting Payment': 'text-sky-400',
  'In Review': 'text-blue-400',
  'Requires Action': 'text-orange-400',
  'Approved': 'text-green-400',
  'Rejected': 'text-red-400',
  'Completed': 'text-purple-400',
};

const STATUS_BG_COLORS: { [key: string]: string } = {
  'Pending': 'bg-yellow-400/10',
  'Awaiting Payment': 'bg-sky-400/10',
  'In Review': 'bg-blue-400/10',
  'Requires Action': 'bg-orange-400/10',
  'Approved': 'bg-green-400/10',
  'Rejected': 'bg-red-400/10',
  'Completed': 'bg-purple-400/10',
};


const BookingDetailPanel: React.FC<{
    bookingId: number;
    onClose: () => void;
    onUpdate: () => void;
}> = ({ bookingId, onClose, onUpdate }) => {
    const { profile: adminProfile } = useAuth();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notificationError, setNotificationError] = useState('');

    const [newStatus, setNewStatus] = useState('');
    const [codEnabled, setCodEnabled] = useState(false);
    const [messageToUser, setMessageToUser] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchBookingDetails = useCallback(async () => {
        setLoading(true);
        setError('');
        setNotificationError('');
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*, services(name), profiles(full_name, email, cod_enabled)')
                .eq('id', bookingId)
                .maybeSingle();
            if (error) throw error;
            const bookingData = data as unknown as Booking | null;

            if (bookingData) {
                setBooking(bookingData);
                setNewStatus(bookingData.status);
                setCodEnabled(bookingData.profiles?.cod_enabled || false);
            } else {
                setBooking(null);
                setError("Booking not found.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [bookingId]);

    useEffect(() => {
        fetchBookingDetails();
    }, [fetchBookingDetails]);

    const handleSave = async () => {
        if (!booking) return;
        setIsSaving(true);
        setError('');
        setNotificationError('');
        
        try {
            const promises = [];
            // 1. Update Profile if COD status changed
            if (booking.profiles?.cod_enabled !== codEnabled) {
                const profileUpdate = { cod_enabled: codEnabled };
                promises.push(supabase.from('profiles').update(profileUpdate).eq('id', booking.user_id));
            }

            // 2. Prepare booking update data
            const updatedMessages: UserMessage[] = [...(booking.user_messages || [])];
            if (messageToUser.trim()) {
                updatedMessages.push({ sender: 'admin', text: messageToUser.trim(), timestamp: new Date().toISOString() });
            }
            const updatedNotes: AdminNote[] = [...(booking.admin_notes || [])];
            if (adminNote.trim()) {
                updatedNotes.push({ text: adminNote.trim(), timestamp: new Date().toISOString(), admin_name: adminProfile?.full_name || 'Admin' });
            }
            
            const bookingUpdate = {
                status: newStatus,
                user_messages: updatedMessages as unknown as Json,
                admin_notes: updatedNotes as unknown as Json,
            };
            promises.push(supabase.from('bookings').update(bookingUpdate).eq('id', booking.id));

            // 3. Create a notification if the booking status has changed
            if (newStatus !== booking.status) {
                const notifMessage = `Your booking for "${booking.services?.name}" has been updated to: ${newStatus}.`;
                const notificationInsert = { user_id: booking.user_id, message: notifMessage, link: '/profile' };
                promises.push(supabase.from('notifications').insert([notificationInsert]));
            }
            
            // Execute all updates
            const results = await Promise.all(promises);
            const firstError = results.find(res => res.error);
            if (firstError) throw firstError.error;
            
            setMessageToUser('');
            setAdminNote('');
            onUpdate();
            fetchBookingDetails();
        } catch (err: any) {
            setError(`Failed to save: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const DetailSection: React.FC<{title: string; children: React.ReactNode; gridClass?: string}> = ({ title, children, gridClass = 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4' }) => (
        <div className="py-5">
            <h4 className="text-sm font-semibold text-admin-light/70 uppercase tracking-wider mb-4 font-mono">{title}</h4>
            <div className={gridClass}>{children}</div>
        </div>
    );
    const DetailItem: React.FC<{label: string; children: React.ReactNode; className?: string}> = ({ label, children, className = '' }) => (
        <div className={className}>
            <p className="text-sm text-admin-light">{label}</p>
            <p className="text-base font-medium text-admin-heading break-words">{children || '-'}</p>
        </div>
    );

    return (
       <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" onClick={onClose}>
            <div 
                className="fixed top-0 right-0 bottom-0 w-full max-w-5xl bg-admin-surface-glass border-l border-admin-border shadow-2xl flex flex-col animate-slide-in-right"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <header className="p-6 border-b border-admin-border flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-admin-heading">Booking Details</h2>
                        <p className="font-mono text-sm text-admin-accent">NME-{String(bookingId).padStart(6, '0')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-admin-surface transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-admin-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                {/* Content Grid */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 overflow-y-auto">
                    
                    {/* Main Content Column */}
                    <main className="lg:col-span-2 space-y-4">
                        {loading && <p className="text-admin-light text-center p-10">Loading...</p>}
                        {error && !booking && <p className="text-red-400">{error}</p>}
                        {booking ? (
                            <div className="divide-y divide-admin-border">
                                <DetailSection title="Key Information" gridClass="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    <DetailItem label="Applicant">{booking.profiles?.full_name}</DetailItem>
                                    <DetailItem label="Service">{booking.services?.name}</DetailItem>
                                    <DetailItem label="Email">{booking.profiles?.email}</DetailItem>
                                    <DetailItem label="Submitted On">{new Date(booking.created_at).toLocaleString()}</DetailItem>
                                    <DetailItem label="Payment Method">{booking.payment_method}</DetailItem>
                                    <DetailItem label="Final Price">₹{booking.final_price}</DetailItem>
                                </DetailSection>

                                <DetailSection title="Applicant Provided Details" gridClass="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    {!booking.user_details || Object.keys(booking.user_details).length === 0 ? (
                                        <p className="text-admin-light/70 text-sm md:col-span-2">No details provided.</p>
                                    ) : (
                                        Object.entries(booking.user_details).map(([key, value]) => (
                                            <DetailItem key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}>{String(value)}</DetailItem>
                                        ))
                                    )}
                                </DetailSection>

                                <DetailSection title="Uploaded Documents" gridClass="space-y-3">
                                    {!booking.uploaded_files || Object.keys(booking.uploaded_files).length === 0 ? (
                                        <p className="text-admin-light/70 text-sm">No documents uploaded.</p>
                                    ) : (Object.values(booking.uploaded_files as UploadedFileRecord).map(file => {
                                        const { data } = supabase.storage.from('documents').getPublicUrl(file.path);
                                        return (
                                            <a href={data.publicUrl} target="_blank" rel="noopener noreferrer" key={file.path} className="flex items-center gap-3 p-3 bg-admin-surface border border-admin-border rounded-lg hover:border-admin-accent transition group">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-admin-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2-2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                                <span className="font-semibold text-admin-accent group-hover:underline">{file.name}</span>
                                                <span className="text-xs text-admin-light/50 ml-auto font-mono">({(file.size / 1024).toFixed(1)} KB)</span>
                                            </a>
                                        );
                                    }))}
                                </DetailSection>
                            </div>
                        ) : !loading && <p className="text-admin-light text-center p-10">This booking could not be loaded.</p>}
                    </main>

                    {/* Actions Column */}
                    <aside className="lg:col-span-1">
                        {booking && (
                            <div className="sticky top-6 bg-admin-surface/70 border border-admin-border p-6 rounded-2xl space-y-4">
                                <h3 className="font-bold text-lg text-admin-heading">Admin Actions</h3>
                                {error && <p className="text-red-400 bg-red-500/10 p-2 rounded-md text-sm">{error}</p>}
                                
                                <label className="flex items-center gap-3 p-3 bg-admin-surface rounded-lg cursor-pointer">
                                    <input type="checkbox" checked={codEnabled} onChange={e => setCodEnabled(e.target.checked)} className="w-5 h-5 rounded accent-admin-accent"/>
                                    <span className="font-semibold text-admin-heading">Enable Cash on Delivery</span>
                                </label>
                                
                                <div>
                                    <label className="text-sm font-semibold text-admin-light">Update Status</label>
                                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full mt-1 p-2 border border-admin-border bg-admin-surface rounded-lg text-admin-heading focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition">
                                        {BOOKING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-admin-light">Message to User (optional)</label>
                                    <textarea value={messageToUser} onChange={e => setMessageToUser(e.target.value)} placeholder="e.g., Please re-upload proof of address." className="w-full mt-1 p-2 border border-admin-border bg-admin-surface rounded-lg min-h-[60px] text-admin-heading focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition"></textarea>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-admin-light">Internal Admin Note (optional)</label>
                                    <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Internal note, not visible to user." className="w-full mt-1 p-2 border border-admin-border bg-admin-surface rounded-lg min-h-[60px] text-admin-heading focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition"></textarea>
                                </div>
                                <button onClick={handleSave} disabled={isSaving} className="w-full px-5 py-3 bg-admin-accent text-white font-bold rounded-lg hover:brightness-110 disabled:bg-slate-400 transition">
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
       </div>
    );
};

interface BookingRow extends Omit<Booking, 'services' | 'profiles'> {
    services: { name: string } | null;
    profiles: { full_name: string | null; email: string | null } | null;
}

const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  const fetchBookings = useCallback(async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            created_at,
            status,
            user_id,
            services ( name ),
            profiles ( full_name, email )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings((data as unknown as BookingRow[]) || []);
      } catch (err: any) {
        setError(`Failed to load bookings: ${err.message}`);
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  
  const handleUpdate = () => {
      fetchBookings(); // Refetch the list to show updated status
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-admin-heading tracking-tight">All Bookings</h1>

      {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>}
      
      <div className="bg-admin-surface-glass border border-admin-border backdrop-blur-2xl rounded-2xl shadow-xl shadow-black/10 overflow-x-auto">
        {loading ? (
            <p className="p-6 text-center text-admin-light">Loading bookings...</p>
        ) : (
            <table className="w-full text-left text-sm">
                <thead className="bg-admin-surface/70 text-admin-light">
                    <tr>
                        <th className="p-4 font-semibold">Booking ID</th>
                        <th className="p-4 font-semibold">User</th>
                        <th className="p-4 font-semibold">Service</th>
                        <th className="p-4 font-semibold">Date</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                    {bookings.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="p-6 text-center text-admin-light/70">No bookings found.</td>
                        </tr>
                    ) : (
                        bookings.map(booking => (
                            <tr key={booking.id} className="hover:bg-admin-accent-light">
                                <td className="p-4 font-mono text-admin-light flex items-center gap-2">
                                    {String(booking.id).padStart(6, '0')}
                                </td>
                                <td className="p-4">
                                    <div className="font-semibold text-admin-heading">{booking.profiles?.full_name || 'N/A'}</div>
                                    <div className="text-admin-light">{booking.profiles?.email || 'No Email'}</div>
                                </td>
                                <td className="p-4 font-medium text-admin-heading">{booking.services?.name || 'Unknown Service'}</td>
                                <td className="p-4 text-admin-light">{new Date(booking.created_at).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${STATUS_BG_COLORS[booking.status] || 'bg-slate-700'} ${STATUS_TEXT_COLORS[booking.status] || 'text-slate-300'}`}>
                                      {booking.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => setSelectedBookingId(booking.id)} className="text-admin-accent hover:underline font-semibold">View</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        )}
      </div>
      {selectedBookingId && <BookingDetailPanel bookingId={selectedBookingId} onClose={() => setSelectedBookingId(null)} onUpdate={handleUpdate} />}
    </div>
  );
};

export default AdminBookingsPage;