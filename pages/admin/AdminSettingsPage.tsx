import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../../supabaseClient';
import { AppSettings } from '../../types';
import { ServiceContext } from '../../context/ServiceContext';
import { Json } from '../../database.types';

const AdminSettingsPage: React.FC = () => {
  const { settings, refetchServices } = useContext(ServiceContext);
  
  const [homepageLimit, setHomepageLimit] = useState(8);
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioFromNumber, setTwilioFromNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setHomepageLimit(settings.homepage_service_limit);
    setTwilioSid(settings.twilio_config?.account_sid || '');
    setTwilioToken(settings.twilio_config?.auth_token || '');
    setTwilioFromNumber(settings.twilio_config?.from_number || '');
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const newSettings: AppSettings = {
      homepage_service_limit: Number(homepageLimit),
      twilio_config: {
        account_sid: twilioSid,
        auth_token: twilioToken,
        from_number: twilioFromNumber
      }
    };

    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: newSettings as unknown as Json })
        .eq('key', 'app_settings');

      if (error) {
        // If update fails, maybe the row doesn't exist. Try to insert it.
        const { error: insertError } = await supabase
            .from('settings')
            .insert({ key: 'app_settings', value: newSettings as unknown as Json });
        if(insertError) throw insertError;
      }
      
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      refetchServices(); // Re-fetch to update context
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <form onSubmit={handleSave} className="space-y-8">
        {/* Homepage Settings */}
        <div className="bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border">
            <h2 className="text-xl font-bold text-admin-heading">Homepage</h2>
            <p className="text-sm text-admin-light mt-1 mb-6">Control what appears on the main landing page.</p>
            
            <div className="border-t border-admin-card-border pt-6">
                <label htmlFor="homepageLimit" className="block text-base font-semibold text-admin-heading">
                    Featured Services Limit
                </label>
                <p className="text-sm text-admin-light/80 mb-2">
                    Set the maximum number of "featured" services to show on the homepage.
                </p>
                <input
                    id="homepageLimit"
                    type="number"
                    value={homepageLimit}
                    onChange={(e) => setHomepageLimit(Number(e.target.value))}
                    min="1"
                    className="w-full max-w-xs p-3 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition"
                />
            </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border">
            <h2 className="text-xl font-bold text-admin-heading">Notification Settings (Twilio)</h2>
            <p className="text-sm text-admin-light mt-1 mb-6">Configure SMS/WhatsApp notifications for new bookings.</p>
            
            <div className="border-t border-admin-card-border pt-6 space-y-4">
                 <div>
                    <label htmlFor="twilioSid" className="block text-base font-semibold text-admin-heading mb-1">Account SID</label>
                    <input id="twilioSid" type="text" value={twilioSid} onChange={e => setTwilioSid(e.target.value)} placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className="w-full p-3 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition" />
                </div>
                 <div>
                    <label htmlFor="twilioToken" className="block text-base font-semibold text-admin-heading mb-1">Auth Token</label>
                    <input id="twilioToken" type="password" value={twilioToken} onChange={e => setTwilioToken(e.target.value)} placeholder="••••••••••••••••••••" className="w-full p-3 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition" />
                </div>
                 <div>
                    <label htmlFor="twilioFrom" className="block text-base font-semibold text-admin-heading mb-1">Twilio Phone Number</label>
                    <input id="twilioFrom" type="text" value={twilioFromNumber} onChange={e => setTwilioFromNumber(e.target.value)} placeholder="+1234567890" className="w-full p-3 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition" />
                </div>
            </div>
        </div>


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
