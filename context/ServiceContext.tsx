import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Service, AppSettings, PromoBannerSlide, PaymentGateway, BookingConfig } from '../types';
import { Database } from '../database.types';

interface ServiceContextType {
  allServices: Service[];
  featuredServices: Service[];
  settings: AppSettings;
  promoBanners: PromoBannerSlide[];
  paymentGateways: PaymentGateway[];
  loading: boolean;
  refetchServices: () => void;
}

const defaultSettings: AppSettings = {
    homepage_service_limit: 8,
    website_name: "Documentmitra",
    website_description: "Your Government Service Assistant",
    logo_url: "",
    favicon_url: "",
    favicon_text: "DM",
    contact_address: "123 Gov Services Ln, New Delhi, 110001",
    contact_email: "support@documentmitra.gov",
    contact_phone: "+91 1800 123 4567",
    social_facebook: "",
    social_twitter: "",
    social_linkedin: "",
    max_document_upload_size_mb: 5,
    document_retention_days: 0,
    admin_booking_notification_sound: "",
    user_notification_sound: "",
};

export const ServiceContext = createContext<ServiceContextType>({
  allServices: [],
  featuredServices: [],
  settings: defaultSettings,
  promoBanners: [],
  paymentGateways: [],
  loading: true,
  refetchServices: () => {},
});

const buildServiceTree = (flatServices: Database['public']['Tables']['services']['Row'][] | null): Service[] => {
  if (!flatServices) return [];
  
  const serviceMap = new Map<number, Service>();
  const serviceTree: Service[] = [];

  flatServices.forEach(dbService => {
    const service: Service = { 
        ...(dbService as any), 
        booking_config: dbService.booking_config as unknown as BookingConfig | null,
        subServices: [] 
    };
    serviceMap.set(service.id, service);
  });

  serviceMap.forEach(service => {
    if (service.parent_id && serviceMap.has(service.parent_id)) {
      const parent = serviceMap.get(service.parent_id);
      parent?.subServices?.push(service);
    } else {
      serviceTree.push(service);
    }
  });

  return serviceTree;
};


export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [promoBanners, setPromoBanners] = useState<PromoBannerSlide[]>([]);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServicesAndSettings = useCallback(async () => {
    setLoading(true);
    try {
        // Step 1: Fetch core data (services, settings, banners)
        const [servicesRes, settingsRes, bannersRes] = await Promise.all([
            supabase
                .from('services')
                .select('*')
                .order('display_order', { ascending: true })
                .order('name', { ascending: true }),
            supabase
                .from('settings')
                .select('value')
                .eq('key', 'app_settings')
                .single(),
            supabase
                .from('promo_banners')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true }),
        ]);

        // Step 2: Check for critical errors in core data
        if (servicesRes.error) throw servicesRes.error;
        if (bannersRes.error) throw bannersRes.error;
        // A 'PGRST116' error for settings is okay, it just means no row was found.
        if (settingsRes.error && settingsRes.error.code !== 'PGRST116') {
            throw settingsRes.error;
        }

        // Step 3: Process and set state for core data
        const flatServices = servicesRes.data as unknown as Database['public']['Tables']['services']['Row'][];
        const tree = buildServiceTree(flatServices);
        setAllServices(tree);
        
        const appSettings = ((settingsRes.data as any)?.value as AppSettings) || defaultSettings;
        setSettings({...defaultSettings, ...appSettings});

        const featured = (flatServices || [])
            .filter(s => s.is_featured && !s.parent_id)
            .slice(0, appSettings.homepage_service_limit)
            .map(s => ({ 
                ...(s as any), 
                booking_config: s.booking_config as unknown as BookingConfig | null,
                subServices: [] 
            } as Service));
        setFeaturedServices(featured);
        
        setPromoBanners((bannersRes.data as unknown as PromoBannerSlide[]) || []);
        
        // Step 4: Fetch optional data (payment gateways) and handle specific errors
        const gatewaysRes = await supabase
            .from('payment_gateways')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (gatewaysRes.error) {
            // If the table doesn't exist, it's not a critical error. We can continue.
            if (gatewaysRes.error.code === '42P01') {
                console.warn('Payment gateways feature is not available. The "payment_gateways" table is missing.');
                setPaymentGateways([]);
            } else {
                // For any other error, we treat it as critical.
                throw gatewaysRes.error;
            }
        } else {
            setPaymentGateways((gatewaysRes.data as unknown as PaymentGateway[]) || []);
        }

    } catch (err: any) {
        console.error('Error fetching context data:', err.message || 'An unknown error occurred.');
        // If any critical error happens, reset all state to prevent showing stale or incomplete data.
        setAllServices([]);
        setFeaturedServices([]);
        setPromoBanners([]);
        setPaymentGateways([]);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServicesAndSettings();
  }, [fetchServicesAndSettings]);

  const value = {
    allServices,
    featuredServices,
    settings,
    promoBanners,
    paymentGateways,
    loading,
    refetchServices: fetchServicesAndSettings,
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
};