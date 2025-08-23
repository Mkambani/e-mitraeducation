# Admin Panel & Database Setup SQL

-- IMPORTANT:
-- This is a complete, idempotent script to set up your Supabase database from scratch.
-- "Idempotent" means you can run it multiple times safely without causing errors.
-- It will completely reset your database tables to the latest schema required by the application.

-- -----------------------------------------------------------------------------
-- CRITICAL STEP 1: ENABLE EXTENSIONS
-- -----------------------------------------------------------------------------
-- The following extension is required for location-based features.
-- 1. Go to the "Database" section in your Supabase Dashboard.
-- 2. Click on "Extensions".
-- 3. Search for "postgis" and enable it. This is mandatory for location features to work.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- CRITICAL STEP 2: CREATE STORAGE BUCKETS (MANUAL & MANDATORY)
-- -----------------------------------------------------------------------------
-- Failure to complete these steps WILL result in "Bucket not found" errors in the app.
--
-- 1. Go to the "Storage" section (bucket icon) in your Supabase Dashboard.
-- 2. Create the following FIVE buckets. Ensure the names are exactly as written below.
--
--    - Name: documents
--      -> Toggle ON "Public bucket"
--
--    - Name: service-icons
--      -> Toggle ON "Public bucket"
--
--    - Name: avatars
--      -> Toggle ON "Public bucket"
--
--    - Name: promo-banners
--      -> Toggle ON "Public bucket"
--
--    - Name: notification-sounds
--      -> Toggle ON "Public bucket"
--
-- TROUBLESHOOTING: If you see any file upload errors, it's almost certain that
-- this manual step was missed or the buckets were named incorrectly. Please double-check.
-- -----------------------------------------------------------------------------


-- -----------------------------------------------------------------------------
-- STEP 3: RUN THIS ENTIRE SQL SCRIPT
-- -----------------------------------------------------------------------------
-- Copy everything below this line and run it in your Supabase project's SQL Editor.
-- -----------------------------------------------------------------------------

-- 1. TABLES
-- Drop existing tables in reverse order of dependency to avoid foreign key errors.
-- CASCADE will automatically remove dependent objects like policies and triggers.
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.service_centers CASCADE;
DROP TABLE IF EXISTS public.payment_gateways CASCADE;
DROP TABLE IF EXISTS public.promo_banners CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;


-- Recreate tables with the latest schema.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  dob DATE,
  mobile_number TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' NOT NULL,
  cod_enabled BOOLEAN DEFAULT false NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'Stores user-specific public data and application role.';

CREATE TABLE public.services (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  parent_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  is_bookable BOOLEAN DEFAULT false NOT NULL,
  booking_config JSONB,
  price NUMERIC(10, 2)
);
COMMENT ON TABLE public.services IS 'Stores all services, supporting a nested/tree structure.';

