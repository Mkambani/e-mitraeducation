
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Profile, Notification } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  notifications: Notification[];
  isAdmin: boolean;
  loading: boolean;
  refetchProfile: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, notifications: [], isAdmin: false, loading: true, refetchProfile: async () => {}, fetchNotifications: async () => {} });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const fetchProfile = useCallback(async (sessionUser: User) => {
    setProfileLoading(true);
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .maybeSingle();

        if (error) {
            console.error('Error fetching profile:', error.message || error);
            setProfile(null);
        } else {
            setProfile(data as unknown as Profile | null);
        }
    } catch (e: any) {
        console.error('Error in profile fetch logic:', e.message || e);
        setProfile(null);
    } finally {
        setProfileLoading(false);
    }
  }, []);
  
  const fetchNotifications = useCallback(async (sessionUser: User) => {
    setNotificationsLoading(true);
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', sessionUser.id)
            .order('created_at', { ascending: false });
        
        if (error) {
            if (error.code === '42P01') {
                console.warn('Notifications feature is unavailable. The "notifications" table is missing.');
                setNotifications([]);
            } else {
                throw error;
            }
        } else {
            setNotifications((data as unknown as Notification[]) || []);
        }
    } catch (e: any) {
        console.error('Error fetching notifications:', e.message || e);
        setNotifications([]);
    } finally {
        setNotificationsLoading(false);
    }
  }, []);

  // Effect for handling auth state changes
  useEffect(() => {
    setLoading(true);
    const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        // Initial loading state is determined by fetches that run when user is set
        if (!session?.user) {
            setProfileLoading(false);
            setNotificationsLoading(false);
        }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
          setProfileLoading(false);
          setNotificationsLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Effect for fetching user-dependent data
  useEffect(() => {
    if (user) {
      fetchProfile(user);
      fetchNotifications(user);
    } else {
      // Clear data on logout
      setProfile(null);
      setNotifications([]);
    }
  }, [user, fetchProfile, fetchNotifications]);

  // Effect for managing combined loading state
  useEffect(() => {
      if (!profileLoading && !notificationsLoading) {
          setLoading(false);
      }
  }, [profileLoading, notificationsLoading]);


  const value = { 
      user, 
      profile,
      notifications,
      isAdmin: profile?.role === 'admin',
      loading,
      refetchProfile: () => user ? fetchProfile(user) : Promise.resolve(),
      fetchNotifications: () => user ? fetchNotifications(user) : Promise.resolve(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};