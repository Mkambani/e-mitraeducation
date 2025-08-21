import React, { useState, useEffect, useCallback, useContext } from 'react';
import { supabase } from '../../supabaseClient';
import { PaymentGateway } from '../../types';
import IconMap from '../../components/IconMap';
import { Json } from '../../database.types';
import { ServiceContext } from '../../context/ServiceContext';

const AdminPaymentGatewaysPage: React.FC = () => {
    const [gateways, setGateways] = useState<PaymentGateway[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { refetchServices } = useContext(ServiceContext);

    const fetchGateways = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('payment_gateways')
                .select('*')
                .order('display_order', { ascending: true });
            
            if (error) throw error;
            setGateways((data as any) || []);
        } catch (err: any) {
            setError('Failed to load payment gateways.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGateways();
    }, [fetchGateways]);

    const handleFieldChange = (id: number, field: keyof PaymentGateway, value: any) => {
        setGateways(prev => 
            prev.map(g => g.id === id ? { ...g, [field]: value } : g)
        );
    };

    const handleConfigChange = (id: number, configKey: string, value: any) => {
        setGateways(prev =>
            prev.map(g => {
                if (g.id === id) {
                    const newConfig = { ...g.config, [configKey]: value };
                    return { ...g, config: newConfig };
                }
                return g;
            })
        );
    }

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        
        // Prepare upsert data, Supabase handles create/update based on primary key
        const upsertData = gateways.map(({ id, created_at, ...rest }) => ({
            ...rest,
            config: rest.config as unknown as Json
        }));

        try {
            const { error } = await supabase.from('payment_gateways').upsert(upsertData, {
                onConflict: 'key',
                ignoreDuplicates: false,
            });

            if (error) throw error;
            setSuccess('Payment gateway settings saved successfully!');
            fetchGateways(); // Refetch to sync local state on this page
            refetchServices(); // Refetch global context for the entire app
        } catch (err: any) {
            setError(`Failed to save settings: ${err.message}`);
        } finally {
            setSaving(false);
            setTimeout(() => setSuccess(''), 3000);
        }
    }

    return (
        <div className="bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border">
            <div className="mb-6 pb-6 border-b border-admin-card-border">
                <h2 className="text-xl font-bold text-admin-heading">Payment Gateways</h2>
                <p className="text-admin-light/80 mt-1">
                    Enable, disable, and configure the payment methods available to users.
                </p>
            </div>
            
            <div className="space-y-6">
                {loading && <p className="text-admin-light">Loading gateways...</p>}
                {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-md">{error}</p>}
                
                <div className="space-y-8">
                    {gateways.map(gw => (
                        <div key={gw.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start border-t border-admin-card-border pt-6 first:border-t-0 first:pt-0">
                            {/* Left: General Info */}
                            <div className="md:col-span-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <IconMap iconName={gw.icon_name} className="h-8 w-8 text-admin-accent" />
                                    <input 
                                        type="text" 
                                        value={gw.name}
                                        onChange={(e) => handleFieldChange(gw.id, 'name', e.target.value)}
                                        className="text-lg font-bold text-admin-heading bg-transparent border-b border-dashed border-admin-card-border focus:outline-none focus:border-solid focus:border-admin-accent w-full"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                     <label className="flex items-center gap-2 font-semibold text-sm cursor-pointer text-admin-light">
                                        <input 
                                            type="checkbox" 
                                            checked={gw.is_active} 
                                            onChange={e => handleFieldChange(gw.id, 'is_active', e.target.checked)} 
                                            className="w-5 h-5 accent-admin-accent rounded"
                                        />
                                        Active
                                    </label>
                                    <div>
                                        <label className="text-xs font-semibold text-admin-light/70">Order</label>
                                        <input 
                                            type="number" 
                                            value={gw.display_order} 
                                            onChange={e => handleFieldChange(gw.id, 'display_order', Number(e.target.value))}
                                            className="w-16 p-1 rounded bg-admin-main-bg text-admin-heading text-center"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Right: Configuration */}
                            <div className="md:col-span-2 space-y-3">
                                {gw.key === 'razorpay' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-admin-light">Razorpay Key ID</label>
                                            <input 
                                                type="text" 
                                                placeholder="rzp_live_..."
                                                value={gw.config?.key_id || ''}
                                                onChange={e => handleConfigChange(gw.id, 'key_id', e.target.value)}
                                                className="w-full p-2 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-admin-light">Razorpay Key Secret</label>
                                            <input 
                                                type="password" 
                                                placeholder="Your secret key"
                                                value={gw.config?.key_secret || ''}
                                                onChange={e => handleConfigChange(gw.id, 'key_secret', e.target.value)}
                                                className="w-full p-2 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition"
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-admin-light">Description</label>
                                    <input 
                                        type="text" 
                                        placeholder="Displayed to user on payment screen"
                                        value={gw.config?.description || ''}
                                        onChange={e => handleConfigChange(gw.id, 'description', e.target.value)}
                                        className="w-full p-2 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                 <div className="flex items-center justify-end gap-4 border-t border-admin-card-border pt-6">
                    {success && <p className="text-sm font-medium text-green-400 flex-1">{success}</p>}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-admin-accent rounded-lg shadow-sm hover:bg-admin-accent/90 disabled:bg-slate-400 transition-all"
                    >
                        {saving ? 'Saving...' : 'Save All Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPaymentGatewaysPage;