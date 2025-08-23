import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { Booking } from '../../types';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-admin-card-bg p-5 rounded-xl shadow-sm border border-admin-card-border">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-admin-accent/20 text-admin-accent">
                {icon}
            </div>
            <div>
                <p className="text-sm text-admin-light font-medium">{title}</p>
                <p className="text-2xl font-bold text-admin-heading">{value}</p>
            </div>
        </div>
    </div>
);

const LineChartPlaceholder: React.FC = () => (
    <div className="w-full h-72 bg-admin-main-bg p-4 rounded-lg flex items-end">
        <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
            <defs>
                <linearGradient id="income-chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--admin-accent)" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="var(--admin-accent)" stopOpacity="0"/>
                </linearGradient>
            </defs>
            <path d="M 0 110 L 50 90 L 100 100 L 150 70 L 200 80 L 250 50 L 300 60 L 350 30 L 400 40" stroke="var(--admin-accent)" fill="none" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M 0 110 L 50 90 L 100 100 L 150 70 L 200 80 L 250 50 L 300 60 L 350 30 L 400 40 L 400 150 L 0 150 Z" fill="url(#income-chart-gradient)"/>
        </svg>
    </div>
);

const AdminIncomePage: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // '7d', '30d', '90d', 'all'

    useEffect(() => {
        const fetchIncomeData = async () => {
            setLoading(true);
            let query = supabase
                .from('bookings')
                .select('created_at, final_price, services(name)')
                .eq('status', 'Completed')
                .gt('final_price', 0);
            
            if (filter !== 'all') {
                const date = new Date();
                const daysToSubtract = parseInt(filter.replace('d', ''), 10);
                date.setDate(date.getDate() - daysToSubtract);
                query = query.gte('created_at', date.toISOString());
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) {
                console.error("Error fetching income data:", error);
                setBookings([]);
            } else {
                setBookings(data as any);
            }
            setLoading(false);
        };
        fetchIncomeData();
    }, [filter]);

    const { totalRevenue, completedBookings, avgBookingValue } = useMemo(() => {
        const total = bookings.reduce((sum, b) => sum + (b.final_price || 0), 0);
        const count = bookings.length;
        const avg = count > 0 ? total / count : 0;
        return { totalRevenue: total, completedBookings: count, avgBookingValue: avg };
    }, [bookings]);

    const topServices = useMemo(() => {
        const serviceRevenue = new Map<string, number>();
        bookings.forEach(b => {
            const serviceName = b.services?.name || 'Unknown Service';
            const currentRevenue = serviceRevenue.get(serviceName) || 0;
            serviceRevenue.set(serviceName, currentRevenue + (b.final_price || 0));
        });
        return Array.from(serviceRevenue.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [bookings]);

    const filterOptions = [
        { key: '7d', label: 'Last 7 Days' },
        { key: '30d', label: 'Last 30 Days' },
        { key: '90d', label: 'Last 90 Days' },
        { key: 'all', label: 'All Time' },
    ];
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex gap-1 bg-admin-card-bg p-1 rounded-lg border border-admin-card-border">
                    {filterOptions.map(opt => (
                        <button 
                            key={opt.key}
                            onClick={() => setFilter(opt.key)}
                            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === opt.key ? 'bg-admin-main-bg text-admin-accent shadow-sm' : 'text-admin-light hover:text-admin-heading'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({length: 3}).map((_, i) => <div key={i} className="h-24 bg-admin-card-bg rounded-xl animate-pulse"></div>)}
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                    <StatCard title="Completed Bookings" value={String(completedBookings)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                    <StatCard title="Avg. Booking Value" value={`₹${avgBookingValue.toFixed(2)}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11V9a2 2 0 00-2-2m2 4v4a2 2 0 104 0v-1m-4-3H9m2 0h4m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border">
                    <h3 className="text-lg font-semibold text-admin-heading mb-4">Revenue Over Time</h3>
                     <LineChartPlaceholder />
                </div>
                <div className="bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border">
                    <h3 className="text-lg font-semibold text-admin-heading mb-4">Top Services by Revenue</h3>
                    <div className="space-y-4">
                        {loading ? (
                             Array.from({length: 5}).map((_, i) => <div key={i} className="h-10 bg-admin-main-bg rounded-lg animate-pulse"></div>)
                        ) : topServices.length > 0 ? (
                            topServices.map(([name, revenue]) => (
                                <div key={name} className="flex justify-between items-center">
                                    <p className="font-medium text-admin-heading truncate pr-4">{name}</p>
                                    <p className="font-bold text-admin-accent">₹{revenue.toFixed(2)}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-admin-light/70 text-center py-8">No revenue data for this period.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminIncomePage;