CREATE TABLE public.service_centers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  location GEOGRAPHY(Point, 4326),
  service_id BIGINT REFERENCES public.services(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.service_centers IS 'Stores physical locations where services are offered.';


CREATE TABLE public.bookings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    service_id BIGINT REFERENCES services(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'Pending' NOT NULL,
    user_details JSONB,
    uploaded_files JSONB,
    proof_of_completion_files JSONB,
    admin_notes JSONB,
    user_messages JSONB,
    payment_method TEXT,
    payment_id TEXT,
    final_price NUMERIC(10, 2),
    review_submitted BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);
COMMENT ON TABLE public.bookings IS 'Tracks all service bookings made by users.';

CREATE TABLE public.reviews (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    booking_id BIGINT UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    service_id BIGINT REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.reviews IS 'Stores user reviews for completed bookings.';

CREATE TABLE public.notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.notifications IS 'Stores notifications for users, both individual and broadcast.';

CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.settings IS 'A key-value store for global application settings.';

CREATE TABLE public.promo_banners (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  image_url TEXT,
  mobile_image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.promo_banners IS 'Stores data for the promotional banner carousel on the homepage.';

CREATE TABLE public.payment_gateways (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.payment_gateways IS 'Configuration for different payment providers.';

CREATE TABLE public.contact_messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE public.contact_messages IS 'Stores messages submitted through the public contact form.';


-- 2. SECURE HELPER FUNCTION FOR RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN 'anon'; END IF;
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$;
COMMENT ON FUNCTION public.get_my_role() IS 'Securely fetches the role of the currently authenticated user.';


-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Allow users to manage own profile" ON public.profiles;
CREATE POLICY "Allow users to manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (public.get_my_role() = 'admin');
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);

-- Services Policies
DROP POLICY IF EXISTS "Allow public read access to all services" ON public.services;
CREATE POLICY "Allow public read access to all services" ON public.services FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage all services" ON public.services;
CREATE POLICY "Admins can manage all services" ON public.services FOR ALL USING (public.get_my_role() = 'admin');

-- Service Centers Policies
DROP POLICY IF EXISTS "Allow public read access to service centers" ON public.service_centers;
CREATE POLICY "Allow public read access to service centers" ON public.service_centers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage all service centers" ON public.service_centers;
CREATE POLICY "Admins can manage all service centers" ON public.service_centers FOR ALL USING (public.get_my_role() = 'admin');

-- Bookings Policies
DROP POLICY IF EXISTS "Users can manage their own bookings" ON public.bookings;
CREATE POLICY "Users can manage their own bookings" ON public.bookings FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL USING (public.get_my_role() = 'admin');

-- Reviews Policies
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = true);
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
CREATE POLICY "Users can create their own reviews" ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = booking_id
        AND b.user_id = auth.uid()
        AND b.review_submitted = false
    )
);
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
CREATE POLICY "Admins can manage all reviews" ON public.reviews FOR ALL USING (public.get_my_role() = 'admin');

-- Settings Policies
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.settings;
CREATE POLICY "Allow public read access to settings" ON public.settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (public.get_my_role() = 'admin');

-- Promo Banners Policies
DROP POLICY IF EXISTS "Allow public read access to active banners" ON public.promo_banners;
CREATE POLICY "Allow public read access to active banners" ON public.promo_banners FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage all banners" ON public.promo_banners;
CREATE POLICY "Admins can manage all banners" ON public.promo_banners FOR ALL USING (public.get_my_role() = 'admin');

-- Notifications Policies
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
CREATE POLICY "Admins can manage all notifications" ON public.notifications FOR ALL USING (public.get_my_role() = 'admin');

-- Payment Gateways Policies
DROP POLICY IF EXISTS "Allow public read access to active gateways" ON public.payment_gateways;
CREATE POLICY "Allow public read access to active gateways" ON public.payment_gateways FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage all gateways" ON public.payment_gateways;
CREATE POLICY "Admins can manage all gateways" ON public.payment_gateways FOR ALL USING (public.get_my_role() = 'admin');

-- Contact Messages Policies
DROP POLICY IF EXISTS "Allow anonymous users to insert contact messages" ON public.contact_messages;
CREATE POLICY "Allow anonymous users to insert contact messages" ON public.contact_messages FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can manage all contact messages" ON public.contact_messages;
CREATE POLICY "Admins can manage all contact messages" ON public.contact_messages FOR ALL USING (public.get_my_role() = 'admin');


-- 4. TRIGGERS AND AUTOMATIONS
-- Trigger to create a profile when a new user signs up in Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, dob, mobile_number, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', (new.raw_user_meta_data->>'dob')::date, new.raw_user_meta_data->>'mobile_number', 'user');
  RETURN new;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to update the booking status after a review is submitted.
CREATE OR REPLACE FUNCTION public.handle_new_review()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.bookings
  SET review_submitted = true
  WHERE id = NEW.booking_id;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE PROCEDURE public.handle_new_review();

-- 5. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.find_centers_near(lat double precision, long double precision)
RETURNS TABLE (
    id bigint,
    name text,
    address text,
    service_id bigint,
    latitude double precision,
    longitude double precision,
    distance_km double precision,
    services json
)
LANGUAGE sql
AS $$
  SELECT
    sc.id,
    sc.name,
    sc.address,
    sc.service_id,
    ST_Y(sc.location::geometry) as latitude,
    ST_X(sc.location::geometry) as longitude,
    (ST_Distance(sc.location, ST_MakePoint(long, lat)::geography) / 1000) as distance_km,
    json_build_object('name', s.name, 'icon_name', s.icon_url) as services
  FROM
    public.service_centers sc
  LEFT JOIN
    public.services s ON sc.service_id = s.id
  ORDER BY
    distance_km
  LIMIT 20;
