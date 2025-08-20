
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Booking } from '../../types';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM as any;

const StatCard: React.FC<{ title: string; value: number | null; loading: boolean, icon: React.ReactNode, delay: number, color: string }> = ({ title, value, loading, icon, delay, color }) => (
    <div 
      className="bg-admin-surface-glass border border-admin-border backdrop-blur-2xl p-6 rounded-2xl shadow-xl shadow-black/10 flex items-center gap-5 animate-list-item-in group"
      style={{ animationDelay: `${delay}ms`}}
    >
        <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-admin-accent-light text-admin-accent flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-admin-accent/20`}>
            {icon}
        </div>
        <div>
            <h3 className="text-base font-semibold text-admin-light uppercase tracking-wider font-mono">{title}</h3>
            {loading ? (
                <div className="h-10 w-24 bg-admin-light/10 animate-pulse rounded-md mt-2"></div>
            ) : (
                <p className="text-4xl font-extrabold text-admin-heading mt-1">{value ?? 'N/A'}</p>
            )}
        </div>
    </div>
);


const BOOKING_STATUSES = ['Pending', 'Awaiting Payment', 'In Review', 'Requires Action', 'Approved', 'Rejected', 'Completed'];
const STATUS_COLORS: { [key: string]: string } = {
  'Pending': 'bg-yellow-400',
  'Awaiting Payment': 'bg-sky-400',
  'In Review': 'bg-blue-400',
  'Requires Action': 'bg-orange-400',
  'Approved': 'bg-green-400',
  'Rejected': 'bg-red-400',
  'Completed': 'bg-purple-400',
};

const STATUS_TEXT_COLORS: { [key: string]: string } = {
  'Pending': 'text-yellow-400',
  'Awaiting Payment': 'text-sky-400',
  'In Review': 'text-blue-400',
  'Requires Action': 'text-orange-400',
  'Approved': 'text-green-400',
  'Rejected': 'text-red-400',
  'Completed': 'text-purple-400',
};


const StatsChart: React.FC<{ bookings: Pick<Booking, 'status'>[], loading: boolean }> = ({ bookings, loading }) => {
    const [statusCounts, setStatusCounts] = useState<{[key: string]: number}>({});
    
    useEffect(() => {
        const counts = BOOKING_STATUSES.reduce((acc, status) => ({...acc, [status]: 0}), {});
        bookings.forEach(b => {
            if (counts[b.status] !== undefined) {
                counts[b.status]++;
            }
        });
        setStatusCounts(counts);
    }, [bookings]);

    const maxCount = Math.max(...Object.values(statusCounts), 1); // Avoid division by zero

    return (
       <div className="bg-admin-surface-glass border border-admin-border backdrop-blur-2xl p-6 rounded-2xl shadow-xl shadow-black/10 animate-list-item-in" style={{ animationDelay: '150ms' }}>
           <h3 className="text-xl font-bold text-admin-heading mb-6">Bookings by Status</h3>
            {loading ? (
                <div className="space-y-4">
                    {Array.from({length: 4}).map((_, i) => <div key={i} className="h-8 bg-admin-light/10 animate-pulse rounded-md"></div>)}
                </div>
            ) : (
                <div className="space-y-4">
                    {BOOKING_STATUSES.map((status, index) => (
                        <div key={status} className="flex items-center gap-4 group" style={{ animation: `list-item-in 0.5s ease-out ${index * 50}ms forwards`, opacity: 0 }}>
                            <div className="w-32 text-sm font-semibold text-admin-light truncate">{status}</div>
                            <div className="flex-1 bg-admin-light/10 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className={`h-full ${STATUS_COLORS[status] || 'bg-slate-400'} rounded-full transition-all duration-700 ease-out`}
                                    style={{ width: `${(statusCounts[status] / maxCount) * 100}%`}}
                                >
                                </div>
                            </div>
                            <div className="w-10 text-right font-bold font-mono text-admin-heading">{statusCounts[status]}</div>
                        </div>
                    ))}
                </div>
            )}
       </div>
    );
};

interface RecentBooking {
    id: number;
    created_at: string;
    status: string;
    services: { name: string; } | null;
    profiles: { full_name: string | null; } | null;
}

const RecentBookings: React.FC = () => {
    const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('id, created_at, status, services(name), profiles(full_name)')
                    .order('created_at', { ascending: false })
                    .limit(5);
                if (error) throw error;
                setRecentBookings((data as unknown as RecentBooking[]) || []);
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchRecent();
    }, []);

    return (
        <div className="bg-admin-surface-glass border border-admin-border backdrop-blur-2xl rounded-2xl shadow-xl shadow-black/10 overflow-hidden animate-list-item-in" style={{ animationDelay: '200ms' }}>
             <h3 className="text-xl font-bold text-admin-heading p-6">Recent Bookings</h3>
            <div className="overflow-x-auto">
                 <div className="w-full text-left text-sm">
                        {loading ? (
                             Array.from({length: 5}).map((_, i) => (
                                <div key={i} className="border-t border-admin-border p-4"><div className="h-8 bg-admin-light/10 animate-pulse rounded-md"></div></div>
                            ))
                        ) : recentBookings.length === 0 ? (
                            <div className="p-6 text-center text-admin-light">No bookings yet.</div>
                        ) : (
                            recentBookings.map((booking, index) => (
                                <Link to="/admin/bookings" key={booking.id} className="flex justify-between items-center p-4 border-t border-admin-border hover:bg-admin-accent-light transition-colors" style={{ animation: `list-item-in 0.5s ease-out ${index * 50}ms forwards`, opacity: 0 }}>
                                    <div>
                                        <div className="font-bold text-admin-heading">{booking.profiles?.full_name || 'N/A'}</div>
                                        <div className="text-admin-light">{booking.services?.name || 'Unknown'}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full bg-admin-light/10 ${STATUS_TEXT_COLORS[booking.status] || 'text-admin-light'}`}>{booking.status}</span>
                                        <div className="text-xs text-admin-light/50 mt-1 font-mono">{new Date(booking.created_at).toLocaleDateString()}</div>
                                    </div>
                                </Link>
                            ))
                        )}
                 </div>
            </div>
             <div className="p-4 text-center bg-admin-surface/50 border-t border-admin-border">
                <Link to="/admin/bookings" className="text-sm font-bold text-admin-accent hover:underline">View All Bookings</Link>
            </div>
        </div>
    );
};


