
import React, { useEffect, useRef, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Review } from '../types';

const { Link } = ReactRouterDOM as any;

// Custom hook to detect when an element is visible on screen
const useOnScreen = (options?: IntersectionObserverInit) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = React.useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, options);

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, options]);

    return [ref, isVisible] as const;
};

// Animated element wrapper
const Animated = ({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) => {
    const [ref, isVisible] = useOnScreen({ threshold: 0.1 });
    const style = { transitionDelay: `${delay}ms` };
    return (
        <div ref={ref} style={style} className={`${className} transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {children}
        </div>
    );
};


// --- SVG Icons for Core Values ---
const AccessibilityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>;
const TransparencyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const EfficiencyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21.065.433.288.433h.378a2.25 2.25 0 012.25 2.25v.158c0 .022.002.044.005.066.003.021.005.042.008.063a4.5 4.5 0 01.577 2.158c0 .022.002.043.004.065.002.021.004.042.006.063a4.5 4.5 0 01-2.25 3.863c-.021.003-.042.005-.063.008a4.5 4.5 0 01-2.158.577c-.022.002-.043.004-.065.006a4.5 4.5 0 01-3.863-2.25c-.003-.021-.005-.042-.008-.063a4.5 4.5 0 01-.577-2.158c-.002-.022-.004-.043-.006-.065a4.5 4.5 0 012.25-3.863c.021-.003.042-.005.063-.008a4.5 4.5 0 012.158-.577c.022-.002.044-.004.066-.005V6.375a2.25 2.25 0 01-2.25-2.25h-.378c-.223 0-.353-.223-.288-.433A11.951 11.951 0 0112 3c1.072 0 2.106.14 3.084.404.24.067.24.414 0 .482A11.953 11.953 0 0112 4.5c-1.15 0-2.253.154-3.308.433z" /></svg>;
const SecurityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>;

const ownerImageUrl = "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

const TestimonialSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col animate-pulse">
        <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="mt-4 space-y-2 flex-grow">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div>
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mt-2"></div>
            </div>
        </div>
    </div>
);

const TestimonialCard: React.FC<{ review: Review }> = ({ review }) => {
    const { profiles: user, services: service, rating, comment } = review;
    
    return (
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 relative overflow-hidden h-full">
            <svg className="absolute top-6 right-6 w-20 h-20 text-slate-100 dark:text-slate-700/50" fill="currentColor" viewBox="0 0 32 32"><path d="M9.33,26.33a2.67,2.67,0,0,1-2.66-2.67V12a2.67,2.67,0,0,1,2.67-2.67H14.67a2.67,2.67,0,0,1,2.66,2.67v8.89a.89.89,0,0,1-.89.89H12a2.67,2.67,0,0,0-2.67,2.67Z"/><path d="M22.67,26.33a2.67,2.67,0,0,1-2.67-2.67V12a2.67,2.67,0,0,1,2.67-2.67H28a2.67,2.67,0,0,1,2.67,2.67v8.89a.89.89,0,0,1-.89.89H25.33a2.67,2.67,0,0,0-2.67,2.67Z"/></svg>
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-1 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-slate-300'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                </div>
                <p className="mt-4 text-slate-600 dark:text-slate-300 flex-grow text-lg leading-relaxed">
                    "{comment}"
                </p>
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <img className="w-14 h-14 rounded-full object-cover" src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name}&background=random`} alt={user?.full_name || 'User'} />
                    <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">{user?.full_name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Used for: {service?.name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AboutPage: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            setReviewsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('reviews')
                    .select('*, profiles(full_name, avatar_url), services(name)')
                    .eq('is_approved', true)
                    .order('created_at', { ascending: false })
                    .limit(2);
                
                if (error) throw error;
                setReviews(data as any[]);
            } catch (error) {
                console.error("Error fetching reviews for about page:", error);
            } finally {
                setReviewsLoading(false);
            }
        };
        fetchReviews();
    }, []);

    return (
        <div className="space-y-24 md:space-y-40 overflow-hidden">
            {/* --- Hero Section --- */}
            <section className="relative pt-12 md:pt-20">
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
                
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-center md:text-left">
                        <Animated>
                            <span className="inline-block px-4 py-1.5 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 text-sm font-bold rounded-full mb-4">OUR MISSION</span>
                        </Animated>
                        <Animated delay={100}>
                            <h1 className="text-4xl lg:text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter leading-tight">
                                Bridging the Gap Between Citizens &amp; Governance.
                            </h1>
                        </Animated>
                        <Animated delay={200}>
                            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto md:mx-0">
                                We are revolutionizing civic engagement by creating a single, intuitive platform that simplifies access to essential government services for every citizen.
                            </p>
                        </Animated>
                        <Animated delay={300} className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                             <Link to="/services" className="px-8 py-4 text-base font-bold text-white bg-cyan-500 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:bg-cyan-600 transition-all duration-300 transform hover:-translate-y-1">
                                Explore Services
                            </Link>
                             <Link to="#our-story" className="px-8 py-4 text-base font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 transform hover:-translate-y-1">
                                Our Story
                            </Link>
                        </Animated>
                    </div>

                    <div className="relative flex justify-center items-center h-[400px] lg:h-[500px]">
                        <Animated delay={200} className="w-full h-full">
                            <div className="absolute inset-8 bg-gradient-to-br from-cyan-300 to-purple-400 rounded-3xl opacity-50 dark:opacity-30 blur-2xl animate-[spin_20s_linear_infinite]"></div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-[50px] transform -rotate-12 transition-transform duration-500 hover:rotate-0"></div>
                            <img
                                src={ownerImageUrl}
                                alt="Rohan Sharma, Founder of Documentmitra"
                                className="absolute inset-0 w-full h-full object-cover rounded-[40px] shadow-2xl p-2 bg-white/50 dark:bg-slate-900/50 transform rotate-6 transition-transform duration-500 hover:rotate-0"
                            />
                        </Animated>
                    </div>
                </div>
            </section>
            
             {/* --- Problem & Solution Section --- */}
            <section id="our-story" className="max-w-7xl mx-auto px-4 space-y-20">
                <Animated className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 text-center md:text-left">
                        <span className="inline-block px-4 py-1.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-sm font-bold rounded-full mb-4">THE PROBLEM</span>
                        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">A Maze of Bureaucracy</h2>
                        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                            Navigating government services has traditionally been a frustrating experience, marked by long queues, confusing paperwork, and a lack of clear information. This inefficiency creates a barrier between citizens and the essential services they need.
                        </p>
                    </div>
                    <div className="order-1 md:order-2">
                         <img src="https://images.pexels.com/photos/7848733/pexels-photo-7848733.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Frustration with paperwork" className="rounded-2xl shadow-xl w-full h-auto object-cover" />
                    </div>
                </Animated>

                <Animated className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                         <img src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Happy user with our service" className="rounded-2xl shadow-xl w-full h-auto object-cover" />
                    </div>
                    <div className="text-center md:text-left">
                         <span className="inline-block px-4 py-1.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-sm font-bold rounded-full mb-4">OUR SOLUTION</span>
                        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Clarity & Simplicity</h2>
                        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                            Documentmitra was born from a simple idea: what if accessing government services could be as easy as ordering a taxi? We've created a unified, user-friendly platform that digitizes processes, provides step-by-step guidance, and puts the power back in your hands.
                        </p>
                    </div>
                </Animated>
            </section>

            {/* --- Core Values Section --- */}
            <section className="max-w-7xl mx-auto px-4 text-center">
                 <Animated>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Our Guiding Principles</h2>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        These values are the bedrock of our platform and the motivation behind every feature we build.
                    </p>
                 </Animated>
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: <AccessibilityIcon />, title: "Accessibility", description: "Ensuring our services are available and easy to use for everyone, regardless of ability or background." },
                        { icon: <TransparencyIcon />, title: "Transparency", description: "Providing clear, honest, and straightforward information about every process and fee." },
                        { icon: <EfficiencyIcon />, title: "Efficiency", description: "Streamlining complex procedures to save you time, effort, and unnecessary stress." },
                        { icon: <SecurityIcon />, title: "Security", description: "Protecting your personal data with the highest standards of digital security and privacy." },
                    ].map((value, i) => (
                        <Animated key={value.title} delay={i * 100}>
                            <div className="h-full p-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 group hover:border-cyan-400/50 dark:hover:border-cyan-500/50 transition-all duration-300">
                                <div className="inline-block p-4 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-300 rounded-xl group-hover:scale-110 group-hover:shadow-lg transition-transform duration-300">
                                    {value.icon}
                                </div>
                                <h3 className="mt-6 text-xl font-bold text-slate-800 dark:text-slate-200">{value.title}</h3>
                                <p className="mt-2 text-slate-600 dark:text-slate-400">{value.description}</p>
                            </div>
                        </Animated>
                    ))}
                </div>
            </section>
            
            {/* --- Meet the Team Section --- */}
            <section className="max-w-7xl mx-auto px-4 text-center">
                <Animated>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Meet The Team</h2>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        The passionate individuals dedicated to making civic life simpler for you.
                    </p>
                </Animated>
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { img: ownerImageUrl, name: "Rohan Sharma", title: "Founder & CEO", bio: "With a vision for a digitally empowered India, Rohan leads the charge in revolutionizing civic tech." },
                        { img: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", name: "Priya Singh", title: "Head of Product", bio: "Priya is obsessed with creating the most intuitive and user-friendly experience on the platform." },
                        { img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1", name: "Amit Kumar", title: "Lead Engineer", bio: "Amit is the architectural mastermind behind our secure and scalable technology." },
                    ].map((member, i) => (
                        <Animated key={member.name} delay={i * 100}>
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden group transition-all duration-300 hover:-translate-y-2">
                                <img src={member.img} alt={member.name} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{member.name}</h3>
                                    <p className="text-cyan-600 dark:text-cyan-400 font-semibold">{member.title}</p>
                                    <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">{member.bio}</p>
                                </div>
                            </div>
                        </Animated>
                    ))}
                </div>
            </section>

             {/* --- Testimonials Section --- */}
            {(!reviewsLoading && reviews.length > 0) && (
                <section className="max-w-7xl mx-auto px-4">
                    <Animated className="text-center">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">What Our Users Say</h2>
                        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            We're proud to have made a difference in the lives of citizens across the country.
                        </p>
                    </Animated>
                     <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {reviewsLoading ? (
                            <>
                                <Animated delay={0}><TestimonialSkeleton /></Animated>
                                <Animated delay={100}><TestimonialSkeleton /></Animated>
                            </>
                        ) : (
                            reviews.map((review, i) => (
                                <Animated key={review.id} delay={i * 100}>
                                    <TestimonialCard review={review} />
                                </Animated>
                            ))
                        )}
                    </div>
                </section>
            )}
            
            {/* Final CTA */}
            <section className="relative max-w-5xl mx-auto px-4 py-16 text-center">
                 <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl -z-10 blur-xl"></div>
                 <Animated>
                    <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Join Us on Our Mission</h2>
                     <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Ready to experience a hassle-free way to manage your government needs? Explore our services and see how simple civic life can be.
                    </p>
                    <Link to="/services" className="mt-8 inline-flex items-center gap-3 px-10 py-4 text-lg font-bold text-white bg-cyan-500 rounded-xl shadow-lg hover:shadow-xl hover:bg-cyan-600 transition-all duration-300 transform hover:-translate-y-1">
                        Get Started Now
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                 </Animated>
            </section>
        </div>
    );
};

export default AboutPage;
