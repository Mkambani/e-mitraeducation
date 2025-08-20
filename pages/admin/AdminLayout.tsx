







import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const { NavLink, Outlet, useLocation } = ReactRouterDOM as any;

// --- ICONS ---
const DashboardIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 4.5a.75.75 0 00-1.5 0v15a.75.75 0 001.5 0v-15z" /><path d="M4.5 10.5a.75.75 0 00-1.5 0v9a.75.75 0 001.5 0v-9z" /><path d="M16.5 7.5a.75.75 0 00-1.5 0v12a.75.75 0 001.5 0v-12z" /></svg>;
const ServicesIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V3.375c0-1.036-.84-1.875-1.875-1.875H5.625zM12.75 17.25a.75.75 0 000-1.5H8.25a.75.75 0 000 1.5h4.5zM12 14.25a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H12.75a.75.75 0 01-.75-.75zM8.25 10.5a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5H8.25z" /></svg>;
const PromoIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.75 2.25a.75.75 0 00.187 1.35l3.822 1.274a.75.75 0 00.86-.334l.215-.43a.75.75 0 00-.93-.93l-.43.215a.75.75 0 00-.333.86l-1.275-3.823a.75.75 0 00-1.35-.187zM11.603 4.23a.75.75 0 00-1.012-.246l-2.618 1.488a.75.75 0 000 1.32l2.618 1.488a.75.75 0 001.012-.246l1.246-2.18a.75.75 0 000-1.072l-1.246-2.18zM6.9 8.925a.75.75 0 00-1.35.187l-1.275 3.823a.75.75 0 00.86.86l.215-.43a.75.75 0 00-.93-.93l.43.215a.75.75 0 00.86-.334l3.823-1.274a.75.75 0 00-.187-1.35L6.9 8.925z" /><path d="M6.082 17.925a3 3 0 104.243 4.243 3 3 0 00-4.243-4.243zM8.197 18.26a.75.75 0 011.06 0l.707.707a.75.75 0 010 1.06l-.707.707a.75.75 0 01-1.06 0l-.707-.707a.75.75 0 010-1.06l.707-.707z" /></svg>;
const BookingsIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M3.75 4.5a.75.75 0 01.75-.75h15a.75.75 0 01.75.75v15a.75.75 0 01-.75-.75h-15a.75.75 0 01-.75-.75V4.5zM8.25 6a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H8.25zM8.25 10.5a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H8.25zM8.25 15a.75.75 0 000 1.5h3.75a.75.75 0 000-1.5H8.25z" clipRule="evenodd" /></svg>;
const UsersIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM5.25 15.375a3.75 3.75 0 00-3.75 3.75v.625c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-.625a3.75 3.75 0 00-3.75-3.75H5.25zM14.25 15.375a3.75 3.75 0 00-3.75 3.75v.625c0 .621.504 1.125 1.125 1.125h5.25c.621 0 1.125-.504 1.125-1.125v-.625a3.75 3.75 0 00-3.75-3.75h-1.5z" /></svg>;
const NotificationsIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.25 2.25a.75.75 0 00-1.5 0v1.5c-2.383.478-4.444 2.14-5.59 4.313-.23.435-.165.968.163 1.348l.394.463c.27.318.495.688.643 1.094.148.406.22.848.22 1.292v.266a.75.75 0 01-1.5 0v-.266c0-.645-.105-1.28-.309-1.883a4.42 4.42 0 01-.67-1.423l-.395-.463a1.765 1.765 0 01-.37-1.58C1.516 6.905 3.51 4.79 5.86 3.903L6 3.75a.75.75 0 000-1.5H5.25a.75.75 0 000 1.5h.03a6.992 6.992 0 006.945 6.945.75.75 0 001.5 0A6.992 6.992 0 0012 3.75h.03a.75.75 0 000-1.5H12a.75.75 0 00-.75.75v.03A6.992 6.992 0 004.305 12H3.75a.75.75 0 000 1.5h.555a6.992 6.992 0 006.945 6.945.75.75 0 001.5 0A6.992 6.992 0 0018.695 12h.555a.75.75 0 000-1.5h-.555A6.992 6.992 0 0011.25 3.75V2.25z" /><path d="M14.5 9a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" /></svg>;
const PaymentIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15z" /><path d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zM12 12.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75z" /></svg>;
const SettingsIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85a1.5 1.5 0 00.92 1.83l.84.42a1.5 1.5 0 001.83-.92l.18-1.03a1.5 1.5 0 00-1.49-1.88l-1.03.18a.75.75 0 01-.62.36v-.38a.75.75 0 01.62-.36l.38.21a.75.75 0 00.92-.18l.84-.84a.75.75 0 00.18-.92l-.21-.38a.75.75 0 00-.36-.62l-1.03.18a1.5 1.5 0 00-1.88-1.49l.18-1.03A1.875 1.875 0 0011.078 2.25zM12.922 2.25c.917 0 1.699.663 1.85 1.567L14.95 5.85a1.5 1.5 0 01-.92 1.83l-.84.42a1.5 1.5 0 01-1.83-.92l-.18-1.03a1.5 1.5 0 011.49-1.88l1.03.18a.75.75 0 00.62.36v-.38a.75.75 0 00-.62-.36l-.38.21a.75.75 0 01-.92-.18l-.84-.84a.75.75 0 01-.18-.92l.21-.38a.75.75 0 01.36-.62l1.03.18a1.5 1.5 0 011.88-1.49l-.18-1.03A1.875 1.875 0 0112.922 2.25zM21 11.078c0 .917-.663 1.699-1.567 1.85l-2.03.18a1.5 1.5 0 00-1.83.92l-.42.84a1.5 1.5 0 00.92 1.83l1.03.18a1.5 1.5 0 001.88-1.49l-.18 1.03c.24 1.35.36 2.7.36 4.05v.38c0 .414-.336.75-.75.75h-.38c-1.35 0-2.7-.12-4.05-.36l-1.03.18a1.5 1.5 0 01-1.49-1.88l.18-1.03a1.5 1.5 0 01.92-1.83l.84-.42a1.5 1.5 0 01.92-1.83l-.84-.84a.75.75 0 00-.92.18l-.38-.21a.75.75 0 00-.36.62l.18 1.03a1.5 1.5 0 01-1.88 1.49l-1.03-.18a1.5 1.5 0 00-1.83.92l-.42-.84a1.5 1.5 0 00-1.83-.92l-1.03-.18a.75.75 0 01-.62-.36v.38a.75.75 0 01.62.36l.38-.21a.75.75 0 01.92.18l.84.84a.75.75 0 01.18.92l-.21.38a.75.75 0 01-.36.62l-1.03-.18a1.5 1.5 0 00-1.88 1.49l-.18-1.03A1.875 1.875 0 012.25 12.922v-1.844c0-.917.663-1.699 1.567-1.85l2.03-.18a1.5 1.5 0 001.83-.92l.42-.84a1.5 1.5 0 00-.92-1.83l-1.03-.18a1.5 1.5 0 00-1.88 1.49l.18-1.03A1.875 1.875 0 013 7.078V6.69c0-.414.336-.75.75-.75h.38c1.35 0 2.7.12 4.05.36l1.03-.18a1.5 1.5 0 011.49 1.88l-.18 1.03a1.5 1.5 0 01-.92 1.83l-.84.42a1.5 1.5 0 01-.92 1.83l.84.84a.75.75 0 00.92-.18l.38.21a.75.75 0 00.36-.62l-.18-1.03a1.5 1.5 0 011.88-1.49l1.03.18a1.5 1.5 0 001.83-.92l.42.84a1.5 1.5 0 001.83.92l1.03.18a.75.75 0 01.62.36v-.38a.75.75 0 01-.62-.36l-.38-.21a.75.75 0 01-.92-.18l-.84-.84a.75.75 0 01-.18-.92l.21-.38a.75.75 0 01.36-.62l1.03.18a1.5 1.5 0 001.88-1.49l.18 1.03A1.875 1.875 0 0121 11.078z" clipRule="evenodd" /></svg>;

