import React from 'react';

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-300 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{title}</h3>
                <div className="text-slate-600 dark:text-slate-400">{children}</div>
            </div>
        </div>
    </div>
);


const ContactPage: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* --- Hero Section --- */}
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
          Get in Touch
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          We’re here to help and answer any question you might have. We look forward to hearing from you!
        </p>
      </section>

      {/* --- Info Cards Section --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <InfoCard title="Our Office" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>
            <p>123 Gov Services Ln,<br/>New Delhi, 110001</p>
          </InfoCard>
          <InfoCard title="Email Us" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}>
            <a href="mailto:support@nearme.gov" className="hover:text-cyan-500 transition-colors">support@nearme.gov</a>
          </InfoCard>
          <InfoCard title="Call Us" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}>
            <p>+91 1800 123 4567</p>
          </InfoCard>
      </section>

      {/* --- Form & Map Section --- */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Send us a Message</h2>
            <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Full Name</label>
                        <input type="text" id="name" required className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Email Address</label>
                        <input type="email" id="email" required className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" />
                    </div>
                </div>
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Subject</label>
                    <input type="text" id="subject" required className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Message</label>
                    <textarea id="message" rows={5} required className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"></textarea>
                </div>
                <div className="text-right">
                    <button type="submit" className="w-full sm:w-auto px-8 py-3 text-base font-bold text-white bg-cyan-500 rounded-xl shadow-lg hover:shadow-xl hover:bg-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        Send Message
                    </button>
                </div>
            </form>
        </div>
        <div className="h-80 lg:h-full w-full bg-slate-200 dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center">
             <p className="text-slate-500 dark:text-slate-400 font-semibold">[Map Placeholder]</p>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;