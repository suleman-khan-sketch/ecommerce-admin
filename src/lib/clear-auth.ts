"use client";

/**
 * Clear all Supabase auth cookies and local storage
 * Use this when encountering persistent auth errors
 */
export function clearSupabaseAuth() {
  if (typeof window === 'undefined') return;

  console.log('Clearing Supabase auth...');

  // Clear all cookies that start with 'sb-'
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('sb-')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    }
  }

  // Clear localStorage items
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.error('Error clearing localStorage:', e);
  }

  // Clear sessionStorage items
  try {
    const keys = Object.keys(sessionStorage);
    for (const key of keys) {
      if (key.startsWith('sb-')) {
        sessionStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.error('Error clearing sessionStorage:', e);
  }

  console.log('Supabase auth cleared successfully');
}

// Auto-clear on module load if there's a stuck token
if (typeof window !== 'undefined') {
  try {
    const hasInvalidToken = Object.keys(localStorage).some(key => {
      if (key.startsWith('sb-') && key.includes('auth-token')) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const parsed = JSON.parse(value);
            // Check if refresh token exists and is potentially invalid
            if (parsed?.refresh_token && !parsed?.access_token) {
              return true;
            }
          }
        } catch (e) {
          return true;
        }
      }
      return false;
    });

    if (hasInvalidToken) {
      console.warn('Invalid auth token detected on load, clearing immediately...');
      clearSupabaseAuth();
    }
  } catch (e) {
    console.error('Error checking auth state:', e);
  }
}
