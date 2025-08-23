import React, { useEffect, useMemo, useState, useContext } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ServiceContext } from '../../context/ServiceContext';
import { supabase } from '../../supabaseClient';

const { NavLink, Outlet, useLocation, Link } = ReactRouterDOM as any;

// --- ICONS ---
const DashboardIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 4.5a.75.75 0 00-1.5 0v15a.75.75 0 001.5 0v-15z" /><path d="M4.5 10.5a.75.75 0 00-1.5 0v9a.75.75 0 001.5 0v-9z" /><path d="M16.5 7.5a.75.75 0 00-1.5 0v12a.75.75 0 001.5 0v-12z" /></svg>;
const IncomeIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7.5a.75.75 0 01.75.75v5.44l1.72-1.72a.75.75 0 111.06 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06l1.72 1.72V8.25A.75.75 0 0112 7.5z" /><path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zM3 5.625a.375.375 0 01.375-.375h17.25a.375.375 0 01.375.375v12.75a.375.375 0 01-.375.375H3.375a.375.375 0 01-.375-.375V5.625z" clipRule="evenodd" /></svg>;
const TransactionsIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M15.97 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06L18.88 9.5H4.75a.75.75 0 010-1.5h14.13L15.97 3.53a.75.75 0 010-1.06zm-7.94 9a.75.75 0 010 1.06L4.12 16.5h14.13a.75.75 0 010 1.5H4.12l3.91 3.97a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 0z" clipRule="evenodd" /></svg>;
const ServicesIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V3.375c0-1.036-.84-1.875-1.875-1.875H5.625zM12.75 17.25a.75.75 0 000-1.5H8.25a.75.75 0 000 1.5h4.5zM12 14.25a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H12.75a.75.75 0 01-.75-.75zM8.25 10.5a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5H8.25z" /></svg>;
const MessagesIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" /><path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" /></svg>;
const ReviewsIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354l-4.592 2.81c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>;
const PromoIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.75 2.25a.75.75 0 00.187 1.35l3.822 1.274a.75.75 0 00.86-.334l.215-.43a.75.75 0 00-.93-.93l-.43.215a.75.75 0 00-.333.86l-1.275-3.823a.75.75 0 00-1.35-.187zM11.603 4.23a.75.75 0 00-1.012-.246l-2.618 1.488a.75.75 0 000 1.32l2.618 1.488a.75.75 0 001.012-.246l1.246-2.18a.75.75 0 000-1.072l-1.246-2.18zM6.9 8.925a.75.75 0 00-1.35.187l-1.275 3.823a.75.75 0 00.86.86l.215-.43a.75.75 0 00-.93-.93l.43.215a.75.75 0 00.86-.334l3.823-1.274a.75.75 0 00-.187-1.35L6.9 8.925z" /><path d="M6.082 17.925a3 3 0 104.243 4.243 3 3 0 00-4.243-4.243zM8.197 18.26a.75.75 0 011.06 0l.707.707a.75.75 0 010 1.06l-.707.707a.75.75 0 01-1.06 0l-.707-.707a.75.75 0 010-1.06l.707-.707z" /></svg>;
const BookingsIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M3.75 4.5a.75.75 0 01.75-.75h15a.75.75 0 01.75.75v15a.75.75 0 01-.75-.75h-15a.75.75 0 01-.75-.75V4.5zM8.25 6a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H8.25zM8.25 10.5a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H8.25zM8.25 15a.75.75 0 000 1.5h3.75a.75.75 0 000-1.5H8.25z" clipRule="evenodd" /></svg>;
const UsersIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM5.25 15.375a3.75 3.75 0 00-3.75 3.75v.625c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-.625a3.75 3.75 0 00-3.75-3.75H5.25zM14.25 15.375a3.75 3.75 0 00-3.75 3.75v.625c0 .621.504 1.125 1.125 1.125h5.25c.621 0 1.125-.504 1.125-1.125v-.625a3.75 3.75 0 00-3.75-3.75h-1.5z" /></svg>;
const NotificationsIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.25 2.25a.75.75 0 00-1.5 0v1.5c-2.383.478-4.444 2.14-5.59 4.313-.23.435-.165.968.163 1.348l.394.463c.27.318.495.688.643 1.094.148.406.22.848.22 1.292v.266a.75.75 0 01-1.5 0v-.266c0-.645-.105-1.28-.309-1.883a4.42 4.42 0 01-.67-1.423l-.395-.463a1.765 1.765 0 01-.37-1.58C1.516 6.905 3.51 4.79 5.86 3.903L6 3.75a.75.75 0 000-1.5H5.25a.75.75 0 000 1.5h.03a6.992 6.992 0 006.945 6.945.75.75 0 001.5 0A6.992 6.992 0 0012 3.75h.03a.75.75 0 000-1.5H12a.75.75 0 00-.75.75v.03A6.992 6.992 0 004.305 12H3.75a.75.75 0 000 1.5h.555a6.992 6.992 0 006.945 6.945.75.75 0 001.5 0A6.992 6.992 0 0018.695 12h.555a.75.75 0 000-1.5h-.555A6.992 6.992 0 0011.25 3.75V2.25z" /><path d="M14.5 9a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" /></svg>;
const PaymentIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15z" /><path d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zM12 12.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75z" /></svg>;
const SettingsIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85a1.5 1.5 0 00.92 1.83l.84.42a1.5 1.5 0 001.83-.92l.18-1.03a1.5 1.5 0 00-1.49-1.88l-1.03.18a.75.75 0 01-.62.36v-.38a.75.75 0 01.62-.36l.38.21a.75.75 0 00.92-.18l.84-.84a.75.75 0 00.18-.92l-.21-.38a.75.75 0 00-.36-.62l-1.03.18a1.5 1.5 0 00-1.88-1.49l.18-1.03A1.875 1.875 0 0011.078 2.25zM12.922 2.25c.917 0 1.699.663 1.85 1.567L14.95 5.85a1.5 1.5 0 01-.92 1.83l-.84.42a1.5 1.5 0 01-1.83-.92l-.18-1.03a1.5 1.5 0 011.49-1.88l1.03.18a.75.75 0 00.62.36v-.38a.75.75 0 00-.62-.36l-.38.21a.75.75 0 01-.92-.18l-.84-.84a.75.75 0 01-.18-.92l.21-.38a.75.75 0 01.36-.62l1.03.18a1.5 1.5 0 011.88-1.49l-.18-1.03A1.875 1.875 0 0112.922 2.25zM21 11.078c0 .917-.663 1.699-1.567 1.85l-2.03.18a1.5 1.5 0 00-1.83.92l-.42.84a1.5 1.5 0 00.92 1.83l1.03.18a1.5 1.5 0 001.88-1.49l-.18 1.03c.24 1.35.36 2.7.36 4.05v.38c0 .414-.336.75-.75.75h-.38c-1.35 0-2.7-.12-4.05-.36l-1.03.18a1.5 1.5 0 01-1.49-1.88l.18-1.03a1.5 1.5 0 01.92-1.83l.84-.42a1.5 1.5 0 01.92-1.83l-.84-.84a.75.75 0 00-.92.18l-.38-.21a.75.75 0 00-.36.62l.18 1.03a1.5 1.5 0 01-1.88 1.49l-1.03-.18a1.5 1.5 0 00-1.83.92l-.42-.84a1.5 1.5 0 00-1.83-.92l-1.03-.18a.75.75 0 01-.62-.36v.38a.75.75 0 01.62.36l.38-.21a.75.75 0 01.92.18l.84.84a.75.75 0 01.18.92l-.21.38a.75.75 0 01-.36.62l-1.03-.18a1.5 1.5 0 00-1.88 1.49l-.18-1.03A1.875 1.875 0 012.25 12.922v-1.844c0-.917.663-1.699 1.567-1.85l2.03-.18a1.5 1.5 0 001.83-.92l.42-.84a1.5 1.5 0 00-.92-1.83l-1.03-.18a1.5 1.5 0 00-1.88 1.49l.18-1.03A1.875 1.875 0 013 7.078V6.69c0-.414.336.75.75-.75h.38c1.35 0 2.7.12 4.05.36l1.03-.18a1.5 1.5 0 011.49 1.88l-.18 1.03a1.5 1.5 0 01-.92 1.83l-.84.42a1.5 1.5 0 01-.92 1.83l.84.84a.75.75 0 00.92-.18l.38.21a.75.75 0 00.36-.62l-.18-1.03a1.5 1.5 0 011.88-1.49l1.03.18a1.5 1.5 0 001.83-.92l.42.84a1.5 1.5 0 001.83.92l1.03.18a.75.75 0 01.62.36v-.38a.75.75 0 01-.62-.36l-.38-.21a.75.75 0 01-.92-.18l-.84-.84a.75.75 0 01-.18-.92l.21-.38a.75.75 0 01.36-.62l1.03.18a1.5 1.5 0 001.88-1.49l.18 1.03A1.875 1.875 0 0121 11.078z" clipRule="evenodd" /></svg>;
const AudioIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.097 3.097 3.097 8.13 0 11.228a.75.75 0 01-1.06-1.06 6.456 6.456 0 000-9.108.75.75 0 010-1.06z" /><path d="M16.466 7.224a.75.75 0 011.06 0 3.983 3.983 0 010 5.634.75.75 0 01-1.06-1.06 2.483 2.483 0 000-3.514.75.75 0 010-1.06z" /></svg>;


