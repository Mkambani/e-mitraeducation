export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          admin_notes: Json | null
          created_at: string
          final_price: number | null
          id: number
          payment_id: string | null
          payment_method: string | null
          service_id: number | null
          status: string
          uploaded_files: Json | null
          user_details: Json | null
          user_id: string
          user_messages: Json | null
        }
        Insert: {
          admin_notes?: Json | null
          created_at?: string
          final_price?: number | null
          id?: number
          payment_id?: string | null
          payment_method?: string | null
          service_id?: number | null
          status?: string
          uploaded_files?: Json | null
          user_details?: Json | null
          user_id: string
          user_messages?: Json | null
        }
        Update: {
          admin_notes?: Json | null
          created_at?: string
          final_price?: number | null
          id?: number
          payment_id?: string | null
          payment_method?: string | null
          service_id?: number | null
          status?: string
          uploaded_files?: Json | null
          user_details?: Json | null
          user_id?: string
          user_messages?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: number
          is_read: boolean
          link: string | null
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_read?: boolean
          link?: string | null
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          is_read?: boolean
          link?: string | null
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      payment_gateways: {
        Row: {
          config: Json | null
          created_at: string | null
          display_order: number
          icon_name: string
          id: number
          is_active: boolean
          key: string
          name: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          display_order?: number
          icon_name: string
          id?: number
          is_active?: boolean
          key: string
          name: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          display_order?: number
          icon_name?: string
          id?: number
          is_active?: boolean
          key?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cod_enabled: boolean
          dob: string | null
          email: string | null
          full_name: string | null
          id: string
          mobile_number: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          cod_enabled?: boolean
          dob?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          mobile_number?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          cod_enabled?: boolean
          dob?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          mobile_number?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      promo_banners: {
        Row: {
          code: string
          created_at: string
          display_order: number
          id: number
          is_active: boolean
          subtitle: string
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          display_order?: number
          id?: number
          is_active?: boolean
          subtitle: string
          title: string
        }
        Update: {
          code?: string
          created_at?: string
          display_order?: number
          id?: number
          is_active?: boolean
          subtitle?: string
          title?: string
        }
        Relationships: []
      }
      service_centers: {
        Row: {
          address: string
          created_at: string | null
          id: number
          location: any | null
          name: string
          service_id: number | null
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: number
          location?: any | null
          name: string
          service_id?: number | null
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: number
          location?: any | null
          name?: string
          service_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_centers_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          booking_config: Json | null
          description: string | null
          display_order: number
          icon_name: string
          id: number
          is_bookable: boolean
          is_featured: boolean
          name: string
          parent_id: number | null
          price: number | null
        }
        Insert: {
          booking_config?: Json | null
          description?: string | null
          display_order?: number
          icon_name: string
          id?: number
          is_bookable?: boolean
          is_featured?: boolean
          name: string
          parent_id?: number | null
          price?: number | null
        }
        Update: {
          booking_config?: Json | null
          description?: string | null
          display_order?: number
          icon_name?: string
          id?: number
          is_bookable?: boolean
          is_featured?: boolean
          name?: string
          parent_id?: number | null
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_centers_near: {
        Args: {
          lat: number
          long: number
        }
        Returns: {
          id: number
          name: string
          address: string
          service_id: number
          latitude: number
          longitude: number
          distance_km: number
          services: Json
        }[]
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}