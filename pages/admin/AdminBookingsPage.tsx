import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { Booking, UploadedFileRecord, AdminNote, UserMessage, ProofFile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Database, Json } from '../../database.types';


const BOOKING_STATUSES = ['Pending', 'Awaiting Payment', 'In Review', 'Requires Action', 'Approved', 'Rejected', 'Completed'];
const PAYMENT_METHODS = ['razorpay', 'cod', 'N/A (Free)'];

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

const DocumentPreviewModal: React.FC<{
    fileUrl: string;
    fileName: string;
    onClose: () => void;
}> = ({ fileUrl, fileName, onClose }) => {
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-admin-card-bg rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col animate-content-in"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-admin-card-border flex items-center justify-between flex-shrink-0">
                    <h3 className="font-bold text-admin-heading truncate">{fileName}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-admin-main-bg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-admin-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <div className="flex-1 p-4 overflow-auto flex justify-center items-center">
                    {isImage ? (
                        <img src={fileUrl} alt={`Preview of ${fileName}`} className="max-w-full max-h-full object-contain" />
                    ) : (
                        <div className="text-center text-admin-light">
                            <p>Cannot display a preview for this file type.</p>
                            <p className="text-sm mt-2">You can download it to view.</p>
                        </div>
                    )}
                </div>

                <footer className="p-4 border-t border-admin-card-border flex-shrink-0 flex justify-end">
                    <a 
                        href={fileUrl} 
                        download={fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-admin-accent text-white font-semibold rounded-lg hover:brightness-110 transition shadow-md hover:shadow-lg shadow-admin-accent/30"
                    >
                        Download
                    </a>
                </footer>
            </div>
        </div>
    );
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
    
    const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);
    const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});
    const [newStatus, setNewStatus] = useState('');
    const [codEnabled, setCodEnabled] = useState(false);
    const [messageToUser, setMessageToUser] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    const [stagedProofFiles, setStagedProofFiles] = useState<File[]>([]);


    const fetchBookingDetails = useCallback(async () => {
        setLoading(true);
        setError('');
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

    useEffect(() => {
        if (booking) {
            const allFiles = [
                ...Object.values(booking.uploaded_files || {}),
                ...(booking.proof_of_completion_files || [])
            ];

            if (allFiles.length > 0) {
                 const generateUrls = async () => {
                    const urlPromises = allFiles.map(async (file) => {
                        const { data, error } = await supabase.storage
                            .from('documents')
                            .createSignedUrl(file.path, 3600); // 1 hour expiry
                        if (!error && data) return { path: file.path, url: data.signedUrl };
                        console.error(`Error creating signed URL for ${file.path}:`, error);
                        return { path: file.path, url: '#' };
                    });

                    const results = await Promise.all(urlPromises);
                    const urls: Record<string, string> = {};
                    results.forEach(result => { urls[result.path] = result.url; });
                    setDocumentUrls(urls);
                };
                generateUrls();
            }
        }
    }, [booking]);

    const handleProofFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setStagedProofFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };
    
    const handleRemoveStagedFile = (index: number) => {
        setStagedProofFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdateBooking = async () => {
        if (!booking) return;
        setIsSaving(true);
        setError('');
        
        try {
            const promises = [];

            // 1. Handle Proof File Uploads
            const newProofFiles: ProofFile[] = [];
            if (stagedProofFiles.length > 0) {
                for (const file of stagedProofFiles) {
                    const filePath = `${booking.user_id}/${booking.id}/proof/${Date.now()}-${file.name}`;
                    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
                    if (uploadError) throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
                    newProofFiles.push({ name: file.name, path: filePath, size: file.size });
                }
            }

            // 2. Update Profile if COD status changed
            if (booking.profiles?.cod_enabled !== codEnabled) {
                promises.push(supabase.from('profiles').update({ cod_enabled: codEnabled }).eq('id', booking.user_id));
            }

            // 3. Prepare booking update payload
            const updatedMessages: UserMessage[] = [...(booking.user_messages || [])];
            if (messageToUser.trim()) {
                updatedMessages.push({ sender: 'admin', text: messageToUser.trim(), timestamp: new Date().toISOString() });
            }
            const updatedNotes: AdminNote[] = [...(booking.admin_notes || [])];
            if (adminNote.trim()) {
                updatedNotes.push({ text: adminNote.trim(), timestamp: new Date().toISOString(), admin_name: adminProfile?.full_name || 'Admin' });
            }
            const mergedProofFiles = [...(booking.proof_of_completion_files || []), ...newProofFiles];

            const bookingUpdate: Partial<Database['public']['Tables']['bookings']['Update']> = {
                status: newStatus,
                user_messages: updatedMessages as unknown as Json,
                admin_notes: updatedNotes as unknown as Json,
            };
            
            if (newStatus === 'Completed' && booking.status !== 'Completed') {
                bookingUpdate.completed_at = new Date().toISOString();
            }

            if (newProofFiles.length > 0) {
                bookingUpdate.proof_of_completion_files = mergedProofFiles as unknown as Json;
            }

            promises.push(supabase.from('bookings').update(bookingUpdate).eq('id', booking.id));

            // 4. Create a notification if status changed
            if (newStatus !== booking.status) {
                const notifMessage = `Your booking for "${booking.services?.name}" has been updated to: ${newStatus}.`;
                promises.push(supabase.from('notifications').insert([{ user_id: booking.user_id, message: notifMessage, link: '/profile' }]));
            }
            
            // 5. Execute all promises
            const results = await Promise.all(promises);
            const firstError = results.find(res => res.error);
            if (firstError) throw firstError.error;
            
            setMessageToUser('');
            setAdminNote('');
            setStagedProofFiles([]);
            onUpdate();
            fetchBookingDetails(); // Refresh details after successful save
        } catch (err: any) {
            setError(`Failed to save: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const Card: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode; actions?: React.ReactNode }> = ({ title, children, icon, actions }) => (
        <div className="bg-admin-card-bg rounded-xl border border-admin-card-border animate-fade-in">
            <div className="p-4 border-b border-admin-card-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="font-semibold text-admin-heading">{title}</h3>
                </div>
                <div>{actions}</div>
            </div>
            {children}
        </div>
    );
    const DetailItem: React.FC<{label: string; children: React.ReactNode}> = ({ label, children }) => (
        <div>
            <p className="text-sm text-admin-light">{label}</p>
            <p className="text-base font-medium text-admin-heading break-words">{children || '-'}</p>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <header className="flex justify-between items-start mb-8">
                <div>
                    <p className="font-mono text-sm text-admin-accent flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2-2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                        Booking Details
                    </p>
                    <h2 className="text-2xl font-bold text-admin-heading">DMTRA-{String(bookingId).padStart(6, '0')}</h2>
                </div>
                <button onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-admin-light hover:text-admin-heading transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Back to Bookings
                </button>
            </header>

            {loading && <div className="text-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-accent mx-auto"></div></div>}
            {error && !booking && <p className="text-red-400 bg-red-500/10 p-4 rounded-lg">{error}</p>}

            {booking && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* --- LEFT COLUMN --- */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card title="Booking Summary" actions={<span className={`px-2.5 py-1 text-xs font-bold rounded-full ${STATUS_BG_COLORS[booking.status] || ''} ${STATUS_TEXT_COLORS[booking.status] || ''}`}>{booking.status}</span>}>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DetailItem label="Service">{booking.services?.name}</DetailItem>
                                <DetailItem label="Submitted On">{new Date(booking.created_at).toLocaleString()}</DetailItem>
                                <DetailItem label="Payment Method">{booking.payment_method}</DetailItem>
                                <DetailItem label="Final Price">₹{booking.final_price}</DetailItem>
                            </div>
                        </Card>
                        <Card title="Applicant Information">
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {!booking.user_details || Object.keys(booking.user_details).length === 0 ? (
                                    <p className="text-admin-light/70 text-sm md:col-span-2">No details provided.</p>
                                ) : (
                                    Object.entries(booking.user_details).map(([key, value]) => (
                                        <DetailItem key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}>{String(value)}</DetailItem>
                                    ))
                                )}
                            </div>
                        </Card>
                        <Card title="Uploaded Documents">
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {!booking.uploaded_files || Object.keys(booking.uploaded_files).length === 0 ? (
                                    <p className="text-admin-light/70 text-sm md:col-span-2">No documents uploaded.</p>
                                ) : (Object.values(booking.uploaded_files as UploadedFileRecord).map(file => {
                                    const fileUrl = documentUrls[file.path];
                                    if (!fileUrl) {
                                        return (
                                            <div key={file.path} className="w-full h-12 flex items-center gap-3 p-3 bg-admin-main-bg border border-admin-card-border rounded-lg animate-pulse">
                                                <div className="h-5 w-5 bg-admin-main-bg/50 rounded"></div>
                                                <div className="h-4 w-4/5 bg-admin-main-bg/50 rounded"></div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <button 
                                            onClick={() => fileUrl !== '#' && setPreviewFile({ url: fileUrl, name: file.name })} 
                                            key={file.path} 
                                            disabled={fileUrl === '#'}
                                            className="w-full text-left flex items-center gap-3 p-3 bg-admin-main-bg border border-admin-card-border rounded-lg hover:border-admin-accent transition group cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-admin-accent flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2-2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                            <span className="font-semibold text-admin-heading group-hover:underline truncate">{file.name}</span>
                                            <span className="text-xs text-admin-light/50 ml-auto font-mono flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </button>
                                    );
                                }))}
                            </div>
                        </Card>
                         {/* Proof of Completion Card */}
                        <Card title="Proof of Completion">
                            <div className="p-4 space-y-4">
                                <div className="space-y-3">
                                    {(booking.proof_of_completion_files || []).map((file, index) => {
                                        const fileUrl = documentUrls[file.path];
                                        return (
                                            <button 
                                                key={index} 
                                                onClick={() => fileUrl && fileUrl !== '#' && setPreviewFile({ url: fileUrl, name: file.name })}
                                                disabled={!fileUrl || fileUrl === '#'}
                                                className="w-full text-left flex items-center gap-3 p-3 bg-admin-main-bg border border-admin-card-border rounded-lg hover:border-admin-accent transition group disabled:cursor-not-allowed"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                <span className="font-semibold text-admin-heading group-hover:underline truncate">{file.name}</span>
                                                <span className="text-xs text-admin-light/50 ml-auto font-mono flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                                            </button>
                                        )
                                    })}
                                    {stagedProofFiles.map((file, index) => (
                                         <div key={index} className="flex items-center gap-3 p-3 bg-admin-main-bg border-2 border-dashed border-admin-accent/50 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-admin-accent flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                            <span className="font-semibold text-admin-heading truncate">{file.name}</span>
                                            <button onClick={() => handleRemoveStagedFile(index)} className="ml-auto text-red-500 hover:text-red-400 p-1 font-bold text-lg leading-none">&times;</button>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <label className="w-full flex flex-col items-center justify-center p-4 transition-colors duration-300 border-2 border-dashed rounded-xl cursor-pointer border-admin-card-border hover:border-admin-accent bg-admin-main-bg hover:bg-admin-card-bg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-admin-light/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                        <span className="mt-2 text-sm font-medium text-admin-light text-center">
                                            Click to upload or drag & drop files
                                        </span>
                                        <input type="file" multiple onChange={handleProofFileSelect} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                                    </label>
                                </div>
                            </div>
                        </Card>
                    </div>
                     {/* --- RIGHT COLUMN --- */}
                     <div className="lg:col-span-1">
                        <div className="sticky top-10 space-y-6">
                             <Card title="Booking Setup">
                                <div className="p-4 space-y-4">
                                     <div>
                                        <label className="text-sm font-semibold text-admin-light">Update Status</label>
                                        <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full mt-1 p-2 border border-admin-card-border bg-admin-main-bg rounded-lg text-admin-heading focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition">
                                            {BOOKING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </Card>
                            <Card title="Customer Information">
                                <div className="p-4 space-y-4">
                                    <DetailItem label="Full Name">{booking.profiles?.full_name}</DetailItem>
                                    <DetailItem label="Email">{booking.profiles?.email}</DetailItem>
                                    <label className="flex items-center gap-3 pt-4 border-t border-admin-card-border cursor-pointer">
                                        <input type="checkbox" checked={codEnabled} onChange={e => setCodEnabled(e.target.checked)} className="w-5 h-5 rounded accent-admin-accent"/>
                                        <span className="font-semibold text-admin-heading">Enable COD for this user</span>
                                    </label>
                                </div>
                            </Card>
                            <Card title="Communication & Notes">
                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-admin-light">Message to User (optional)</label>
                                        <textarea value={messageToUser} onChange={e => setMessageToUser(e.target.value)} placeholder="e.g., Please re-upload your proof of address." className="w-full mt-1 p-2 border border-admin-card-border bg-admin-main-bg rounded-lg min-h-[80px] text-admin-heading focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition"></textarea>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-admin-light">Internal Admin Note (optional)</label>
                                        <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Internal note, not visible to user." className="w-full mt-1 p-2 border border-admin-card-border bg-admin-main-bg rounded-lg min-h-[80px] text-admin-heading focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition"></textarea>
                                    </div>
                                    {error && <p className="text-red-400 bg-red-500/10 p-2 rounded-md text-sm">{error}</p>}
                                    <div className="pt-2 text-right">
                                        <button onClick={handleUpdateBooking} disabled={isSaving} className="px-6 py-3 w-full bg-admin-accent text-white font-bold rounded-lg hover:brightness-110 disabled:bg-slate-400 transition">
                                            {isSaving ? 'Updating...' : 'Update Booking'}
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                     </div>
                 </div>
            )}
            {previewFile && <DocumentPreviewModal fileUrl={previewFile.url} fileName={previewFile.name} onClose={() => setPreviewFile(null)} />}
       </div>
    );
};


const AdminBookingsPage: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [bookingsPerPage] = useState(10);
    const [totalBookings, setTotalBookings] = useState(0);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const from = (currentPage - 1) * bookingsPerPage;
            const to = from + bookingsPerPage - 1;

            let query = supabase
                .from('bookings')
                .select('*, services(name), profiles(full_name, email)', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (statusFilter) {
                query = query.eq('status', statusFilter);
            }
            if (paymentFilter) {
                query = query.eq('payment_method', paymentFilter);
            }
            if (searchTerm) {
                // This is a simplified search. For a more robust solution, a dedicated search function (RPC in Supabase) would be better.
                query = query.or(`profiles.full_name.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%,id::text.ilike.%${searchTerm}%`);
            }

            const { data, error, count } = await query;

            if (error) throw error;
            
            setBookings((data as unknown as Booking[]) || []);
            setTotalBookings(count || 0);

        } catch (err: any) {
            setError(`Failed to load bookings: ${err.message}`);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, bookingsPerPage, statusFilter, paymentFilter, searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBookings();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchBookings]);

    const handleUpdate = () => {
        fetchBookings();
    };
    
    const totalPages = Math.ceil(totalBookings / bookingsPerPage);

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setPaymentFilter('');
        setCurrentPage(1);
    }
    
    if (selectedBookingId) {
        return <BookingDetailPanel bookingId={selectedBookingId} onClose={() => setSelectedBookingId(null)} onUpdate={handleUpdate} />;
    }

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="p-4"><div className="h-4 bg-admin-card-border rounded w-20"></div></td>
            <td className="p-4 space-y-1">
                <div className="h-4 bg-admin-card-border rounded w-32"></div>
                <div className="h-3 bg-admin-card-border rounded w-40"></div>
            </td>
            <td className="p-4"><div className="h-4 bg-admin-card-border rounded w-28"></div></td>
            <td className="p-4"><div className="h-4 bg-admin-card-border rounded w-24"></div></td>
            <td className="p-4"><div className="h-6 bg-admin-card-border rounded-full w-24"></div></td>
            <td className="p-4"><div className="h-4 bg-admin-card-border rounded w-16"></div></td>
            <td className="p-4 text-right"><div className="h-6 w-12 bg-admin-card-border rounded-md inline-block"></div></td>
        </tr>
    );

    return (
        <div className="bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border">
            {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg mb-4">{error}</p>}

            {/* Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search ID, name, email..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full p-2 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition"
                />
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="w-full p-2 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition">
                    <option value="">All Statuses</option>
                    {BOOKING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }} className="w-full p-2 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition">
                    <option value="">All Payment Methods</option>
                    {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button onClick={handleResetFilters} className="px-4 py-2 bg-admin-light/20 text-admin-heading font-semibold rounded-lg hover:bg-admin-light/30 transition text-sm">Reset</button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-admin-light">
                        <tr>
                            <th className="p-4 font-semibold">Booking ID</th>
                            <th className="p-4 font-semibold">Customer</th>
                            <th className="p-4 font-semibold">Service</th>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Payment</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-admin-card-border">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : bookings.length === 0 ? (
                            <tr><td colSpan={7} className="p-6 text-center text-admin-light/70">No bookings found matching your criteria.</td></tr>
                        ) : (
                            bookings.map(booking => (
                                <tr key={booking.id} className="hover:bg-admin-main-bg">
                                    <td className="p-4 font-mono text-admin-light">{String(booking.id).padStart(6, '0')}</td>
                                    <td className="p-4">
                                        <div className="font-semibold text-admin-heading">{booking.profiles?.full_name || 'N/A'}</div>
                                        <div className="text-admin-light">{booking.profiles?.email || 'No Email'}</div>
                                    </td>
                                    <td className="p-4 font-medium text-admin-heading">{booking.services?.name || 'Unknown'}</td>
                                    <td className="p-4 text-admin-light">{new Date(booking.created_at).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${STATUS_BG_COLORS[booking.status] || ''} ${STATUS_TEXT_COLORS[booking.status] || ''}`}>{booking.status}</span>
                                    </td>
                                    <td className="p-4 text-admin-light capitalize flex items-center gap-2">
                                        {booking.payment_method === 'razorpay' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h12v4a2 2 0 002-2V6a2 2 0 00-2-2H4z" clipRule="evenodd" /><path d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9z" /></svg>}
                                        {booking.payment_method === 'cod' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 004 0V7.15c.22.071.412.164.567.267C13.96 7.888 14 8.24 14 8.5V14a1 1 0 01-1 1H7a1 1 0 01-1-1V8.5c0-.26.04-.612.433-1.082zM9 2a1 1 0 011-1h.01a1 1 0 010 2H10a1 1 0 01-1-1z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.857.792 1.5 1.5 0 00-1.28 1.48V8.5a1 1 0 001 1h5a1 1 0 001-1V8.5a1.5 1.5 0 00-1.28-1.48A4.5 4.5 0 0011 5.092V5z" clipRule="evenodd" /></svg>}
                                        {booking.payment_method}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => setSelectedBookingId(booking.id)} className="text-admin-accent hover:underline font-semibold">View</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-admin-card-border">
                <span className="text-sm text-admin-light">
                    Showing <span className="font-semibold text-admin-heading">{Math.min((currentPage - 1) * bookingsPerPage + 1, totalBookings)}</span> to <span className="font-semibold text-admin-heading">{Math.min(currentPage * bookingsPerPage, totalBookings)}</span> of <span className="font-semibold text-admin-heading">{totalBookings}</span> results
                </span>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm font-semibold rounded-md bg-admin-main-bg hover:bg-admin-card-border disabled:opacity-50 disabled:cursor-not-allowed">
                        Previous
                    </button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1.5 text-sm font-semibold rounded-md bg-admin-main-bg hover:bg-admin-card-border disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminBookingsPage;