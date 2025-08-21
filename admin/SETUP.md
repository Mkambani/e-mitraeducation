# Admin Panel & Database Setup SQL

-- IMPORTANT:
-- Run this entire script in your Supabase project's SQL Editor.
-- This script is idempotent, meaning you can run it multiple times safely.
-- It will completely reset your database tables to the latest schema.

-- -----------------------------------------------------------------------------
-- CRITICAL STEP 1: CREATE STORAGE BUCKET (MANDATORY)
-- -----------------------------------------------------------------------------
-- Failure to complete this step will result in a "Bucket not found" error
-- when trying to access uploaded documents.
--
-- 1. In your Supabase Dashboard, go to the "Storage" section (bucket icon).
-- 2. Click "New bucket".
-- 3. Enter the bucket name exactly as: documents
-- 4. Toggle ON the "Public bucket" option.
-- 5. Click "Create bucket".
--
-- TROUBLESHOOTING: If you see an error like {"error":"Bucket not found"}, it means
-- this step was missed or the bucket was named incorrectly. Please double-check.
-- -----------------------------------------------------------------------------

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. TABLES
-- Drop existing tables in reverse order of dependency to avoid errors.
-- CASCADE will automatically remove dependent objects like foreign keys.
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.service_centers CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
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
  role TEXT DEFAULT 'user' NOT NULL,
  cod_enabled BOOLEAN DEFAULT false NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.services (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT NOT NULL,
  parent_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  is_bookable BOOLEAN DEFAULT false NOT NULL,
  booking_config JSONB,
  price NUMERIC(10, 2)
);