$$;


-- 6. SEED DATA (INITIAL CONTENT)
-- Clear tables before seeding to ensure a clean state.
TRUNCATE TABLE public.payment_gateways RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.bookings RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.services RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.settings RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.promo_banners RESTART IDENTITY CASCADE;

DO $$
DECLARE
  aadhaar_id BIGINT;
  print_aadhaar_id BIGINT;
  passport_id BIGINT;
  license_id BIGINT;
  voterid_id BIGINT;
  
  standard_booking_config JSONB := '{
    "form_fields": [
      {"id": "fullName", "label": "Full Name", "type": "text", "required": true},
      {"id": "dob", "label": "Date of Birth", "type": "date", "required": true},
      {"id": "email", "label": "Email Address", "type": "email", "required": true},
      {"id": "mobile", "label": "Mobile Number", "type": "tel", "required": true}
    ],
    "document_requirements": [
      {"id": "poi", "name": "Proof of Identity", "description": "e.g. Aadhaar Card, Voter ID"},
      {"id": "poa", "name": "Proof of Address", "description": "e.g. Electricity Bill, Bank Passbook"}
    ]
  }';
  
  print_booking_config JSONB := '{
    "form_fields": [
      {"id": "aadhaarNumber", "label": "Aadhaar Number", "type": "text", "required": true},
      {"id": "fullName", "label": "Full Name (as on card)", "type": "text", "required": true}
    ],
    "document_requirements": []
  }';

BEGIN
  -- Top-Level Services
  INSERT INTO services (name, description, is_featured, display_order) VALUES ('Aadhaar Card', 'Manage your Aadhaar identity and details.', true, 10) RETURNING id INTO aadhaar_id;
  INSERT INTO services (name, description, is_featured, display_order) VALUES ('Passport', 'Apply for new passports and renewals.', true, 20) RETURNING id INTO passport_id;
  INSERT INTO services (name, description, is_featured, display_order) VALUES ('Driving License', 'Services for learner and permanent licenses.', true, 30) RETURNING id INTO license_id;
  INSERT INTO services (name, description, is_featured, display_order) VALUES ('Voter ID', 'Register as a voter or update details.', true, 40) RETURNING id INTO voterid_id;
  INSERT INTO services (name, description, is_featured, display_order) VALUES ('Pension', 'Services related to pension schemes.', true, 50);
  INSERT INTO services (name, description, is_featured, display_order) VALUES ('Birth Certificate', 'Register births and manage certificates.', true, 60);
  INSERT INTO services (name, description, is_featured, display_order) VALUES ('Govt. Schemes', 'Apply for various beneficial schemes.', true, 70);
  INSERT INTO services (name, description, is_featured, display_order) VALUES ('Land Registry', 'Property registration and land records.', true, 80);

  -- Bookable Sub-Services
  INSERT INTO services (name, parent_id, description, is_bookable, booking_config, price, display_order) VALUES 
  ('New Enrollment', aadhaar_id, 'Apply for a new Aadhaar card.', true, standard_booking_config, 50.00, 10),
  ('Update Address', aadhaar_id, 'Change the address on your Aadhaar.', true, standard_booking_config, 50.00, 20);
  
  INSERT INTO services (name, parent_id, description, is_bookable, display_order) VALUES
  ('Print Aadhaar', aadhaar_id, 'Get a physical copy of your Aadhaar card.', false, 30) RETURNING id INTO print_aadhaar_id;

  INSERT INTO services (name, parent_id, description, is_bookable, booking_config, price, display_order) VALUES
  ('Paper Printout', print_aadhaar_id, 'A standard black and white paper print.', true, print_booking_config, 30.00, 10),
  ('Plastic Card (PVC)', print_aadhaar_id, 'A durable, credit-card sized plastic version.', true, print_booking_config, 100.00, 20);
  
  INSERT INTO services (name, parent_id, description, is_bookable, booking_config, price) VALUES 
  ('New Passport', passport_id, 'Apply for a fresh Indian passport.', true, standard_booking_config, 1500.00),
  ('Renew Passport', passport_id, 'Renew your expired passport.', true, standard_booking_config, 1000.00),
  ('Learner''s License', license_id, 'Apply for a new learner''s license.', true, standard_booking_config, 200.00),
  ('Permanent License', license_id, 'Apply for a permanent driving license.', true, standard_booking_config, 700.00),
  ('New Voter Registration', voterid_id, 'Enroll as a new voter.', true, standard_booking_config, 0.00);

  -- Insert default app settings
  INSERT INTO public.settings (key, value)
  VALUES ('app_settings', '{
    "homepage_service_limit": 8,
    "website_name": "Documentmitra",
    "website_description": "Your Government Service Assistant",
    "logo_url": "",
    "favicon_url": "",
    "favicon_text": "DM",
    "contact_address": "123 Gov Services Ln, New Delhi, 110001",
    "contact_email": "support@documentmitra.gov",
    "contact_phone": "+91 1800 123 4567",
    "social_facebook": "https://facebook.com",
    "social_twitter": "https://twitter.com",
    "social_linkedin": "https://linkedin.com",
    "max_document_upload_size_mb": 5,
    "document_retention_days": 30,
    "admin_booking_notification_sound": "https://cdn.freesound.org/previews/253/253886_4062622-lq.mp3",
    "user_notification_sound": "https://cdn.freesound.org/previews/571/571216_8350742-lq.mp3",
    "twilio_config": {
        "account_sid": "YOUR_TWILIO_ACCOUNT_SID",
        "auth_token": "YOUR_TWILIO_AUTH_TOKEN",
        "from_number": "YOUR_TWILIO_PHONE_NUMBER"
    }
  }')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

  -- Insert default promo banners
  INSERT INTO public.promo_banners (image_url, mobile_image_url, link_url, is_active, display_order) VALUES
  (null, null, '/services', true, 10),
  (null, null, '/about', true, 20);

  -- Insert default payment gateways
  INSERT INTO public.payment_gateways (key, name, icon_name, is_active, display_order, config) VALUES
  ('razorpay', 'Razorpay', 'RazorpayIcon', true, 10, '{"key_id": "YOUR_RAZORPAY_KEY_ID", "key_secret": "YOUR_RAZORPAY_KEY_SECRET", "description": "Pay securely with Razorpay."}'),
  ('cod', 'Cash on Delivery', 'CashIcon', true, 20, '{"description": "Pay at the time of service completion."}');

