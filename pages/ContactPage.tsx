import React, { useContext, useState } from 'react';
import { ServiceContext } from '../context/ServiceContext';
import { supabase } from '../supabaseClient';

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
  const { settings } = useContext(ServiceContext);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: insertError } = await supabase.from('contact_messages').insert({
        full_name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      if (insertError) {
        throw insertError;
      }

      setSuccess("Your message has been sent successfully! We'll get back to you soon.");
      setFormData({ name: '', email: '', subject: '', message: '' });

    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
            <p>{settings.contact_address.split(',').map((line, i) => <React.Fragment key={i}>{line.trim()}<br/></React.Fragment>)}</p>
          </InfoCard>
          <InfoCard title="Email Us" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}>
            <a href={`mailto:${settings.contact_email}`} className="hover:text-cyan-500 transition-colors">{settings.contact_email}</a>
          </InfoCard>
          <InfoCard title="Call Us" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}>
            <p>{settings.contact_phone}</p>
          </InfoCard>
      </section>

      {/* --- Form & Map Section --- */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Full Name</label>
                        <input type="text" id="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Email Address</label>
                        <input type="email" id="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" />
                    </div>
                </div>
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Subject</label>
                    <input type="text" id="subject" required value={formData.subject} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition" />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Message</label>
                    <textarea id="message" rows={5} required value={formData.message} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"></textarea>
                </div>
                 {success && <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900/30 dark:text-green-300">{success}</div>}
                {error && <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300">{error}</div>}
                <div className="text-right">
                    <button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-3 text-base font-bold text-white bg-cyan-500 rounded-xl shadow-lg hover:shadow-xl hover:bg-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1 disabled:bg-slate-400 disabled:shadow-none disabled:transform-none">
                        {loading ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
            </form>
        </div>
        <div className="h-80 lg:h-full w-full bg-slate-200 dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
           <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3513.38053361853!2d74.96106557455889!3d28.28679469969874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39149f3a374a43d5%3A0xa60496285d2b3110!2sChuru%20railway%20station!5e0!3m2!1sen!2sin!4v1755886360512!5m2!1sen!2sin"
              className="w-full h-full"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Office Location Map">
            </iframe>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;