
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import * as ReactRouterDOM from 'react-router-dom';
import { Booking } from '../types';
import { Database } from '../database.types';

const { useNavigate } = ReactRouterDOM as any;

const STATUS_COLORS: { [key: string]: string } = {
  'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  'Awaiting Payment': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  'In Review': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  'Requires Action': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  'Approved': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  'Completed': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
};


export const ProfilePage: React.FC = () => {
  const { user, profile, refetchProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  
  // Form state, managed separately
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [mobile, setMobile] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Effect to initialize or reset form state when `isEditing` changes or profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setDob(profile.dob || '');
      setMobile(profile.mobile_number || '');
    }
  }, [profile, isEditing]);


  useEffect(() => {
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

    if (user) {
        fetchBookings();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormLoading(true);
    setMessage('');

    try {
        const updatePayload = {
            full_name: fullName,
            dob,
            mobile_number: mobile,
        };
      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id);

      if (error) throw error;
      
      await refetchProfile();
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

  if (authLoading) {
      return <div className="text-center p-10">Loading profile...</div>;
  }

  return (
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
        <div className="flex justify-between items-start">
             <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Personal Information</h2>
                 {profile?.cod_enabled && (
                    <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zM12 15a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                        COD Eligible
                    </div>
                )}
             </div>
             {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="font-semibold text-cyan-600 hover:underline flex-shrink-0">Edit Profile</button>
             )}
        </div>
        
        {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4 animate-fade-in">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                    <input 
                        type="text" 
                        id="fullName" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" 
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="dob" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Date of Birth</label>
                        <input 
                            type="date" 
                            id="dob" 
                            value={dob} 
                            onChange={(e) => setDob(e.target.value)} 
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" 
                        />
                    </div>
                    <div>
                        <label htmlFor="mobile" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Mobile Number</label>
                        <input 
                            type="tel" 
                            id="mobile" 
                            value={mobile} 
                            onChange={(e) => setMobile(e.target.value)} 
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" 
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    {message && <p className={`text-sm font-medium ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
                    <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition">
                        Cancel
                    </button>
                    <button type="submit" disabled={formLoading} className="px-5 py-2.5 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 disabled:bg-slate-400 transition">
                        {formLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 <InfoCard title="Full Name" value={profile?.full_name ?? ''} />
                 <InfoCard title="Email" value={profile?.email ?? ''} />
                 <InfoCard title="Date of Birth" value={profile?.dob ? new Date(profile.dob).toLocaleDateString() : ''} />
                 <InfoCard title="Mobile Number" value={profile?.mobile_number ?? ''} />
            </div>
        )}
      </div>

      {/* Booking History Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">My Bookings</h2>
        {bookingsLoading ? (
            <div className="text-center p-10">Loading bookings...</div>
        ) : bookings.length > 0 ? (
            <div className="space-y-4">
                {bookings.map(booking => (
                    <div key={booking.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                            <p className="font-bold text-lg text-slate-800 dark:text-slate-200">{booking.services?.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Booked on: {new Date(booking.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                                ID: NME-{String(booking.id).padStart(6, '0')}
                            </p>
                        </div>
                        <div className="flex-shrink-0 mt-3 sm:mt-0 text-right">
                           <span className={`px-3 py-1.5 text-sm font-bold rounded-full ${STATUS_COLORS[booking.status] || 'bg-slate-100 text-slate-800'}`}>
                                {booking.status}
                           </span>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center p-10 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="font-semibold">You have no booking history.</p>
                <p className="text-sm text-slate-500 mt-1">Ready to start? <a href="#/" className="text-cyan-600 hover:underline">Book a service now</a>.</p>
            </div>
        )}
      </div>
    </div>
  );
};