import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import * as ReactRouterDOM from 'react-router-dom';
import { Booking, ProofFile } from '../types';
import { Database } from '../database.types';

const { useNavigate, Link } = ReactRouterDOM as any;

const STATUS_COLORS: { [key: string]: string } = {
  'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  'Awaiting Payment': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  'In Review': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  'Requires Action': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  'Approved': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  'Completed': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
};

const StarRating: React.FC<{ rating: number; setRating: (rating: number) => void; }> = ({ rating, setRating }) => {
    return (
        <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-4xl transition-transform duration-150 ease-in-out hover:scale-125"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${star <= rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
        </div>
    );
};

const ReviewModal: React.FC<{
    booking: Booking;
    onClose: () => void;
    onReviewSubmitted: () => void;
}> = ({ booking, onClose, onReviewSubmitted }) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }
        if (!user) {
            setError('You must be logged in to submit a review.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const { error: insertError } = await supabase.from('reviews').insert({
                booking_id: booking.id,
                user_id: user.id,
                service_id: booking.service_id,
                rating: rating,
                comment: comment,
            });

            if (insertError) throw insertError;

            onReviewSubmitted();

        } catch (err: any) {
            setError(err.message || 'Failed to submit review.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Leave a Review</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">For {booking.services?.name}</p>
                        <div className="my-6">
                            <StarRating rating={rating} setRating={setRating} />
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about your experience (optional)"
                            className="w-full h-28 p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
                        />
                         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition">Cancel</button>
                        <button type="submit" disabled={loading} className="px-5 py-2.5 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 disabled:bg-slate-400 transition">
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const ProfilePage: React.FC = () => {
  const { user, profile, refetchProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [proofFileUrls, setProofFileUrls] = useState<Record<string, string>>({});
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [mobile, setMobile] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState('');

  const initializeForm = () => {
    if (profile) {
      setFullName(profile.full_name || '');
      setDob(profile.dob || '');
      setMobile(profile.mobile_number || '');
      setAvatarPreview(profile.avatar_url || null);
      setAvatarFile(null); // Reset file input on state change
    }
  };

  useEffect(() => {
    if (!isEditing) {
      initializeForm();
    }
  }, [profile, isEditing]);


  const fetchBookings = async () => {
      if (!user) return;
      setBookingsLoading(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, services(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data as any);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setBookingsLoading(false);
      }
    };

  useEffect(() => {
    if (user) {
        fetchBookings();
    }
  }, [user]);

   useEffect(() => {
        const generateProofUrls = async () => {
            if (bookings.length === 0) return;

            const urlPromises = bookings.flatMap(booking => 
                (booking.proof_of_completion_files || []).map(async (file) => {
                    const { data } = await supabase.storage.from('documents').createSignedUrl(file.path, 3600); // 1 hour expiry
                    return { path: file.path, url: data?.signedUrl || '#' };
                })
            );
            
            if (urlPromises.length === 0) return;

            const results = await Promise.all(urlPromises);
            const urls: Record<string, string> = {};
            results.forEach(result => { urls[result.path] = result.url; });
            setProofFileUrls(urls);
        };

        generateProofUrls();
    }, [bookings]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setFormLoading(true);
    setMessage('');

    try {
        let newAvatarUrl = profile.avatar_url;

        if (avatarFile) {
            if (profile.avatar_url) {
                try {
                    const oldAvatarPath = new URL(profile.avatar_url).pathname.split('/avatars/')[1];
                    if (oldAvatarPath) await supabase.storage.from('avatars').remove([oldAvatarPath]);
                } catch (e) { console.warn("Could not delete old avatar", e); }
            }

            const fileExt = avatarFile.name.split('.').pop();
            const filePath = `${user.id}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile);
            if (uploadError) throw uploadError;

            newAvatarUrl = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                dob,
                mobile_number: mobile,
                avatar_url: newAvatarUrl,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (error) throw error;
        
        await refetchProfile();
        setAvatarFile(null);
        setMessage('Profile updated successfully!');
        setTimeout(() => {
            setMessage('');
            setIsEditing(false);
        }, 2000);

    } catch (err: any) {
        setMessage(`Error: ${err.message}`);
    } finally {
        setFormLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  const InfoCard: React.FC<{title: string; value: string;}> = ({title, value}) => (
     <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{value || '-'}</p>
     </div>
  );
  
  const Avatar: React.FC<{ url: string | null; size?: string; isLoading?: boolean }> = ({ url, size = 'h-24 w-24', isLoading }) => (
    <div className={`${size} rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-slate-500 relative flex-shrink-0`}>
        {url ? (
            <img src={url} alt="Profile Avatar" className="w-full h-full object-cover" />
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-1/2 w-1/2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
        )}
        {isLoading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}
    </div>
);


  if (authLoading) {
      return <div className="text-center p-10">Loading profile...</div>;
  }

  return (
    <>
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your details and view your booking history.</p>
        </div>
         <button 
            onClick={handleLogout} 
            className="mt-4 sm:mt-0 flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80 transition-colors rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
              Logout
         </button>
      </div>

      {/* Profile Details Section */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 mb-8">
         <form onSubmit={handleUpdateProfile}>
            {/* --- Profile Header --- */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 mb-6 border-b border-slate-200 dark:border-slate-700">
                <div className="relative group">
                    <Avatar url={avatarPreview} size="h-24 w-24" isLoading={formLoading} />
                    {isEditing && (
                        <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </label>
                    )}
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={!isEditing} />
                </div>
                <div className="flex-1 text-center sm:text-left">
                     <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{profile?.full_name || "New User"}</h2>
                     <p className="text-slate-500 dark:text-slate-400">{profile?.email}</p>
                </div>
                 {isEditing ? (
                    <div className="flex items-center gap-2">
                         <button type="button" onClick={() => { setIsEditing(false); initializeForm(); }} className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition text-sm">Cancel</button>
                         <button type="submit" disabled={formLoading} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 disabled:bg-slate-400 transition text-sm">
                             {formLoading ? 'Saving...' : 'Save'}
                         </button>
                    </div>
                 ) : (
                    <button onClick={() => setIsEditing(true)} className="font-semibold text-cyan-600 hover:underline flex-shrink-0 text-sm">Edit Profile</button>
                 )}
            </div>

            {/* --- Form / Info --- */}
            {isEditing ? (
                 <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                            <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" />
                        </div>
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Date of Birth</label>
                            <input type="date" id="dob" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="mobile" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Mobile Number</label>
                        <input type="tel" id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" />
                    </div>
                    {message && <p className={`mt-4 text-sm font-medium ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
                 </div>
            ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <InfoCard title="Date of Birth" value={profile?.dob ? new Date(profile.dob).toLocaleDateString() : ''} />
                     <InfoCard title="Mobile Number" value={profile?.mobile_number ?? ''} />
                </div>
            )}
         </form>
      </div>

      {/* Booking History Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">My Bookings</h2>
        {bookingsLoading ? (
            <div className="text-center p-10">Loading bookings...</div>
        ) : bookings.length > 0 ? (
            <div className="space-y-4">
                {bookings.map(booking => (
                    <div key={booking.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-1">
                                <p className="font-bold text-lg text-slate-800 dark:text-slate-200">{booking.services?.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Booked on: {new Date(booking.created_at).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                                    ID: DMTRA-{String(booking.id).padStart(6, '0')}
                                </p>
                            </div>
                            <div className="flex-shrink-0 mt-3 sm:mt-0 text-right">
                               <span className={`px-3 py-1.5 text-sm font-bold rounded-full ${STATUS_COLORS[booking.status] || 'bg-slate-100 text-slate-800'}`}>
                                    {booking.status}
                               </span>
                            </div>
                        </div>

                         {booking.status === 'Completed' && !booking.review_submitted && (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-right">
                                <button
                                    onClick={() => setReviewBooking(booking)}
                                    className="px-4 py-2 text-sm font-semibold text-cyan-600 bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:hover:bg-cyan-900/80 transition-colors rounded-lg"
                                >
                                    Leave a Review
                                </button>
                            </div>
                        )}

                        {booking.proof_of_completion_files && booking.proof_of_completion_files.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-300 mb-2">Completion Documents</h4>
                                <div className="flex flex-wrap gap-2">
                                    {booking.proof_of_completion_files.map((file, index) => {
                                        const url = proofFileUrls[file.path];
                                        return (
                                             <a
                                                key={index}
                                                href={url || '#'}
                                                download={file.name}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-cyan-50 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition-colors ${!url || url === '#' ? 'opacity-50 cursor-wait' : ''}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                                <span>{file.name}</span>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center p-10 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="font-semibold">You have no booking history.</p>
                <p className="text-sm text-slate-500 mt-1">Ready to start? <Link to="/" className="text-cyan-600 hover:underline">Book a service now</Link>.</p>
            </div>
        )}
      </div>
    </div>
    {reviewBooking && (
        <ReviewModal 
            booking={reviewBooking} 
            onClose={() => setReviewBooking(null)} 
            onReviewSubmitted={() => {
                setReviewBooking(null);
                fetchBookings(); // Refresh bookings to update UI
            }}
        />
    )}
    </>
  );
};