const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({ services: 0, users: 0 });
  const [allBookings, setAllBookings] = useState<Pick<Booking, 'id' | 'status'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [
          { count: servicesCount, error: sErr },
          { data: bookingsData, error: bErr },
          { count: usersCount, error: uErr }
        ] = await Promise.all([
          supabase.from('services').select('*', { count: 'exact', head: true }),
          supabase.from('bookings').select('id, status'), // Fetch all for chart
          supabase.from('profiles').select('*', { count: 'exact', head: true })
        ]);

        if (sErr || bErr || uErr) {
            const error = sErr || bErr || uErr;
            console.error("Error fetching dashboard stats:", error.message, error);
            throw new Error('Failed to fetch stats');
        }

        setStats({
          services: servicesCount ?? 0,
          users: usersCount ?? 0,
        });
        setAllBookings((bookingsData as Pick<Booking, 'id' | 'status'>[]) || []);

      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
        <h1 className="text-4xl font-extrabold text-admin-heading tracking-tight">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard delay={0} title="Total Services" value={stats.services} loading={loading} color="admin-purple" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
            <StatCard delay={50} title="Total Bookings" value={allBookings.length} loading={loading} color="admin-accent" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} />
            <StatCard delay={100} title="Registered Users" value={stats.users} loading={loading} color="admin-pink" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" /></svg>} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
             <div className="lg:col-span-3">
                <StatsChart bookings={allBookings} loading={loading} />
             </div>
             <div className="lg:col-span-2">
                <RecentBookings />
             </div>
        </div>
    </div>
  );
};

export default AdminDashboardPage;