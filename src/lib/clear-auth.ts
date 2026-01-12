"use client";

/**
 * Clear all Supabase auth cookies and local storage
 * Use this when encountering persistent auth errors
 */
export function clearSupabaseAuth() {
  if (typeof window === 'undefined') return;

  // Clear all cookies that start with 'sb-'
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('sb-')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
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

  console.log('Supabase auth cleared');
}
