import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { Review, Profile, Service } from '../../types';
import { Database, Json } from '../../database.types';
import { ServiceContext } from '../../context/ServiceContext';


const StarRatingInput: React.FC<{ rating: number; setRating: (r: number) => void }> = ({ rating, setRating }) => (
    <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-3xl transition-transform duration-150 ease-in-out hover:scale-125"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${star <= rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            </button>
        ))}
    </div>
);

const StarRatingDisplay: React.FC<{ rating: number; className?: string }> = ({ rating, className = 'h-5 w-5' }) => (
    <div className="flex">
        {[...Array(5)].map((_, i) => (
            <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`${className} ${i < rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);


const CreateReviewModal: React.FC<{ onClose: () => void, onSave: () => void }> = ({ onClose, onSave }) => {
    const { allServices } = useContext(ServiceContext);
    const [users, setUsers] = useState<Profile[]>([]);
    const [indentedServices, setIndentedServices] = useState<{ id: number; name: string; level: number; is_bookable: boolean; }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isApproved, setIsApproved] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState('');
    
    useEffect(() => {
        const fetchDataAndPrepareServices = async () => {
            setLoading(true);
            try {
                const usersPromise = supabase.from('profiles').select('*');
                
                const generateIndentedList = (services: Service[], level: number): { id: number; name: string; level: number; is_bookable: boolean; }[] => {
                    let list: { id: number; name: string; level: number; is_bookable: boolean; }[] = [];
                    services.forEach(s => {
                        list.push({ id: s.id, name: s.name, level, is_bookable: s.is_bookable });
                        if (s.subServices) {
                            list = list.concat(generateIndentedList(s.subServices, level + 1));
                        }
                    });
                    return list;
                };
                setIndentedServices(generateIndentedList(allServices, 0));

                const { data: usersData, error: usersError } = await usersPromise;
                if (usersError) throw usersError;
                setUsers(usersData as Profile[]);

            } catch (err: any) {
                setError('Failed to load necessary data.');
            } finally {
                setLoading(false);
            }
        };
        fetchDataAndPrepareServices();
    }, [allServices]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId || !selectedServiceId || rating === 0) {
            setError('Please select a user, service, and provide a rating.');
            return;
        }
        setIsSaving(true);
        setError('');

        try {
            const { data: newBooking, error: bookingError } = await supabase
                .from('bookings')
                .insert({
                    user_id: selectedUserId,
                    service_id: Number(selectedServiceId),
                    status: 'Completed',
                    review_submitted: true, 
                    user_details: { source: 'admin_created_review' } as unknown as Json,
                    payment_method: 'N/A (Admin)',
                    final_price: 0,
                })
                .select('id')
                .single();

            if (bookingError || !newBooking) {
                console.error('Error creating placeholder booking:', bookingError);
                throw new Error("Could not create a placeholder booking for the review. A review must be tied to a booking record.");
            }

            const { error: reviewInsertError } = await supabase.from('reviews').insert({
                booking_id: newBooking.id,
                user_id: selectedUserId,
                service_id: Number(selectedServiceId),
                rating,
                comment,
                is_approved: isApproved,
            });
            if (reviewInsertError) throw reviewInsertError;

            if (avatarUrl.trim()) {
                await supabase.from('profiles').update({ avatar_url: avatarUrl.trim() }).eq('id', selectedUserId);
            }
            
            onSave();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-start z-50 p-4 pt-16 sm:pt-24 animate-fade-in" onClick={onClose}>
            <div className="bg-admin-card-bg rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <header className="p-6 border-b border-admin-card-border flex-shrink-0">
                        <h2 className="text-xl font-bold text-admin-heading">Create New Review</h2>
                        <p className="text-sm text-admin-light">Manually add a review for a user and service.</p>
                    </header>

                    <main className="flex-1 overflow-y-auto p-8">
                        {loading ? (
                            <div className="text-center p-10 text-admin-light">Loading data...</div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                                {/* --- Left Column --- */}
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="user-select" className="block text-sm font-semibold text-admin-light mb-2">User</label>
                                        <select id="user-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required className="w-full p-3 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition">
                                            <option value="" disabled>Select a user...</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="service-select" className="block text-sm font-semibold text-admin-light mb-2">Service</label>
                                        <select id="service-select" value={selectedServiceId} onChange={e => setSelectedServiceId(e.target.value)} required className="w-full p-3 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition">
                                            <option value="" disabled>Select a service...</option>
                                            {indentedServices.map(s => (
                                                <option key={s.id} value={s.id} disabled={!s.is_bookable} className={!s.is_bookable ? 'text-slate-500' : ''}>
                                                    {'--'.repeat(s.level)} {s.name} {!s.is_bookable ? ' (Category)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="avatar-url" className="block text-sm font-semibold text-admin-light mb-2">User Avatar URL (Optional)</label>
                                        <input id="avatar-url" type="url" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://example.com/avatar.png" className="w-full p-3 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition"/>
                                        <p className="text-xs text-admin-light mt-1">If provided, this will update the user's profile picture.</p>
                                    </div>
                                </div>

                                {/* --- Right Column --- */}
                                <div className="space-y-6 flex flex-col">
                                    <div>
                                        <label className="block text-center text-sm font-semibold text-admin-light mb-2">Rating</label>
                                        <StarRatingInput rating={rating} setRating={setRating} />
                                    </div>
                                    <div className="flex-grow flex flex-col">
                                        <label htmlFor="comment" className="block text-sm font-semibold text-admin-light mb-2">Comment (Optional)</label>
                                        <textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} placeholder="Write about the user's experience..." rows={8} className="w-full p-3 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition flex-grow"></textarea>
                                    </div>
                                </div>
                                
                                <div className="lg:col-span-2 mt-4 pt-6 border-t border-admin-card-border">
                                    <label className="flex items-center gap-3 p-4 bg-admin-main-bg rounded-lg cursor-pointer hover:bg-admin-main-bg/80 border border-admin-card-border">
                                        <input type="checkbox" checked={isApproved} onChange={e => setIsApproved(e.target.checked)} className="w-5 h-5 accent-admin-accent rounded text-white"/>
                                        <span className="font-semibold text-admin-heading">Approve this review immediately</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </main>

                    <footer className="p-4 bg-admin-main-bg/50 border-t border-admin-card-border flex-shrink-0 flex justify-end items-center gap-3">
                        {error && <p className="text-red-400 text-sm mr-auto">{error}</p>}
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-admin-light/20 text-admin-heading font-semibold rounded-lg hover:bg-admin-light/30 transition">Cancel</button>
                        <button type="submit" disabled={isSaving || loading} className="px-5 py-2.5 bg-admin-accent text-white font-semibold rounded-lg hover:brightness-110 disabled:bg-slate-400 transition shadow-md hover:shadow-lg shadow-admin-accent/30">
                            {isSaving ? 'Saving...' : 'Save Review'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}


const AdminReviewsPage: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Filters
    const [approvalFilter, setApprovalFilter] = useState<'all' | 'approved' | 'pending'>('all');
    
    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('reviews')
                .select('*, profiles(full_name, avatar_url), services(name)')
                .order('created_at', { ascending: false });
                
            if (approvalFilter === 'approved') {
                query = query.eq('is_approved', true);
            } else if (approvalFilter === 'pending') {
                query = query.eq('is_approved', false);
            }

            const { data, error } = await query;
            if (error) throw error;
            setReviews(data as any);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [approvalFilter]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);
    
    const handleToggleApproval = async (reviewId: number, currentStatus: boolean) => {
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, is_approved: !currentStatus } : r));
        const { error } = await supabase.from('reviews').update({ is_approved: !currentStatus }).eq('id', reviewId);
        if (error) {
            setError('Failed to update status.');
            fetchReviews(); // Revert on error
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                     <h2 className="text-xl font-bold text-admin-heading">Manage Reviews</h2>
                     <p className="text-admin-light text-sm">Approve, deny, or create new user reviews.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-admin-accent text-white font-bold rounded-lg shadow-sm hover:bg-admin-accent/90 transition-all text-sm">
                    Create New Review
                </button>
            </div>
            
             <div className="bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border">
                {/* Filter Controls */}
                <div className="flex gap-2 bg-admin-main-bg p-1 rounded-lg w-fit mb-4">
                    {(['all', 'pending', 'approved'] as const).map(status => (
                        <button 
                            key={status}
                            onClick={() => setApprovalFilter(status)}
                            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors capitalize ${approvalFilter === status ? 'bg-admin-card-bg text-admin-accent shadow-sm' : 'text-admin-light hover:text-admin-heading'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg mb-4">{error}</p>}
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                         <thead className="text-admin-light">
                            <tr>
                                <th className="p-4 font-semibold">User</th>
                                <th className="p-4 font-semibold">Service</th>
                                <th className="p-4 font-semibold">Comment</th>
                                <th className="p-4 font-semibold text-center">Rating</th>
                                <th className="p-4 font-semibold text-center">Status</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-admin-card-border">
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center text-admin-light">Loading reviews...</td></tr>
                            ) : reviews.length === 0 ? (
                                <tr><td colSpan={6} className="p-10 text-center text-admin-light/70">No reviews found.</td></tr>
                            ) : (
                                reviews.map(review => (
                                    <tr key={review.id} className="hover:bg-admin-main-bg transition-colors group">
                                        <td className="p-4 align-top">
                                            <div className="font-semibold text-admin-heading">{review.profiles?.full_name || 'Anonymous'}</div>
                                            <div className="text-xs text-admin-light">{new Date(review.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-4 align-top font-medium text-admin-heading">{review.services?.name}</td>
                                        <td className="p-4 align-top text-admin-light max-w-sm"><p className="line-clamp-2">{review.comment || 'No comment'}</p></td>
                                        <td className="p-4 align-top text-center"><StarRatingDisplay rating={review.rating} /></td>
                                        <td className="p-4 align-top text-center">
                                            <button onClick={() => handleToggleApproval(review.id, review.is_approved)} className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${review.is_approved ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-yellow-500/20 text-yellow-400 hover:bg-green-500/20 hover:text-green-400'}`}>
                                                <span className="group-hover:hidden">{review.is_approved ? 'Approved' : 'Pending'}</span>
                                                <span className="hidden group-hover:inline">{review.is_approved ? 'Unapprove?' : 'Approve?'}</span>
                                            </button>
                                        </td>
                                        <td className="p-4 align-top text-right">
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <CreateReviewModal onClose={() => setIsModalOpen(false)} onSave={() => { setIsModalOpen(false); fetchReviews(); }} />}
        </div>
    );
};

export default AdminReviewsPage;