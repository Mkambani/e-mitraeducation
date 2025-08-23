





import React from 'react';
import { Service } from '../types';

const placeholderSvgUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5' /%3E%3C/svg%3E";


const ServiceItem: React.FC<{ service: Service; onClick: () => void }> = ({ service, onClick }) => {
  // Simple hash function for pseudo-random colors
  const hashCode = (num: number) => {
    let hash = 0;
    const str = String(num);
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  const colorClasses = [
    { bg: 'bg-cyan-100 dark:bg-slate-700/50' },
    { bg: 'bg-blue-100 dark:bg-slate-700/50' },
    { bg: 'bg-purple-100 dark:bg-slate-700/50' },
    { bg: 'bg-emerald-100 dark:bg-slate-700/50' },
    { bg: 'bg-amber-100 dark:bg-slate-700/50' },
    { bg: 'bg-red-100 dark:bg-slate-700/50' },
    { bg: 'bg-indigo-100 dark:bg-slate-700/50' },
    { bg: 'bg-pink-100 dark:bg-slate-700/50' },
  ];

  const { bg } = colorClasses[Math.abs(hashCode(service.id)) % colorClasses.length];

  return (
    <div
      onClick={onClick}
      className="group flex flex-col items-center justify-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 hover:border-cyan-400 cursor-pointer transition-all duration-300 ease-in-out shadow-sm hover:shadow-xl hover:-translate-y-1 text-center"
    >
      <div className="w-full flex justify-between items-center">
        <div className="w-7 h-7"></div>

        {service.is_bookable && service.price != null && (
            <div className="bg-emerald-400 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded-full shadow">
            {service.price === 0 ? 'FREE' : `₹${service.price}`}
            </div>
        )}
      </div>

      <div className={`flex items-center justify-center w-20 h-20 rounded-full ${bg} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg mt-auto p-3`}>
        <img 
            src={service.icon_url || placeholderSvgUrl} 
            alt={`${service.name} icon`} 
            className="w-full h-full object-contain"
            onError={(e) => (e.currentTarget.src = placeholderSvgUrl)}
        />
      </div>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-tight mt-auto">{service.name}</span>
    </div>
  );
};

export default ServiceItem;