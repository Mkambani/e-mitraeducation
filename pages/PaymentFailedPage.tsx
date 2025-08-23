import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link, useLocation, useNavigate } = ReactRouterDOM as any;

const PaymentFailedPage: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { serviceName, reason } = state || {};
  
  const handleRetry = () => {
    // Navigate back to the payment page with the same state to allow retrying.
    navigate('/payment', { state: state, replace: true });
  }

  return (
    <div className="relative z-10 text-center flex flex-grow flex-col items-center justify-center -mx-4 -mt-8 -mb-24 md:-mb-1">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/4 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-500/10 to-transparent"></div>
        <div className="absolute -bottom-1/4 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-orange-500/10 to-transparent"></div>
      </div>

       <div className="w-full max-w-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 mx-4 animate-content-in">
        <div className="mx-auto flex items-center justify-center h-28 w-28 rounded-full bg-red-100 dark:bg-red-900/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 mt-8 tracking-tight">Payment Failed</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-3 text-lg max-w-md mx-auto">
          Unfortunately, we were unable to process your payment for <span className="font-bold text-slate-700 dark:text-slate-200">{serviceName || 'your service'}</span>.
        </p>
        
        {reason && (
          <div className="mt-4 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-500/30">
            <strong>Reason:</strong> {reason}
          </div>
        )}
        
        <div className="mt-8 prose prose-sm text-slate-500 dark:text-slate-400">
            <p>Your application is not yet complete. No booking has been created. Please retry the payment to submit your booking or contact support if the problem persists.</p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
                onClick={handleRetry} 
                className="w-full sm:w-auto px-8 py-3 text-base font-bold text-white bg-cyan-500 rounded-xl shadow-lg hover:shadow-xl hover:bg-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
                Retry Payment
            </button>
            <Link 
                to="/profile"
                className="w-full sm:w-auto px-8 py-3 text-base font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/50 rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
                Go to My Profile
            </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;