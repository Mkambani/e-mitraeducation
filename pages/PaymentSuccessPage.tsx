import React, { useContext } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ServiceContext } from '../context/ServiceContext';

const { Link, useLocation } = ReactRouterDOM as any;

const PaymentSuccessPage: React.FC = () => {
  const { state } = useLocation();
  const { settings } = useContext(ServiceContext);
  const serviceName = state?.serviceName || 'Your service';
  const bookingIdRaw = state?.bookingId;
  const price = state?.price;

  const bookingId = bookingIdRaw ? `DMTRA-${String(bookingIdRaw).padStart(6, '0')}` : `DMTRA-PENDING`;
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="booking-summary" className="relative z-10 text-center flex flex-grow flex-col items-center justify-center -mx-4 -mt-8 -mb-24 md:-mb-1">
      {/* Background Effect (will be hidden on print) */}
      <div className="no-print absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/4 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 to-transparent"></div>
          <div className="absolute -bottom-1/4 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-500/10 to-transparent"></div>
      </div>

       <div className="w-full max-w-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 mx-4 animate-content-in">
        {/* Print-only header */}
        <div className="print-only text-left mb-8 hidden">
            <h2 className="text-2xl font-bold text-slate-800">{settings.website_name}</h2>
            <p className="text-slate-600">Booking Receipt</p>
        </div>

        <div className="no-print mx-auto flex items-center justify-center h-28 w-28 rounded-full bg-green-100 dark:bg-green-900/30 relative">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 mt-8 tracking-tight">Booking Confirmed!</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-3 text-lg max-w-md mx-auto">Your request for <span className="font-bold text-cyan-600 dark:text-cyan-400">{serviceName}</span> has been submitted successfully.</p>
        
        <div className="mt-8 w-full flex flex-col sm:flex-row justify-center items-stretch gap-4 sm:gap-8">
            <div className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex-1">
                <p className="text-sm text-slate-500 dark:text-slate-400">Booking Reference ID</p>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-200 tracking-wider">{bookingId}</p>
            </div>
             {price != null && (
                <div className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex-1">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Amount Paid</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200 tracking-wider">{price === 0 ? 'FREE' : `₹${price}`}</p>
                </div>
             )}
        </div>


        <div className="mt-8 prose prose-sm text-slate-500 dark:text-slate-400">
            <p className="no-print">You will receive a confirmation email shortly. Please keep the reference ID for your records. Our team will review your documents and contact you if any further information is needed.</p>
            <p className="print-only hidden">Thank you for using our services. Please keep this receipt for your records.</p>
        </div>

        <div className="no-print mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
                to="/" 
                className="w-full sm:w-auto px-8 py-3 text-base font-bold text-white bg-cyan-500 rounded-xl shadow-lg hover:shadow-xl hover:bg-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
                Book Another Service
            </Link>
            <button 
                onClick={handlePrint}
                className="w-full sm:w-auto px-8 py-3 text-base font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/50 rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
                Print Summary
            </button>
        </div>
      </div>
      <style>{`
        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 3;
          stroke-miterlimit: 10;
          stroke: #4CAF50;
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: block;
          stroke-width: 3;
          stroke: #fff;
          stroke-miterlimit: 10;
          margin: auto;
          animation: scale .3s ease-in-out .9s both;
        }
        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }
        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes scale {
          0%, 100% {
            transform: none;
          }
          50% {
            transform: scale3d(1.1, 1.1, 1);
          }
        }
        /* --- Print Styles --- */
        @media print {
          body {
            background-color: #fff !important; /* Ensure white background for printing */
          }
          .no-print, .no-print * {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          #booking-summary {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            display: block !important;
            padding: 2rem !important;
            margin: 0 !important;
            justify-content: flex-start !important;
          }
          #booking-summary > div {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important; /* slate-200 */
            backdrop-filter: none !important;
            background: #fff !important;
            margin: 0 auto !important;
          }
          body, h1, p, h2 {
            color: #000 !important;
          }
          .dark .print-only h2, .dark .print-only p,
          .dark #booking-summary .text-slate-600,
          .dark #booking-summary .text-slate-300 {
             color: #475569 !important; /* slate-600 */
          }
          .dark #booking-summary .bg-slate-900\\/50 {
             background-color: #f1f5f9 !important; /* slate-100 */
             border-color: #e2e8f0 !important; /* slate-200 */
          }
          .dark #booking-summary .text-slate-500,
          .dark #booking-summary .text-slate-400 {
             color: #64748b !important; /* slate-500 */
          }
          .dark #booking-summary .text-slate-700,
          .dark #booking-summary .text-slate-200 {
             color: #1e293b !important; /* slate-800 */
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccessPage;