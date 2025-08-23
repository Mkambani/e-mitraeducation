import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../../supabaseClient';
import { AppSettings } from '../../types';
import { ServiceContext } from '../../context/ServiceContext';
import { Json } from '../../database.types';

const Section: React.FC<{ title: string; description: string; children: React.ReactNode; }> = ({ title, description, children }) => (
    <div className="bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border">
        <h2 className="text-xl font-bold text-admin-heading">{title}</h2>
        <p className="text-sm text-admin-light mt-1 mb-6">{description}</p>
        <div className="border-t border-admin-card-border pt-6 space-y-4">
            {children}
        </div>
    </div>
);

const FormField: React.FC<{ label: string; id: string; children: React.ReactNode; description?: string; }> = ({ label, id, children, description }) => (
    <div>
        <label htmlFor={id} className="block text-base font-semibold text-admin-heading">
            {label}
        </label>
        {description && <p className="text-sm text-admin-light/80 mb-2">{description}</p>}
        {children}
    </div>
);


const AdminSettingsPage: React.FC = () => {
  const { settings, refetchServices } = useContext(ServiceContext);
  
  const [formState, setFormState] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // This effect runs when `settings` from the context are available.
    // It populates the form's local state (`formState`) only if it hasn't been
    // populated before (i.e., `formState` is still null). After this first
    // population, any user edits to `formState` are preserved, which prevents
    // the input focus loss issue caused by continuous re-synchronization.
    if (settings && formState === null) {
      setFormState(settings);
    }
  }, [settings, formState]);

  const handleChange = (field: keyof AppSettings, value: any) => {
    setFormState(prev => (prev ? { ...prev, [field]: value } : null));
  };
  
  const handleTwilioChange = (field: 'account_sid' | 'auth_token' | 'from_number', value: string) => {
    setFormState(prev => {
        if (!prev) return null;
        return {
            ...prev,
            twilio_config: {
                ...prev.twilio_config,
                account_sid: prev.twilio_config?.account_sid || '',
                auth_token: prev.twilio_config?.auth_token || '',
                from_number: prev.twilio_config?.from_number || '',
                [field]: value,
            }
        }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState) return;

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: formState as unknown as Json })
        .eq('key', 'app_settings');

      if (error) {
        if (error.code === 'PGRST116') { // Error for no rows found
             const { error: insertError } = await supabase
                .from('settings')
                .insert({ key: 'app_settings', value: formState as unknown as Json });
            if(insertError) throw insertError;
        } else {
            throw error;
        }
      }
      
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      refetchServices();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
      <input {...props} className="w-full p-3 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition" />
  );
  
  if (!formState) {
    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
            <div className="h-64 bg-admin-card-bg rounded-xl border border-admin-card-border"></div>
            <div className="h-80 bg-admin-card-bg rounded-xl border border-admin-card-border"></div>
            <div className="h-48 bg-admin-card-bg rounded-xl border border-admin-card-border"></div>
        </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <form onSubmit={handleSave} className="space-y-8">
        <Section title="Branding & Identity" description="Customize your site's name, logos, and browser appearance.">
            <FormField label="Website Name" id="website_name">
                <Input id="website_name" type="text" value={formState.website_name} onChange={e => handleChange('website_name', e.target.value)} />
            </FormField>
             <FormField label="Logo URL" id="logo_url" description="URL for the main logo in the header. Leave blank to display the Website Name.">
                <Input id="logo_url" type="url" placeholder="https://..." value={formState.logo_url} onChange={e => handleChange('logo_url', e.target.value)} />
            </FormField>
            <FormField label="Favicon URL" id="favicon_url" description="URL for the browser tab icon. Overrides Favicon Text if provided.">
                <Input id="favicon_url" type="url" placeholder="https://.../favicon.ico" value={formState.favicon_url} onChange={e => handleChange('favicon_url', e.target.value)} />
            </FormField>
             <FormField label="Favicon Text" id="favicon_text" description="Short text (1-2 letters) used as a fallback browser icon.">
                <Input id="favicon_text" type="text" maxLength={2} value={formState.favicon_text} onChange={e => handleChange('favicon_text', e.target.value)} />
            </FormField>
        </Section>
        
         <Section title="Contact & Footer" description="Information displayed on the Contact Us page and in the footer.">
             <FormField label="Office Address" id="contact_address"><Input id="contact_address" type="text" value={formState.contact_address} onChange={e => handleChange('contact_address', e.target.value)} /></FormField>
             <FormField label="Support Email" id="contact_email"><Input id="contact_email" type="email" value={formState.contact_email} onChange={e => handleChange('contact_email', e.target.value)} /></FormField>
             <FormField label="Support Phone" id="contact_phone"><Input id="contact_phone" type="tel" value={formState.contact_phone} onChange={e => handleChange('contact_phone', e.target.value)} /></FormField>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <FormField label="Facebook URL" id="social_facebook"><Input id="social_facebook" type="url" placeholder="https://facebook.com/..." value={formState.social_facebook} onChange={e => handleChange('social_facebook', e.target.value)} /></FormField>
                 <FormField label="Twitter URL" id="social_twitter"><Input id="social_twitter" type="url" placeholder="https://twitter.com/..." value={formState.social_twitter} onChange={e => handleChange('social_twitter', e.target.value)} /></FormField>
                 <FormField label="LinkedIn URL" id="social_linkedin"><Input id="social_linkedin" type="url" placeholder="https://linkedin.com/..." value={formState.social_linkedin} onChange={e => handleChange('social_linkedin', e.target.value)} /></FormField>
             </div>
        </Section>

        <Section title="Functional Settings" description="Control application behavior and limits.">
            <FormField label="Featured Services Limit" id="homepageLimit" description="Max number of services to show on the homepage.">
                <Input id="homepageLimit" type="number" value={formState.homepage_service_limit} onChange={e => handleChange('homepage_service_limit', Number(e.target.value))} min="1" />
            </FormField>
             <FormField label="Max Document Upload Size (MB)" id="max_upload_size" description="Set the maximum size for a single document upload.">
                <Input id="max_upload_size" type="number" value={formState.max_document_upload_size_mb} onChange={e => handleChange('max_document_upload_size_mb', Number(e.target.value))} min="1" />
            </FormField>
            <FormField label="Document Retention Period (Days)" id="document_retention_days" description="Days after a booking is 'Completed' to auto-delete user documents. Set to 0 to disable. Requires the cleanup Edge Function to be deployed.">
                <Input id="document_retention_days" type="number" value={formState.document_retention_days} onChange={e => handleChange('document_retention_days', Number(e.target.value))} min="0" />
            </FormField>
        </Section>

        <Section title="Integrations (Twilio)" description="Configure SMS/WhatsApp notifications for new bookings.">
            <FormField label="Account SID" id="twilioSid"><Input id="twilioSid" type="text" value={formState.twilio_config?.account_sid || ''} onChange={e => handleTwilioChange('account_sid', e.target.value)} placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" /></FormField>
            <FormField label="Auth Token" id="twilioToken"><Input id="twilioToken" type="password" value={formState.twilio_config?.auth_token || ''} onChange={e => handleTwilioChange('auth_token', e.target.value)} placeholder="••••••••••••••••••••" /></FormField>
            <FormField label="Twilio Phone Number" id="twilioFrom"><Input id="twilioFrom" type="text" value={formState.twilio_config?.from_number || ''} onChange={e => handleTwilioChange('from_number', e.target.value)} placeholder="+1234567890" /></FormField>
        </Section>


        <div className="flex items-center justify-end gap-4 pt-2">
            {message && <p className={`text-sm font-medium ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'} flex-1`}>{message}</p>}
            <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-bold text-white bg-admin-accent rounded-lg shadow-sm hover:bg-admin-accent/90 disabled:bg-slate-400 transition-all"
            >
                {loading ? 'Saving...' : 'Save All Settings'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;