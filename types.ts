

export type { UploadedFileRecord } from './components/DocumentUploader';
import type { UploadedFileRecord } from './components/DocumentUploader';

// --- Dynamic Booking Configuration Types ---

export interface FormField {
  id: string; // e.g., 'fullName', 'fatherName'
  label: string;
  type: 'text' | 'email' | 'date' | 'tel' | 'number';
  required: boolean;
}

export interface DocumentRequirement {
  id: string; // e.g., 'poi', 'poa'
  name: string;
  description: string;
}

export interface BookingConfig {
  form_fields: FormField[];
  document_requirements: DocumentRequirement[];
}


// --- Core Application Types ---

export interface Service {
  id: number;
  name: string;
  description?: string | null;
  icon_url: string | null;
  parent_id?: number | null;
  // New fields for admin control
  is_featured: boolean;
  display_order: number;
  is_bookable: boolean;
  booking_config: BookingConfig | null;
  price?: number | null;
  // Client-side hierarchy
  subServices?: Service[];
}

export interface Profile {
    id: string;
    role: string;
    full_name?: string | null;
    email?: string | null;
    dob?: string | null;
    mobile_number?: string | null;
    cod_enabled: boolean; // For payment gateway control
    avatar_url?: string | null;
    updated_at?: string | null;
}

export interface UserMessage {
    sender: 'admin' | 'user';
    text: string;
    timestamp: string;
}

export interface AdminNote {
    text: string;
    timestamp: string;
    admin_name: string; // To track which admin wrote the note
}

// Type for files uploaded by admin as proof of completion
export type ProofFile = {
    name: string;
    path: string;
    size: number;
};

export interface Booking {
    id: number;
    created_at: string;
    status: string;
    user_id: string;
    service_id: number;
    services: { name: string } | null; 
    profiles: { full_name: string | null; email: string | null; cod_enabled?: boolean; } | null; 
    user_details: Record<string, any> | null; // Now a dynamic object from the form
    uploaded_files: UploadedFileRecord | null;
    admin_notes: AdminNote[] | null;
    user_messages: UserMessage[] | null;
    payment_method: string | null;
    payment_id: string | null;
    final_price: number | null;
    proof_of_completion_files: ProofFile[] | null; // New field for admin uploads
    review_submitted: boolean;
    completed_at?: string | null;
}

// --- New Review Type ---
export interface Review {
  id: number;
  booking_id: number;
  user_id: string;
  service_id: number;
  rating: number;
  comment?: string | null;
  is_approved: boolean;
  created_at: string;
  // Joined data
  profiles?: { full_name: string | null; avatar_url?: string | null; } | null;
  services?: { name: string | null } | null;
}


// --- Global App Settings Type ---

export interface AppSettings {
    homepage_service_limit: number;
    website_name: string;
    website_description: string;
    logo_url: string;
    favicon_url: string;
    favicon_text: string;
    contact_address: string;
    contact_email: string;
    contact_phone: string;
    social_facebook: string;
    social_twitter: string;
    social_linkedin: string;
    max_document_upload_size_mb: number;
    document_retention_days: number;
    admin_booking_notification_sound?: string | null;
    user_notification_sound?: string | null;
    twilio_config?: {
        account_sid: string;
        auth_token: string;
        from_number: string;
    };
}

// --- Promo Banner Type ---
export interface PromoBannerSlide {
  id: number;
  image_url?: string | null; // Desktop image
  mobile_image_url?: string | null; // Mobile image
  link_url?: string | null;
  is_active: boolean;
  display_order: number;
}

// --- New Types for Advanced Features ---

export interface Notification {
    id: number;
    user_id: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

export interface PaymentGateway {
    id: number;
    key: string;
    name: string;
    icon_name: string;
    is_active: boolean;
    display_order: number;
    config: Record<string, any> | null;
    created_at?: string | null;
}

export interface ServiceCenter {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_km?: number | null;
  service_id?: number | null;
  services?: {
    name: string;
    icon_name: string;
  } | null;
}