const navGroups = [
  {
    title: 'Management',
    items: [
      { name: 'Dashboard', href: '/admin', end: true, icon: DashboardIcon },
      { name: 'Income', href: '/admin/income', end: false, icon: IncomeIcon },
      { name: 'Transactions', href: '/admin/transactions', end: false, icon: TransactionsIcon },
      { name: 'Bookings', href: '/admin/bookings', end: false, icon: BookingsIcon },
      { name: 'Messages', href: '/admin/messages', end: false, icon: MessagesIcon },
      { name: 'Services', href: '/admin/services', end: false, icon: ServicesIcon },
      { name: 'Users', href: '/admin/users', end: false, icon: UsersIcon },
      { name: 'Reviews', href: '/admin/reviews', end: false, icon: ReviewsIcon },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { name: 'Promo Banner', href: '/admin/promo-banner', end: false, icon: PromoIcon },
      { name: 'Notifications', href: '/admin/notifications', end: false, icon: NotificationsIcon },
      { name: 'Payment Gateways', href: '/admin/payment-gateways', end: false, icon: PaymentIcon },
      { name: 'Audio Settings', href: '/admin/audio-settings', end: false, icon: AudioIcon },
      { name: 'App Settings', href: '/admin/settings', end: false, icon: SettingsIcon },
    ],
  },
];

