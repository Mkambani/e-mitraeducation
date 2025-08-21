
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM as any;

const Footer: React.FC = () => {
  return (
    <footer className="w-full p-8 mt-12 border-t border-slate-200 dark:border-slate-800 hidden md:block">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mb-4">
            <Link to="/" className="text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 transition-colors">Home</Link>
            <Link to="/services" className="text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 transition-colors">Services</Link>
            <Link to="/about" className="text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 transition-colors">About Us</Link>
            <Link to="/contact" className="text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 transition-colors">Contact Us</Link>
            <Link to="/terms" className="text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 transition-colors">Terms & Conditions</Link>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} NearMe. All rights reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
