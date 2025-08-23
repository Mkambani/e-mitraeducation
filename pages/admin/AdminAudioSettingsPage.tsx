import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../../supabaseClient';
import { AppSettings } from '../../types';
import { ServiceContext } from '../../context/ServiceContext';
import { Json } from '../../database.types';

const PRESET_SOUNDS = {
    admin: [
        { name: 'Alert', url: 'https://cdn.freesound.org/previews/253/253886_4062622-lq.mp3' },
        { name: 'Notify', url: 'https://cdn.freesound.org/previews/403/403014_5121236-lq.mp3' },
        { name: 'Success', url: 'https://cdn.freesound.org/previews/341/341695_5121236-lq.mp3' },
        { name: 'None', url: '' },
    ],
    user: [
        { name: 'Chime', url: 'https://cdn.freesound.org/previews/571/571216_8350742-lq.mp3' },
        { name: 'Message', url: 'https://cdn.freesound.org/previews/341/341233_3248397-lq.mp3' },
        { name: 'Pop', url: 'https://cdn.freesound.org/previews/66/66717_634166-lq.mp3' },
        { name: 'None', url: '' },
    ]
};

const Section: React.FC<{ title: string; description: string; children: React.ReactNode; }> = ({ title, description, children }) => (
    <div className="bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border">
        <h2 className="text-xl font-bold text-admin-heading">{title}</h2>
        <p className="text-sm text-admin-light mt-1 mb-6">{description}</p>
        <div className="border-t border-admin-card-border pt-6">
            {children}
        </div>
    </div>
);

const AudioUploadField: React.FC<{
    label: string;
    currentUrl: string | null | undefined;
    stagedFile: File | null;
    onFileChange: (file: File | null) => void;
    onUrlChange: (url: string) => void;
    presets: { name: string, url: string }[];
}> = ({ label, currentUrl, stagedFile, onFileChange, onUrlChange, presets }) => {

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUrlChange(''); // Clear URL from preset if a file is uploaded
            onFileChange(e.target.files[0]);
        }
    };

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFileChange(null); // Clear staged file if a preset is selected
        onUrlChange(e.target.value);
    };
    
    const handleTestSound = () => {
        let soundUrlToPlay = '';
        if (stagedFile) {
            soundUrlToPlay = URL.createObjectURL(stagedFile);
        } else if (currentUrl) {
            soundUrlToPlay = currentUrl;
        }

        if (soundUrlToPlay) {
            const audio = new Audio(soundUrlToPlay);
            audio.play().catch(e => alert(`Could not play audio: ${e.message}`));
        } else {
            alert('No sound selected to test.');
        }
    };

    let displayValue = 'No sound selected';
    if (stagedFile) {
        displayValue = stagedFile.name;
    } else if (currentUrl) {
        try {
            displayValue = decodeURIComponent(new URL(currentUrl).pathname.split('/').pop() || 'Sound File');
        } catch (e) {
            displayValue = 'Invalid URL';
        }
    }
    
    return (
        <div>
            <label className="block text-base font-semibold text-admin-heading mb-2">
                {label}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="p-4 bg-admin-main-bg border border-admin-card-border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-admin-light flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M18 3a1 1 0 00-1.447-.894L4 6.424v6.152a1 1 0 00.553.894l12 6A1 1 0 0018 19V3z" /></svg>
                        <p className="text-sm text-admin-light truncate" title={displayValue}>{displayValue}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button type="button" onClick={handleTestSound} className="text-xs font-bold text-admin-accent hover:underline">Test</button>
                        <label className="text-xs font-bold text-admin-heading cursor-pointer bg-admin-light/20 px-3 py-1.5 rounded-md hover:bg-admin-light/30 transition">
                            {stagedFile || currentUrl ? 'Change' : 'Upload'}
                            <input type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />
                        </label>
                    </div>
                </div>
                <select 
                    value={currentUrl || ''}
                    onChange={handlePresetChange}
                    className="w-full p-3 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-2 focus:ring-admin-accent focus:border-admin-accent transition"
                >
                    <option value="" disabled>Or select a preset...</option>
                    {presets.map(p => <option key={p.name} value={p.url}>{p.name}</option>)}
                </select>
            </div>
        </div>
    );
}

