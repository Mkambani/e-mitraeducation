
import React, { useState, useEffect, useContext } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ServiceContext } from '../context/ServiceContext';

const { NavLink, Link, useLocation } = ReactRouterDOM as any;

// --- Social Icons ---
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.212 3.794 4.649-.65.177-1.353.23-2.064.083.616 1.916 2.408 3.287 4.528 3.325-1.782 1.48-4.022 2.29-6.393 2.185.002.002.004.004.006.004 2.2 1.46 4.838 2.308 7.646 2.308 9.177 0 14.209-7.828 13.618-14.735.973-.705 1.825-1.582 2.5-2.583z" /></svg>;
const LinkedInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-4.481 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" /></svg>;


const MenuPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { settings } = useContext(ServiceContext);
    const menuLinks = [
        { name: 'About Us', href: '/about' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Terms & Conditions', href: '/terms' },
    ];
    
    const socialLinks = [
      { name: 'Facebook', href: settings.social_facebook, icon: FacebookIcon },
      { name: 'Twitter', href: settings.social_twitter, icon: TwitterIcon },
      { name: 'LinkedIn', href: settings.social_linkedin, icon: LinkedInIcon },
    ].filter(link => link.href);

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
                 {socialLinks.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="px-2 mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Follow Us</p>
                        <div className="flex items-center justify-around px-2">
                            {socialLinks.map(link => (
                                <a 
                                  key={link.name} 
                                  href={link.href} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="p-3 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors" 
                                  aria-label={`Visit our ${link.name} page`}
                                >
                                    <link.icon />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
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