const pageTitles: { [key: string]: string } = {
    '/admin': 'Dashboard',
    '/admin/income': 'Income Analytics',
    '/admin/transactions': 'Transaction History',
    '/admin/services': 'Manage Services',
    '/admin/promo-banner': 'Promo Banner',
    '/admin/bookings': 'All Bookings',
    '/admin/messages': 'Contact Messages',
    '/admin/users': 'User Management',
    '/admin/reviews': 'Manage Reviews',
    '/admin/notifications': 'Broadcast Notifications',
    '/admin/payment-gateways': 'Payment Gateways',
    '/admin/audio-settings': 'Audio Settings',
    '/admin/settings': 'Application Settings',
};


const AdminHeader: React.FC<{ title: string; onMenuClick: () => void; }> = ({ title, onMenuClick }) => {
    const { profile } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <button onClick={onMenuClick} className="p-2 -ml-2 text-admin-heading md:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-admin-heading">{title}</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <button
                    onClick={toggleTheme}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-admin-card-bg dark:hover:bg-admin-sidebar-active-bg transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> :
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    }
                </button>

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-admin-accent flex items-center justify-center font-bold text-white">
                        {profile?.full_name?.charAt(0) || 'A'}
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="font-semibold text-admin-heading">{profile?.full_name}</p>
                        <p className="text-xs text-admin-light">{profile?.role}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};