const AdminAudioSettingsPage: React.FC = () => {
  const { settings, refetchServices } = useContext(ServiceContext);
  
  const [formState, setFormState] = useState<Pick<AppSettings, 'admin_booking_notification_sound' | 'user_notification_sound'> | null>(null);
  const [adminSoundFile, setAdminSoundFile] = useState<File | null>(null);
  const [userSoundFile, setUserSoundFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (settings && formState === null) {
      setFormState({
        admin_booking_notification_sound: settings.admin_booking_notification_sound,
        user_notification_sound: settings.user_notification_sound
      });
    }
  }, [settings, formState]);

  const handleUrlChange = (field: keyof typeof formState, value: string) => {
    setFormState(prev => (prev ? { ...prev, [field]: value } : null));
    if (field === 'admin_booking_notification_sound') setAdminSoundFile(null);
    if (field === 'user_notification_sound') setUserSoundFile(null);
  };
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState) return;

    setLoading(true);
    setMessage('');

    try {
        const updatedFormState = { ...formState };
        
        const deleteOldFile = async (publicUrl: string | null | undefined) => {
            if (!publicUrl || !publicUrl.includes('supabase.co')) return;
            try {
                const url = new URL(publicUrl);
                const path = url.pathname.split('/notification-sounds/')[1];
                if (path) {
                    await supabase.storage.from('notification-sounds').remove([path]);
                }
            } catch (e) {
                console.warn("Could not parse or delete old sound file, continuing.", e);
            }
        };

        if (adminSoundFile) {
            await deleteOldFile(settings.admin_booking_notification_sound);
            const filePath = `public/admin-sound-${Date.now()}.${adminSoundFile.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage.from('notification-sounds').upload(filePath, adminSoundFile);
            if (uploadError) throw new Error(`Admin sound upload failed: ${uploadError.message}`);
            const { data } = supabase.storage.from('notification-sounds').getPublicUrl(filePath);
            updatedFormState.admin_booking_notification_sound = data.publicUrl;
        }

        if (userSoundFile) {
            await deleteOldFile(settings.user_notification_sound);
            const filePath = `public/user-sound-${Date.now()}.${userSoundFile.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage.from('notification-sounds').upload(filePath, userSoundFile);
            if (uploadError) throw new Error(`User sound upload failed: ${uploadError.message}`);
            const { data } = supabase.storage.from('notification-sounds').getPublicUrl(filePath);
            updatedFormState.user_notification_sound = data.publicUrl;
        }

      const { data: currentSettings, error: fetchError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'app_settings')
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      
      const existingValue = currentSettings?.value;
      const updatedSettingsValue = {
        ...(existingValue && typeof existingValue === 'object' && !Array.isArray(existingValue) ? existingValue : {}),
        ...updatedFormState
      };

      const { error: updateError } = await supabase
        .from('settings')
        .update({ value: updatedSettingsValue as unknown as Json })
        .eq('key', 'app_settings');

      if (updateError) {
        if (updateError.code === 'PGRST116') { // Row not found, so insert
             const { error: insertError } = await supabase
                .from('settings')
                .insert({ key: 'app_settings', value: updatedSettingsValue as unknown as Json });
            if(insertError) throw insertError;
        } else {
            throw updateError;
        }
      }
      
      setMessage('Settings saved successfully!');
      setAdminSoundFile(null);
      setUserSoundFile(null);
      setTimeout(() => setMessage(''), 3000);
      refetchServices();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (!formState) {
    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
            <div className="h-64 bg-admin-card-bg rounded-xl border border-admin-card-border"></div>
        </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <form onSubmit={handleSave}>
        <Section title="Notification Sounds" description="Set custom audio alerts for important events in the application.">
            <div className="space-y-8">
                <AudioUploadField
                    label="Admin: New Booking Sound"
                    currentUrl={formState.admin_booking_notification_sound}
                    stagedFile={adminSoundFile}
                    onFileChange={setAdminSoundFile}
                    onUrlChange={(val) => handleUrlChange('admin_booking_notification_sound', val)}
                    presets={PRESET_SOUNDS.admin}
                />
                 <AudioUploadField
                    label="User: New Notification Sound"
                    currentUrl={formState.user_notification_sound}
                    stagedFile={userSoundFile}
                    onFileChange={setUserSoundFile}
                    onUrlChange={(val) => handleUrlChange('user_notification_sound', val)}
                    presets={PRESET_SOUNDS.user}
                />
            </div>
        </Section>

        <div className="flex items-center justify-end gap-4 pt-2">
            {message && <p className={`text-sm font-medium ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'} flex-1`}>{message}</p>}
            <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-bold text-white bg-admin-accent rounded-lg shadow-sm hover:bg-admin-accent/90 disabled:bg-slate-400 transition-all"
            >
                {loading ? 'Saving...' : 'Save Audio Settings'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAudioSettingsPage;
