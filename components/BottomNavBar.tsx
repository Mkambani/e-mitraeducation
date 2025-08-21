
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { NavLink, Link, useLocation } = ReactRouterDOM as any;

const MenuPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const menuLinks = [
        { name: 'About Us', href: '/about' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Terms & Conditions', href: '/terms' },
    ];
    
    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
            <div className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-2xl shadow-2xl p-4 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Menu</h3>
                    <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <nav className="space-y-1">
                    {menuLinks.map(link => (
                         <Link key={link.name} to={link.href} onClick={onClose} className="flex items-center gap-4 p-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold transition-colors">
                            <span>{link.name}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
};

const BottomNavBar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navItems = user ? [
     { name: 'Home', href: '/', icon: HomeIcon },
     { name: 'Services', href: '/services', icon: ServicesIcon },
     { name: 'Profile', href: '/profile', icon: ProfileIcon },
  ] : [
     { name: 'Home', href: '/', icon: HomeIcon },
     { name: 'Services', href: '/services', icon: ServicesIcon },
     { name: 'Login', href: '/login', icon: LoginIcon },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 md:hidden z-40">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-4">
          {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${
                    isActive
                      ? 'text-cyan-500 dark:text-cyan-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`
                }
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-bold tracking-tight">{item.name}</span>
              </NavLink>
          ))}
          <button
              onClick={() => setIsMenuOpen(true)}
              className="flex flex-col items-center justify-center gap-1 transition-colors duration-200 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
              <MenuIcon className="h-6 w-6" />
              <span className="text-xs font-bold tracking-tight">Menu</span>
          </button>
        </div>
      </div>
      <MenuPanel isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};


// --- ICONS ---
function HomeIcon(props: { className?: string }) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  );
}

function ServicesIcon(props: { className?: string }) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function ProfileIcon(props: { className?: string }) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  );
}

function LoginIcon(props: { className?: string }) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
    )
}

function MenuIcon(props: { className?: string }) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
    );
}

export default BottomNavBar;
