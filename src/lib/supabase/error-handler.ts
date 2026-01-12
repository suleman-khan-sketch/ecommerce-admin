"use client";

import { clearSupabaseAuth } from "@/lib/clear-auth";

let errorCount = 0;
let lastErrorTime = 0;
let isHandlingError = false;

/**
 * Global error handler for Supabase auth errors
 * Stops infinite retry loops by tracking errors and clearing auth
 */
export function handleSupabaseAuthError(error: any) {
  if (isHandlingError) return;

  const now = Date.now();

  // Reset counter if more than 10 seconds passed
  if (now - lastErrorTime > 10000) {
    errorCount = 0;
  }

  lastErrorTime = now;
  errorCount++;

  // If we get 5 or more errors in 10 seconds, clear everything
  if (errorCount >= 5) {
    isHandlingError = true;
    console.error('Too many auth errors detected, clearing session and reloading...');
    clearSupabaseAuth();

    // Force reload to stop all pending requests
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }
}

// Listen for fetch errors globally
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;

  window.fetch = async function(...args) {
    try {
      const response = await originalFetch(...args);

      // Check if it's a Supabase auth error
      if (
        args[0]?.toString().includes('supabase.co/auth') &&
        (response.status === 400 || response.status === 429)
      ) {
        const clonedResponse = response.clone();
        try {
          const body = await clonedResponse.json();
          if (body.code === 'refresh_token_not_found' || body.code === 'over_request_rate_limit') {
            handleSupabaseAuthError(body);
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  };
}