CREATE TABLE public.bookings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    service_id BIGINT REFERENCES services(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    user_details JSONB, -- Will store dynamic form data
    uploaded_files JSONB,
    admin_notes JSONB,
    user_messages JSONB,
    payment_method TEXT,
    payment_id TEXT,
    final_price NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- New table for notifications
CREATE TABLE public.notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- New table for global app settings
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- New table for promo banners
CREATE TABLE public.promo_banners (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- New table for payment gateways
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

-- 2. SECURE HELPER FUNCTION & RPC
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN 'anon'; END IF;
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$;

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Allow users to manage own profile" ON public.profiles;
CREATE POLICY "Allow users to manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (public.get_my_role() = 'admin');

-- Services Policies
DROP POLICY IF EXISTS "Allow public read access to all services" ON public.services;
CREATE POLICY "Allow public read access to all services" ON public.services FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage all services" ON public.services;
CREATE POLICY "Admins can manage all services" ON public.services FOR ALL USING (public.get_my_role() = 'admin');

-- Bookings Policies
DROP POLICY IF EXISTS "Users can manage their own bookings" ON public.bookings;
CREATE POLICY "Users can manage their own bookings" ON public.bookings FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL USING (public.get_my_role() = 'admin');

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
-- This section is updated to ensure admins have full access and to simplify user policies.
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can SELECT their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can UPDATE their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can DELETE their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;

-- Users can perform all actions on their own notifications.
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL
    USING (auth.uid() = user_id);

-- Admins can perform all actions on any notification.
CREATE POLICY "Admins can manage all notifications" ON public.notifications FOR ALL
    USING (public.get_my_role() = 'admin');


-- Payment Gateways Policies
DROP POLICY IF EXISTS "Allow public read access to active gateways" ON public.payment_gateways;
CREATE POLICY "Allow public read access to active gateways" ON public.payment_gateways FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage all gateways" ON public.payment_gateways;
CREATE POLICY "Admins can manage all gateways" ON public.payment_gateways FOR ALL USING (public.get_my_role() = 'admin');

-- 4. TRIGGER FOR NEW USER PROFILE
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


-- 5. SEED DATA
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
  new_passport_id BIGINT;
  
  -- The booking config for a standard application form
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
  
  -- Simplified booking config for just printing
  print_booking_config JSONB := '{
    "form_fields": [
      {"id": "aadhaarNumber", "label": "Aadhaar Number", "type": "text", "required": true},
      {"id": "fullName", "label": "Full Name (as on card)", "type": "text", "required": true}
    ],
    "document_requirements": []
  }';

BEGIN
  -- Top-Level Services
  INSERT INTO services (name, description, icon_name, is_featured, display_order) VALUES ('Aadhaar Card', 'Manage your Aadhaar identity and details.', 'AadhaarIcon', true, 10) RETURNING id INTO aadhaar_id;
  INSERT INTO services (name, description, icon_name, is_featured, display_order) VALUES ('Passport', 'Apply for new passports and renewals.', 'PassportIcon', true, 20) RETURNING id INTO passport_id;
  INSERT INTO services (name, description, icon_name, is_featured, display_order) VALUES ('Driving License', 'Services for learner and permanent licenses.', 'LicenseIcon', true, 30) RETURNING id INTO license_id;
  INSERT INTO services (name, description, icon_name, is_featured, display_order) VALUES ('Voter ID', 'Register as a voter or update details.', 'VoterIdIcon', true, 40) RETURNING id INTO voterid_id;
  INSERT INTO services (name, description, icon_name, is_featured, display_order) VALUES ('Pension', 'Services related to pension schemes.', 'PensionIcon', true, 50);
  INSERT INTO services (name, description, icon_name, is_featured, display_order) VALUES ('Birth Certificate', 'Register births and manage certificates.', 'BirthCertIcon', true, 60);
  INSERT INTO services (name, description, icon_name, is_featured, display_order) VALUES ('Govt. Schemes', 'Apply for various beneficial schemes.', 'SchemesIcon', true, 70);
  INSERT INTO services (name, description, icon_name, is_featured, display_order) VALUES ('Land Registry', 'Property registration and land records.', 'LandIcon', true, 80);
  INSERT INTO services (name, description, icon_name, display_order) VALUES ('Income Tax', 'File returns and other tax services.', 'TaxIcon', 90);
  INSERT INTO services (name, description, icon_name, display_order) VALUES ('Govt. Jobs', 'Apply for jobs in government sectors.', 'JobsIcon', 100);
  INSERT INTO services (name, description, icon_name, display_order) VALUES ('Health Card', 'Apply for and manage your digital health ID.', 'HealthCardIcon', 110);
  INSERT INTO services (name, description, icon_name, display_order) VALUES ('Scholarships', 'Apply for various educational scholarships.', 'ScholarshipIcon', 120);

  -- Bookable Sub-Services for Aadhaar
  INSERT INTO services (name, parent_id, description, icon_name, is_bookable, booking_config, price, display_order) VALUES 
  ('New Enrollment', aadhaar_id, 'Apply for a new Aadhaar card.', 'NewIcon', true, standard_booking_config, 50.00, 10),
  ('Update Address', aadhaar_id, 'Change the address on your Aadhaar.', 'AddressIcon', true, standard_booking_config, 50.00, 20);
  
  -- Create a non-bookable sub-category for Printing
  INSERT INTO services (name, parent_id, description, icon_name, is_bookable, display_order) VALUES
  ('Print Aadhaar', aadhaar_id, 'Get a physical copy of your Aadhaar card.', 'CertificateIcon', false, 30) RETURNING id INTO print_aadhaar_id;

  -- Create bookable services under the "Print Aadhaar" category
  INSERT INTO services (name, parent_id, description, icon_name, is_bookable, booking_config, price, display_order) VALUES
  ('Paper Printout', print_aadhaar_id, 'A standard black and white paper print.', 'NewIcon', true, print_booking_config, 30.00, 10),
  ('Plastic Card (PVC)', print_aadhaar_id, 'A durable, credit-card sized plastic version.', 'NewIcon', true, print_booking_config, 100.00, 20);


  -- Other bookable services
  INSERT INTO services (name, parent_id, description, icon_name, is_bookable, booking_config, price) VALUES 
  ('New Passport', passport_id, 'Apply for a fresh Indian passport.', 'NewIcon', true, standard_booking_config, 1500.00) RETURNING id INTO new_passport_id;
  
  INSERT INTO services (name, parent_id, description, icon_name, is_bookable, booking_config, price) VALUES 
  ('Renew Passport', passport_id, 'Renew your expired passport.', 'RenewIcon', true, standard_booking_config, 1000.00);

  INSERT INTO services (name, parent_id, description, icon_name, is_bookable, booking_config, price) VALUES 
  ('Learner''s License', license_id, 'Apply for a new learner''s license.', 'NewIcon', true, standard_booking_config, 200.00),
  ('Permanent License', license_id, 'Apply for a permanent driving license.', 'LicenseIcon', true, standard_booking_config, 700.00),
  ('New Voter Registration', voterid_id, 'Enroll as a new voter.', 'NewIcon', true, standard_booking_config, 0.00);

  -- Insert default app settings
  INSERT INTO public.settings (key, value)
  VALUES ('app_settings', '{
    "homepage_service_limit": 8,
    "twilio_config": {
        "account_sid": "YOUR_TWILIO_ACCOUNT_SID",
        "auth_token": "YOUR_TWILIO_AUTH_TOKEN",
        "from_number": "YOUR_TWILIO_PHONE_NUMBER"
    }
  }')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

  -- Insert default promo banners
  INSERT INTO public.promo_banners (title, subtitle, code, is_active, display_order) VALUES
  ('AADHAAR SERVICES', 'FLAT 10% OFF', 'USE CODE: GOV10', true, 10),
  ('PASSPORT RENEWAL', 'EASY & FAST', 'BOOK NOW', true, 20),
  ('PENSION SCHEMES', 'SECURE YOUR FUTURE', 'LEARN MORE', false, 30);

  -- Insert default payment gateways
  INSERT INTO public.payment_gateways (key, name, icon_name, is_active, display_order, config) VALUES
  ('razorpay', 'Razorpay', 'RazorpayIcon', true, 10, '{"key_id": "YOUR_RAZORPAY_KEY_ID", "key_secret": "YOUR_RAZORPAY_KEY_SECRET", "description": "Pay securely with Razorpay."}'),
  ('cod', 'Cash on Delivery', 'CashIcon', true, 20, '{"description": "Pay at the time of service completion."}');

END $$;

-- 6. STORAGE SETUP (POLICIES)
-- After creating the public 'documents' bucket in the dashboard, run these policies.

-- Drop existing policies first to ensure the script is re-runnable.
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;

-- Policy: Allow authenticated users to upload files into their own folder.
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Allow users to view their own documents, and admins to view all.
CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      public.get_my_role() = 'admin'
    )
  );

-- Policy: Allow users to update/overwrite their own documents.
CREATE POLICY "Users can update their own documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );