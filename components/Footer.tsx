
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM as any;

const Footer: React.FC = () => {
  return (
    <footer className="w-full p-8 mt-12 border-t border-slate-200 dark:border-slate-800 hidden md:block">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo on the left */}
        <div className="flex items-center gap-2">
           <span className="font-bold text-xl text-slate-800 dark:text-slate-200">Document</span>
           <span className="font-bold text-xl text-cyan-500">mitra.</span>
        </div>

        {/* Links in the middle */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
            <Link to="/" className="text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 transition-colors">Home</Link>
            <Link to="/services" className="text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 transition-colors">Services</Link>
            <Link to="/about" className="text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 transition-colors">About Us</Link>
            <Link to="/contact" className="text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 transition-colors">Contact Us</Link>
            <Link to="/terms" className="text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 transition-colors">Terms & Conditions</Link>
        </div>
        
        {/* Copyright on the right */}
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Documentmitra.
        </p>
      </div>
    </footer>
  );
};

export default Footer;