END $$;


-- 7. STORAGE RLS POLICIES
-- After creating the public buckets in the dashboard (Step 1), these policies secure them.

-- Drop existing policies first to ensure the script is re-runnable.
DROP POLICY IF EXISTS "Allow authenticated users to upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their own documents and admins all" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to service icons" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to manage service icons" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to promo banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to manage promo banners" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to notification sounds" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to manage notification sounds" ON storage.objects;


-- 'documents' bucket policies
CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Allow users to view their own documents and admins all" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.get_my_role() = 'admin'));
CREATE POLICY "Allow users to update their own documents" ON storage.objects
  FOR UPDATE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
  
-- 'service-icons' bucket policies
CREATE POLICY "Allow public read access to service icons" ON storage.objects
  FOR SELECT USING (bucket_id = 'service-icons');
CREATE POLICY "Allow admins to manage service icons" ON storage.objects
  FOR ALL USING (bucket_id = 'service-icons' AND public.get_my_role() = 'admin');

-- 'avatars' bucket policies
CREATE POLICY "Allow public read access to avatars" ON storage.objects 
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Allow users to update their own avatar" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Allow users to delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 'promo-banners' bucket policies
CREATE POLICY "Allow public read access to promo banners" ON storage.objects
  FOR SELECT USING (bucket_id = 'promo-banners');
CREATE POLICY "Allow admins to manage promo banners" ON storage.objects
  FOR ALL USING (bucket_id = 'promo-banners' AND public.get_my_role() = 'admin');

-- 'notification-sounds' bucket policies
CREATE POLICY "Allow public read access to notification sounds" ON storage.objects
  FOR SELECT USING (bucket_id = 'notification-sounds');
CREATE POLICY "Allow admins to manage notification sounds" ON storage.objects
  FOR ALL USING (bucket_id = 'notification-sounds' AND public.get_my_role() = 'admin');


