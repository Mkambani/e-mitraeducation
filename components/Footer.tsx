

import React, { useContext } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ServiceContext } from '../context/ServiceContext';

const { Link } = ReactRouterDOM as any;

const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.212 3.794 4.649-.65.177-1.353.23-2.064.083.616 1.916 2.408 3.287 4.528 3.325-1.782 1.48-4.022 2.29-6.393 2.185.002.002.004.004.006.004 2.2 1.46 4.838 2.308 7.646 2.308 9.177 0 14.209-7.828 13.618-14.735.973-.705 1.825-1.582 2.5-2.583z" /></svg>;
const LinkedInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-4.481 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" /></svg>;


const Footer: React.FC = () => {
  const { settings } = useContext(ServiceContext);
  const socialLinks = [
    { name: 'Facebook', href: settings.social_facebook, icon: FacebookIcon },
    { name: 'Twitter', href: settings.social_twitter, icon: TwitterIcon },
    { name: 'LinkedIn', href: settings.social_linkedin, icon: LinkedInIcon },
  ].filter(link => link.href);

  return (
    <footer className="w-full bg-slate-900 p-8 mt-12 border-t border-slate-800 hidden md:block">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={`${settings.website_name} logo`} className="h-8 w-auto" />
              ) : (
                <span className="font-bold text-2xl text-slate-200">{settings.website_name}</span>
              )}
            </Link>

            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
                <Link to="/" className="text-sm text-slate-400 hover:text-cyan-500 transition-colors">Home</Link>
                <Link to="/services" className="text-sm text-slate-400 hover:text-cyan-500 transition-colors">Services</Link>
                <Link to="/about" className="text-sm text-slate-400 hover:text-cyan-500 transition-colors">About Us</Link>
                <Link to="/contact" className="text-sm text-slate-400 hover:text-cyan-500 transition-colors">Contact Us</Link>
                <Link to="/terms" className="text-sm text-slate-400 hover:text-cyan-500 transition-colors">Terms & Conditions</Link>
            </div>
            
            {socialLinks.length > 0 && (
                <div className="flex items-center gap-6">
                    {socialLinks.map(link => (
                        <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-500 transition-colors" aria-label={`Visit our ${link.name} page`}>
                            <link.icon />
                        </a>
                    ))}
                </div>
            )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;