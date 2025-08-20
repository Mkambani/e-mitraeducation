import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Booking } from '../../types';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Link } = ReactRouterDOM as any;

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-admin-card-bg p-5 rounded-xl shadow-sm border border-admin-card-border flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-admin-light font-medium">{title}</p>
            <p className="text-2xl font-bold text-admin-heading">{value}</p>
        </div>
    </div>
);

const LineChartPlaceholder: React.FC = () => (
    <svg className="w-full h-64" viewBox="0 0 400 150" preserveAspectRatio="none">
      <defs>
        <linearGradient id="line-chart-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Grid lines */}
      <line x1="0" y1="0" x2="0" y2="150" stroke="#E5E7EB" strokeWidth="0.5" className="dark:stroke-gray-700"/>
      <line x1="0" y1="130" x2="400" y2="130" stroke="#E5E7EB" strokeWidth="0.5" className="dark:stroke-gray-700"/>
      <line x1="0" y1="80" x2="400" y2="80" stroke="#E5E7EB" strokeWidth="0.5" className="dark:stroke-gray-700"/>
      <line x1="0" y1="30" x2="400" y2="30" stroke="#E5E7EB" strokeWidth="0.5" className="dark:stroke-gray-700"/>
      {/* Chart Path */}
      <path d="M 0 100 Q 50 80, 100 90 T 200 100 T 300 60 T 400 70" stroke="#22c55e" fill="none" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M 0 100 Q 50 80, 100 90 T 200 100 T 300 60 T 400 70 L 400 150 L 0 150 Z" fill="url(#line-chart-gradient)"/>
    </svg>
);

const DonutChartPlaceholder: React.FC<{ values: { color: string; value: number }[] }> = ({ values }) => {
    const total = values.reduce((sum, item) => sum + item.value, 0);
    let cumulative = 0;

    return (
        <svg className="w-48 h-48" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.915" fill="none" className="stroke-current text-gray-200 dark:text-gray-700" strokeWidth="3"></circle>
            {values.map((item, index) => {
                const dasharray = (item.value / total) * 100;
                const dashoffset = 25 - cumulative;
                cumulative += dasharray;
                return (
                    <circle
                        key={index}
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        className={`stroke-current ${item.color}`}
                        strokeWidth="3.5"
                        strokeDasharray={`${dasharray} ${100 - dasharray}`}
                        strokeDashoffset={dashoffset}
                        transform="rotate(-90 18 18)"
                    ></circle>
                );
            })}
             <text x="18" y="20" className="fill-current text-admin-heading text-[8px] font-bold" textAnchor="middle">
                {total}
            </text>
        </svg>
    );
};

const AdminDashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const [statusCounts, setStatusCounts] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('bookings').select('status');
        if (error) throw error;
        
        const counts = (data as {status: string}[]).reduce((acc, {status}) => {
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as {[key: string]: number});
        
        setStatusCounts(counts);

      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const analyticsCards = [
      { title: 'Pending', value: statusCounts['Pending'] || 0, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'bg-yellow-100 text-yellow-600' },
      { title: 'Approved', value: statusCounts['Approved'] || 0, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'bg-green-100 text-green-600' },
      { title: 'Completed', value: statusCounts['Completed'] || 0, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>, color: 'bg-purple-100 text-purple-600' },
      { title: 'Rejected', value: statusCounts['Rejected'] || 0, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'bg-red-100 text-red-600' }
  ];
  
  const donutData = [
      { color: 'text-yellow-400', value: statusCounts['Pending'] || 0, label: 'Pending' },
      { color: 'text-blue-400', value: statusCounts['In Review'] || 0, label: 'Ongoing' },
      { color: 'text-green-400', value: statusCounts['Completed'] || 0, label: 'Completed' },
      { color: 'text-red-400', value: statusCounts['Rejected'] || 0, label: 'Rejected' },
  ];

  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-admin-heading">Welcome, {profile?.full_name?.split(' ')[0] || 'Admin'}!</h2>
            <p className="text-admin-light">Monitor your business analytics and statistics</p>
        </div>

        {/* Business Analytics */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-admin-heading">Business Analytics</h3>
            {loading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({length: 4}).map((_, i) => <div key={i} className="h-24 bg-admin-card-bg rounded-xl animate-pulse"></div>)}
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {analyticsCards.map(card => <StatCard key={card.title} {...card} />)}
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Statistics */}
            <div className="lg:col-span-2 bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-admin-heading">Order Statistics</h3>
                    <div className="flex gap-1 bg-admin-main-bg p-1 rounded-lg">
                        <button className="px-3 py-1 text-xs font-semibold rounded-md bg-admin-card-bg text-admin-accent shadow-sm">This Year</button>
                        <button className="px-3 py-1 text-xs font-semibold rounded-md text-admin-light">This Month</button>
                        <button className="px-3 py-1 text-xs font-semibold rounded-md text-admin-light">This Week</button>
                    </div>
                </div>
                <LineChartPlaceholder/>
            </div>

            {/* Order Status Statistics */}
            <div className="bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border">
                <h3 className="font-semibold text-admin-heading mb-4">Order Status Statistics</h3>
                <div className="flex justify-center items-center">
                    <DonutChartPlaceholder values={donutData} />
                </div>
                <div className="mt-4 space-y-2">
                   {donutData.map(item => (
                       <div key={item.label} className="flex items-center justify-between text-sm">
                           <div className="flex items-center gap-2">
                               <div className={`w-3 h-3 rounded-full ${item.color.replace('text-', 'bg-')}`}></div>
                               <span className="text-admin-light">{item.label}</span>
                           </div>
                           <span className="font-semibold text-admin-heading">{item.value}</span>
                       </div>
                   ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default AdminDashboardPage;
