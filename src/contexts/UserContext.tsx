"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { Tables } from "@/types/supabase";
import { createBrowserClient } from "@/lib/supabase/client";
import { clearSupabaseAuth } from "@/lib/clear-auth";

export type UserRole = Tables<"staff_roles">["name"];

type UserProfile = {
  name: string | null;
  image_url: string | null;
  role: UserRole | null;
};

type UserContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  isLoading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  const router = useRouter();
  const authErrorCount = useRef(0);
  const lastErrorTime = useRef(0);
  const isClearing = useRef(false);

  useEffect(() => {
    // Check for stuck auth state on mount
    const checkAuthState = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error && error.message.includes('refresh_token')) {
          console.warn('Invalid refresh token detected on mount, clearing...');
          clearSupabaseAuth();
          router.push('/login');
        }
      } catch (e) {
        console.error('Error checking auth state:', e);
      }
    };
    checkAuthState();
  }, [supabase, router]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        authErrorCount.current = 0;
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      } else if (event === 'SIGNED_OUT') {
        authErrorCount.current = 0;
        queryClient.clear();
      } else if (event === 'USER_UPDATED') {
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);

          // Track auth errors
          const now = Date.now();
          if (now - lastErrorTime.current < 5000) {
            authErrorCount.current++;
          } else {
            authErrorCount.current = 1;
          }
          lastErrorTime.current = now;

          // If too many errors in short time, clear everything
          if (authErrorCount.current > 3 && !isClearing.current) {
            isClearing.current = true;
            console.warn('Too many auth errors, clearing session and redirecting...');
            clearSupabaseAuth();
            router.push('/login');
            return { user: null, profile: null };
          }

          await supabase.auth.signOut();
          return { user: null, profile: null };
        }

        if (!session?.user) {
          return { user: null, profile: null };
        }

        const { data: profile, error: profileError } = await supabase.rpc("get_my_profile");

        if (profileError) {
          console.error('Profile error:', profileError);
          return { user: session.user, profile: null };
        }

        return { user: session.user, profile: profile as UserProfile };
      } catch (error) {
        console.error('Unexpected error in user profile query:', error);
        await supabase.auth.signOut();
        return { user: null, profile: null };
      }
    },
    staleTime: Infinity,
    retry: false,
  });

  const value = {
    user: data?.user ?? null,
    profile: data?.profile ?? null,
    isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