const AdminLayout: React.FC = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; service: string } | null>(null);
    const { settings } = useContext(ServiceContext);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    useEffect(() => {
        const channel = supabase.channel('new-bookings-channel')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, 
            (payload) => {
                const booking = payload.new as any;
                const soundUrl = settings.admin_booking_notification_sound;
                if (soundUrl) {
                    const audio = new Audio(soundUrl);
                    audio.play().catch(e => console.error("Admin audio notification failed:", e));
                }
                
                supabase.from('services').select('name').eq('id', booking.service_id).single().then(({data}) => {
                    setToast({ message: 'New Booking Received!', service: data?.name || 'a service' });
                });
            }
          )
          .subscribe();
        
        return () => {
          supabase.removeChannel(channel);
        };
    }, [settings.admin_booking_notification_sound]);

    const currentPageTitle = useMemo(() => {
        const path = location.pathname;
        for (const key in pageTitles) {
            if (path.startsWith(key) && (path.length === key.length || path[key.length] === '/')) {
                return pageTitles[key];
            }
        }
        return 'Admin';
    }, [location.pathname]);

  return (
    <div className="font-admin bg-admin-main-bg min-h-screen">
        <div className="flex">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden" 
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
            
            {/* Sidebar */}
            <aside className={`w-64 flex-shrink-0 bg-admin-sidebar-bg h-screen fixed top-0 left-0 flex flex-col p-4 z-40 transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Link to="/admin" className="flex items-center gap-2 px-2 pb-4 mb-4 border-b border-white/10">
                   <span className="font-bold text-2xl text-admin-sidebar-heading">Document</span>
                   <span className="font-bold text-2xl text-admin-sidebar-icon">mitra.</span>
                </Link>

                <div className="relative mb-4">
                    <input type="text" placeholder="Search..." className="w-full bg-black/20 text-admin-sidebar-text placeholder:text-admin-sidebar-text/60 rounded-lg py-2 pl-10 pr-4 text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-admin-sidebar-icon"/>
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-admin-sidebar-text/60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
                </div>

                <nav className="flex-1 overflow-y-auto space-y-4">
                    {navGroups.map((group) => (
                        <div key={group.title}>
                             <h3 className="px-2 mb-2 text-xs font-semibold text-admin-sidebar-text/50 uppercase tracking-wider">{group.title}</h3>
                             <div className="space-y-1">
                                {group.items.map(item => (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        end={item.end}
                                        className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ease-in-out group ${
                                            isActive ? 'bg-admin-sidebar-active-bg text-admin-sidebar-heading' : 'text-admin-sidebar-text hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <item.icon className="h-5 w-5"/>
                                        <span>{item.name}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                 <div className="pt-4 mt-4 border-t border-white/10">
                     <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-admin-sidebar-text hover:bg-white/10 hover:text-white">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25H14.25A.75.75 0 0115 10z" clipRule="evenodd" /></svg>
                        Back to Main Site
                     </Link>
                 </div>
            </aside>

            {/* Main Content */}
            <main key={location.pathname} className="flex-1 md:ml-64 p-6 md:p-8 lg:p-10 min-w-0">
                <div className="animate-content-in">
                    <AdminHeader title={currentPageTitle} onMenuClick={() => setIsSidebarOpen(true)} />
                    <div className="mt-8">
                        <Outlet />
                    </div>
                </div>
            </main>
            
            {toast && (
                <div className="fixed top-5 right-5 bg-admin-card-bg text-admin-heading p-4 rounded-lg shadow-lg border border-admin-card-border z-50 animate-slide-in-right">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-admin-accent/20 text-admin-accent flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        </div>
                        <div>
                            <p className="font-bold">{toast.message}</p>
                            <p className="text-sm text-admin-light">For {toast.service}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default AdminLayout;