const navItems = [
  { name: 'Dashboard', href: '/admin', end: true, icon: DashboardIcon },
  { name: 'Services', href: '/admin/services', end: false, icon: ServicesIcon },
  { name: 'Promo Banner', href: '/admin/promo-banner', end: false, icon: PromoIcon },
  { name: 'Bookings', href: '/admin/bookings', end: false, icon: BookingsIcon },
  { name: 'Users', href: '/admin/users', end: false, icon: UsersIcon },
  { name: 'Notifications', href: '/admin/notifications', end: false, icon: NotificationsIcon },
  { name: 'Payment Gateways', href: '/admin/payment-gateways', end: false, icon: PaymentIcon },
  { name: 'App Settings', href: '/admin/settings', end: false, icon: SettingsIcon },
];

const AdminLayout: React.FC = () => {
    const location = useLocation();

    // Effect to toggle a class on the body for admin-specific global styles
    useEffect(() => {
        document.body.classList.add('admin-panel-active');
        return () => {
            document.body.classList.remove('admin-panel-active');
        }
    }, []);

  return (
    <div className="font-admin text-admin-light bg-admin-bg min-h-screen relative overflow-hidden transition-colors duration-500">
        {/* Animated Gradient Mesh Background */}
        <div className="gradient-mesh-bg"></div>
        <style>{`
          .gradient-mesh-bg {
              position: fixed;
              top: 0; left: 0; right: 0; bottom: 0;
              background-image:
                  radial-gradient(at 27% 37%, var(--admin-accent-light) 0px, transparent 50%),
                  radial-gradient(at 97% 21%, var(--admin-accent-light) 0px, transparent 50%),
                  radial-gradient(at 52% 99%, var(--admin-accent-light) 0px, transparent 50%),
                  radial-gradient(at 10% 29%, var(--admin-accent-light) 0px, transparent 50%),
                  radial-gradient(at 97% 96%, var(--admin-accent-light) 0px, transparent 50%),
                  radial-gradient(at 33% 50%, var(--admin-accent-light) 0px, transparent 50%),
                  radial-gradient(at 79% 53%, var(--admin-accent-light) 0px, transparent 50%);
              background-size: 300% 300%;
              animation: gradient-mesh 15s ease-in-out infinite;
              z-index: 0;
              transition: opacity 0.5s;
          }
          body.admin-panel-active {
            background-color: var(--admin-bg);
          }
        `}</style>
      
        <div className="relative z-10 flex flex-col md:flex-row gap-8 lg:gap-12">
            {/* Sidebar */}
            <aside className="md:w-64 flex-shrink-0">
                <div className="sticky top-24 bg-admin-surface-glass backdrop-blur-3xl p-4 rounded-3xl border border-admin-border shadow-2xl shadow-black/20">
                    <h2 className="text-sm font-bold text-admin-light/70 mb-4 px-2 uppercase tracking-widest font-mono">Control Panel</h2>
                    <nav className="flex flex-col gap-1.5">
                        {navItems.map((item, index) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                end={item.end}
                                style={{ animationDelay: `${index * 50}ms` }}
                                className="flex items-center gap-4 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ease-in-out group relative animate-list-item-in text-admin-light hover:text-admin-heading hover:bg-admin-accent-light"
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${isActive ? 'bg-admin-accent-light' : ''}`}></div>
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-admin-accent rounded-r-full transition-transform duration-300 ease-out-expo ${isActive ? 'scale-y-100' : 'scale-y-0'}`}></div>
                                        
                                        <item.icon className={`relative h-6 w-6 transition-colors ${isActive ? 'text-admin-accent' : 'text-admin-light/70 group-hover:text-admin-heading'}`} />
                                        <span className={`relative transition-colors ${isActive ? 'text-admin-heading' : ''}`}>{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main key={location.pathname} className="flex-1 min-w-0 animate-content-in">
                <Outlet />
            </main>
        </div>
    </div>
  );
};

export default AdminLayout;