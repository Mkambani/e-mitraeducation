
import React, { useContext, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useAuth } from './context/AuthContext';
import { ServiceContext } from './context/ServiceContext';
import IconMap from './components/IconMap';
import { Database } from './database.types';

const { useLocation, useNavigate } = ReactRouterDOM as any;

const PaymentPage: React.FC = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { paymentGateways, loading: gatewaysLoading } = useContext(ServiceContext);

    const { serviceName, bookingId, price } = state || {};

    const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = async (gatewayKey: string) => {
        setSelectedGateway(gatewayKey);
        setProcessing(true);
        setError(null);

        // Simulate API call to payment gateway
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const updatePayload = { 
                status: 'Pending', 
                payment_method: gatewayKey,
                payment_id: `${gatewayKey}_${Date.now()}`
            };
            const { error: updateError } = await supabase
                .from('bookings')
                .update(updatePayload)
                .eq('id', bookingId);

            if (updateError) throw updateError;
            
            navigate('/booking-confirmed', { state: { serviceName, bookingId, price } });

        } catch (err: any) {
            setError('Failed to update booking after payment. Please contact support.');
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };
    
    // Filter gateways: show COD only if user profile has it enabled
    const availableGateways = paymentGateways.filter(gateway => {
        if (gateway.key === 'cod') {
            return profile?.cod_enabled === true;
        }
        return true;
    });

    if (!bookingId || price == null) {
        return (
            <div className="text-center p-10">
                <h2 className="text-2xl font-bold">Invalid Payment State</h2>
                <p>No booking details found. Please start the booking process again.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
                        Choose Payment Method
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        For your booking of <span className="font-semibold text-slate-700 dark:text-slate-300">{serviceName}</span>
                    </p>
                    <div className="my-6">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Amount</p>
                        <p className="text-5xl font-black text-cyan-500 tracking-tighter">₹{price}</p>
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                    {gatewaysLoading ? (
                        <p className="text-center text-slate-500">Loading payment options...</p>
                    ) : availableGateways.length > 0 ? (
                        availableGateways.map(gateway => (
                            <button
                                key={gateway.key}
                                onClick={() => handlePayment(gateway.key)}
                                disabled={processing}
                                className="w-full flex items-center gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent hover:border-cyan-500 hover:bg-white dark:hover:bg-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
                            >
                                <IconMap iconName={gateway.icon_name} className="h-10 w-10 text-cyan-500" />
                                <div className="text-left">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{gateway.name}</h3>
                                    {gateway.config?.description && <p className="text-sm text-slate-500 dark:text-slate-400">{gateway.config.description}</p>}
                                </div>
                                <div className="ml-auto">
                                    {processing && selectedGateway === gateway.key ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500"></div>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    )}
                                </div>
                            </button>
                        ))
                    ) : (
                        <p className="text-center text-slate-500">No payment methods are currently available. Please contact support.</p>
                    )}
                </div>
                 {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default PaymentPage;