-- 8. AUTOMATED DOCUMENT CLEANUP FOR COMPLETED BOOKINGS
-- -----------------------------------------------------------------------------
-- This feature is OPTIONAL BUT RECOMMENDED for data privacy and storage management.
-- It automatically deletes documents from completed bookings after a specified
-- number of days (configurable in the Admin Panel -> App Settings).
--
-- NOTE ON ORPHANED FILES: The application's upload process has been designed to
-- prevent "orphaned" files (files uploaded by users who abandon the booking process).
-- Files are now uploaded only *after* a booking is successfully confirmed, making a
-- separate cleanup script for orphaned files unnecessary.
--
-- This process requires a scheduled Supabase Edge Function to run daily.
--
-- 1. Create a new Supabase Edge Function named `cleanup-completed-docs`.
--
-- 2. Inside the function's `index.ts` file, paste the following Deno/TypeScript code:
--
--    ```typescript
--    import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
--    import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
--
--    const corsHeaders = {
--      'Access-Control-Allow-Origin': '*',
--      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
--    };
--
--    serve(async (req) => {
--      if (req.method === 'OPTIONS') {
--        return new Response('ok', { headers: corsHeaders });
--      }
--
--      try {
--        const supabaseClient = createClient(
--          Deno.env.get('SUPABASE_URL') ?? '',
--          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
--          { global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` } } }
--        );
--
--        const { data: settingsData, error: settingsError } = await supabaseClient
--          .from('settings')
--          .select('value')
--          .eq('key', 'app_settings')
--          .single();
--
--        if (settingsError) throw new Error(`Could not fetch settings: ${settingsError.message}`);
--
--        const retentionDays = settingsData?.value?.document_retention_days;
--        if (!retentionDays || retentionDays <= 0) {
--          console.log('Document retention is disabled. Exiting.');
--          return new Response(JSON.stringify({ message: "Document retention disabled." }), {
--            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
--          });
--        }
--
--        const cutoffDate = new Date();
--        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
--
--        const { data: bookingsToClean, error: bookingsError } = await supabaseClient
--          .from('bookings')
--          .select('id, uploaded_files')
--          .eq('status', 'Completed')
--          .lt('completed_at', cutoffDate.toISOString())
--          .not('uploaded_files', 'is', null);
--
--        if (bookingsError) throw new Error(`Could not fetch bookings for cleanup: ${bookingsError.message}`);
--        
--        if (bookingsToClean.length === 0) {
--            return new Response(JSON.stringify({ message: "No bookings to clean." }), {
--                headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
--            });
--        }
--
--        let deletedFilesCount = 0;
--        const cleanedBookingIds = [];
--
--        for (const booking of bookingsToClean) {
--          const files = booking.uploaded_files;
--          if (files && typeof files === 'object' && Object.keys(files).length > 0) {
--            const filePaths = Object.values(files).map((file: any) => file.path);
--            
--            if (filePaths.length > 0) {
--              const { error: storageError } = await supabaseClient.storage
--                .from('documents')
--                .remove(filePaths);
--              if (storageError) {
--                console.error(`Failed to delete files for booking ${booking.id}: ${storageError.message}`);
--                continue;
--              }
--              deletedFilesCount += filePaths.length;
--            }
--          }
--
--          const { error: updateError } = await supabaseClient
--            .from('bookings')
--            .update({ uploaded_files: null })
--            .eq('id', booking.id);
--            
--          if (updateError) {
--            console.error(`Failed to nullify uploaded_files for booking ${booking.id}: ${updateError.message}`);
--          } else {
--            cleanedBookingIds.push(booking.id);
--          }
--        }
--
--        const summary = `Cleanup complete. Processed ${bookingsToClean.length} bookings. Deleted ${deletedFilesCount} files. Cleaned booking IDs: ${cleanedBookingIds.join(', ')}.`;
--        
--        return new Response(JSON.stringify({ message: summary }), {
--          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
--        });
--      } catch (e) {
--        return new Response(JSON.stringify({ error: e.message }), {
--          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
--        });
--      }
--    });
--    ```
--
-- 3. Schedule this function to run daily (e.g., at 1 AM) using a cron expression via the Supabase CLI:
--    `supabase functions deploy cleanup-completed-docs --schedule "0 1 * * *"`
--
-- This automated process will ensure user documents are not stored indefinitely.
-- -----------------------------------------------------------------------------

-- END OF SCRIPT