
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Profile, Notification } from '../types';
import { ServiceContext } from './ServiceContext';

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
  const { settings } = useContext(ServiceContext);
  const prevUnreadCount = useRef(0);

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
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        
        if (sessionUser) {
            const initialUnread = (await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', sessionUser.id).eq('is_read', false)).count;
            prevUnreadCount.current = initialUnread || 0;
        } else {
             prevUnreadCount.current = 0;
        }
        
        // Initial loading state is determined by fetches that run when user is set
        if (!sessionUser) {
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
          prevUnreadCount.current = 0;
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
  
  // New effect to watch for new notifications and play sound
  useEffect(() => {
    if (!user || loading) return; // Don't run on initial load or if logged out

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Check if new unread notifications have arrived
    if (unreadCount > prevUnreadCount.current) {
        const soundUrl = settings.user_notification_sound;
        if (soundUrl) {
            const audio = new Audio(soundUrl);
            audio.play().catch(e => console.error("User notification audio play failed:", e));
        }
    }

    // Update the ref with the current count for the next comparison
    prevUnreadCount.current = unreadCount;

  }, [notifications, user, loading, settings.user_notification_sound]);


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