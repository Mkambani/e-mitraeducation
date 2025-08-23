import React, { useContext, useMemo, useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { getBreadcrumbs, findServiceById } from '../serviceHelper';
import Breadcrumb from '../components/Breadcrumb';
import IconMap from '../components/IconMap';
import { Service, Review } from '../types';
import { ServiceContext } from '../context/ServiceContext';
import { supabase } from '../supabaseClient';

const { useParams, useNavigate, Link } = ReactRouterDOM as any;

const placeholderSvgUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5' /%3E%3C/svg%3E";

const colorClasses = [
    { bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
    { bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { bg: 'bg-red-100 dark:bg-red-900/30' },
    { bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { bg: 'bg-pink-100 dark:bg-pink-900/30' },
];

const ReviewsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    reviews: Review[];
    serviceName: string;
}> = ({ isOpen, onClose, reviews, serviceName }) => {
    if (!isOpen) return null;

    const getInitials = (name: string | null | undefined) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    const StarRatingDisplay: React.FC<{ rating: number; className?: string }> = ({ rating, className = 'h-5 w-5' }) => (
        <div className="flex">
            {[...Array(5)].map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`${className} ${i < rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Reviews for {serviceName}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{reviews.length} total reviews</p>
                </header>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {reviews.length > 0 ? (
                        <ul className="space-y-6">
                            {reviews.map(review => (
                                <li key={review.id} className="flex items-start gap-4 animate-list-item-in">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center font-bold text-cyan-700 dark:text-cyan-300 overflow-hidden">
                                        {review.profiles?.avatar_url ? (
                                            <img src={review.profiles.avatar_url} alt={review.profiles.full_name || 'Avatar'} className="w-full h-full object-cover" />
                                        ) : (
                                            getInitials(review.profiles?.full_name)
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{review.profiles?.full_name || 'Anonymous'}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(review.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <StarRatingDisplay rating={review.rating} />
                                        </div>
                                        {review.comment && <p className="mt-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">{review.comment}</p>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-12">
                            <p className="font-semibold text-slate-600 dark:text-slate-300">No Reviews Yet</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Be the first to leave a review for this service!</p>
                        </div>
                    )}
                </div>
                 <footer className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex-shrink-0 flex justify-end">
                    <button onClick={onClose} className="px-5 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition">Close</button>
                </footer>
            </div>
        </div>
    );
};

const SubServiceCard = ({ service, onClick }: { service: Service; onClick: () => void }) => {
    const hashCode = (num: number) => {
        let hash = 0;
        const str = String(num);
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    };
    const { bg } = colorClasses[Math.abs(hashCode(service.id)) % colorClasses.length];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200/50 dark:border-slate-700/50 flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5">
            {/* Image/Icon Area */}
            <div className="relative h-40 flex items-center justify-center overflow-hidden">
                 <div className={`absolute inset-0 ${bg} transition-transform duration-500 ease-in-out group-hover:scale-110`}></div>
                 <div className={`relative p-5 transition-transform duration-500 ease-in-out group-hover:scale-110`}>
                    <img 
                        src={service.icon_url || placeholderSvgUrl} 
                        alt={service.name} 
                        className="h-16 w-16 object-contain mx-auto"
                        onError={(e) => (e.currentTarget.src = placeholderSvgUrl)}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1 truncate">
                    {service.name}
                </h3>
                
                {service.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 h-8 overflow-hidden">
                        {service.description}
                    </p>
                )}
                
                {/* This div pushes the content below it to the bottom */}
                <div className="flex-grow"></div>

                <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                    {service.is_bookable && service.price != null ? (
                         <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                            {service.price === 0 ? 'FREE' : `₹${service.price}`}
                        </div>
                    ) : (
                        <div className="text-sm font-semibold text-slate-400 dark:text-slate-500">View Options</div>
                    )}
                    <button onClick={onClick} className="px-5 py-2.5 bg-cyan-500 text-white text-sm font-bold rounded-lg shadow-md shadow-cyan-500/20 hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 transform group-hover:scale-105">
                        {service.is_bookable ? 'Book Now' : 'View Details'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SubServiceListItem = ({ service, onClick }: { service: Service; onClick: () => void }) => {
    const hashCode = (num: number) => {
        let hash = 0;
        const str = String(num);
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    };
    const { bg } = colorClasses[Math.abs(hashCode(service.id)) % colorClasses.length];
    
    return (
        <div 
            onClick={onClick}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200/50 dark:border-slate-700/50 flex items-center p-4 group transition-all duration-300 hover:shadow-xl hover:border-cyan-400 dark:hover:border-cyan-600 cursor-pointer animate-list-item-in"
        >
            {/* Icon */}
            <div className={`flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-lg ${bg} transition-transform duration-300 group-hover:scale-105 p-2`}>
                <img 
                    src={service.icon_url || placeholderSvgUrl}
                    alt={service.name}
                    className="h-full w-full object-contain"
                    onError={(e) => (e.currentTarget.src = placeholderSvgUrl)}
                />
            </div>

            {/* Main Content */}
            <div className="flex-grow px-4 min-w-0">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                    {service.name}
                </h3>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-4">
                 {service.is_bookable && service.price != null ? (
                     <div className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                        {service.price === 0 ? 'FREE' : `₹${service.price}`}
                    </div>
                ) : (
                    <div className="text-sm font-semibold text-slate-400 dark:text-slate-500">View Options</div>
                )}
                <button onClick={onClick} className="hidden sm:inline-block px-5 py-2.5 bg-cyan-500 text-white text-sm font-bold rounded-lg shadow-md shadow-cyan-500/20 hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300">
                    {service.is_bookable ? 'Book Now' : 'View Details'}
                </button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-cyan-600 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    );
};


const ServicePage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { allServices, loading } = useContext(ServiceContext);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [serviceReviews, setServiceReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  
  const serviceId = Number(params.serviceId);

  const { service, breadcrumbs } = useMemo(() => {
    if (loading || !serviceId) return { service: null, breadcrumbs: [] };
    const foundService = findServiceById(allServices, serviceId);
    const crumbs = getBreadcrumbs(allServices, serviceId);
    return { service: foundService, breadcrumbs: crumbs };
  }, [allServices, serviceId, loading]);

  useEffect(() => {
    if (!service) return;

    // Helper to recursively get all descendant service IDs
    const getAllDescendantIds = (s: Service): number[] => {
        const ids = [s.id];
        if (s.subServices && s.subServices.length > 0) {
            s.subServices.forEach(sub => {
                ids.push(...getAllDescendantIds(sub));
            });
        }
        return ids;
    };
    
    const serviceIdsToQuery = getAllDescendantIds(service);

    const fetchReviewsForServiceTree = async () => {
        setReviewsLoading(true);
        const { data } = await supabase
            .from('reviews')
            .select('*, profiles(full_name, avatar_url)')
            .in('service_id', serviceIdsToQuery) // Use .in() to get reviews for parent and all children
            .eq('is_approved', true)
            .order('created_at', { ascending: false });
        
        if (data) {
            setServiceReviews(data as any);
        }
        setReviewsLoading(false);
    };

    fetchReviewsForServiceTree();
  }, [service]);


  const reviewCount = serviceReviews.length;
  const averageRating = reviewCount > 0 
    ? (serviceReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount)
    : 0;

  const handleSubServiceClick = (subService: Service) => {
    if (subService.is_bookable) {
      navigate(`/booking/${subService.id}`);
    } else {
      navigate(`/service/${subService.id}`);
    }
  };

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-semibold">Loading service details...</p>
        </div>
     );
  }

  if (!service) {
    return (
      <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-red-200 dark:border-red-500/30 animate-fade-in">
        <IconMap iconName="DefaultIcon" className="h-20 w-20 mx-auto text-red-400" />
        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mt-6">Service Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">The service you are looking for does not exist or may have been moved.</p>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 px-8 py-3 text-base font-bold text-white bg-cyan-500 rounded-xl shadow-lg hover:shadow-xl hover:bg-cyan-600 transition-all duration-300 transform hover:-translate-y-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Back to Services
        </Link>
      </div>
    );
  }

  const hasSubServices = service.subServices && service.subServices.length > 0;

  return (
    <div>
      <Breadcrumb crumbs={breadcrumbs} />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Panel: Parent Service Info */}
        <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-28 animate-slide-in-left">
                <div className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900/70 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200/50 dark:border-slate-700/50">
                    <div className="relative mb-4">
                        <div className="absolute -top-12 -left-2 w-28 h-28 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-xl border-4 border-slate-50 dark:border-slate-800/80 p-4">
                             <img 
                                src={service.icon_url || placeholderSvgUrl} 
                                alt={service.name} 
                                className="h-full w-full object-contain"
                                onError={(e) => (e.currentTarget.src = placeholderSvgUrl)}
                            />
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight pt-16">{service.name}</h1>
                    <p className="mt-3 text-slate-500 dark:text-slate-400 leading-relaxed">
                      {service.description || "The parent category for the services listed here."}
                    </p>
                    
                    {/* --- Dynamic Review Summary --- */}
                    <div className="mt-6 border-t border-slate-200/80 dark:border-slate-700/50 pt-5">
                      {reviewsLoading ? (
                        <div className="h-10 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg"></div>
                      ) : (
                        <button 
                          onClick={() => setIsReviewsModalOpen(true)}
                          className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                          disabled={reviewCount === 0}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-slate-200">
                                    {reviewCount > 0 ? `${averageRating.toFixed(1)} out of 5` : 'No reviews yet'}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 hover:underline">
                                    {reviewCount > 0 ? `Based on ${reviewCount} reviews` : 'Be the first to review'}
                                </p>
                            </div>
                        </button>
                      )}
                    </div>


                    {service.is_bookable && (
                        <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Direct Booking Available</h3>
                            <button 
                                onClick={() => navigate(`/booking/${service.id}`)}
                                className="mt-3 w-full px-8 py-3 text-white bg-cyan-500 rounded-xl shadow-lg hover:shadow-cyan-500/40 hover:bg-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col items-center justify-center"
                            >
                                {service.price != null && (
                                    <span className="text-2xl font-extrabold tracking-tight leading-none">
                                        {service.price === 0 ? 'FREE' : `₹${service.price}`}
                                    </span>
                                )}
                                <span className="text-base font-bold mt-1">
                                    Book Now
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </aside>

        {/* Right Panel: Sub-Services */}
        <div className="lg:col-span-8 xl:col-span-9">
            {hasSubServices ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-700 dark:text-slate-300 tracking-tight">
                            {service.is_bookable ? 'Or, Choose a Specific Service' : `Services under ${service.name}`}
                        </h2>
                         <div className="flex-shrink-0 flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg gap-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                aria-label="Grid View"
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
                            >
                                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${viewMode === 'grid' ? 'text-cyan-500' : 'text-slate-400'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                aria-label="List View"
                                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${viewMode === 'list' ? 'text-cyan-500' : 'text-slate-400'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {service.subServices?.map((sub) => (
                               <SubServiceCard 
                                    key={sub.id} 
                                    service={sub} 
                                    onClick={() => handleSubServiceClick(sub)}
                               />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {service.subServices?.map((sub) => (
                                <SubServiceListItem
                                    key={sub.id}
                                    service={sub}
                                    onClick={() => handleSubServiceClick(sub)}
                                />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center p-10 lg:p-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 animate-fade-in">
                    <IconMap iconName="DefaultIcon" className="h-16 w-16 mx-auto text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-6">No Further Services</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">There are no specific sub-services under this category. You can either book this service directly (if available) or explore other main categories.</p>
                </div>
            )}
        </div>
      </div>
      <ReviewsModal 
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        reviews={serviceReviews}
        serviceName={service.name}
      />
    </div>
  );
};

export default ServicePage;
