import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import { loginFormSchema } from "@/app/(authentication)/login/_components/schema";
import validateFormData from "@/helpers/validateFormData";

export async function POST(request: Request) {
  try {
    console.log("[SIGN-IN] ==================== START ====================");
    console.log("[SIGN-IN] Starting sign-in process");
    console.log("[SIGN-IN] Request URL:", request.url);
    console.log("[SIGN-IN] Request method:", request.method);

    let supabase;
    try {
      console.log("[SIGN-IN] About to create Supabase client...");
      supabase = createRouteHandlerClient({ cookies });
      console.log("[SIGN-IN] ✓ Supabase client created successfully");
    } catch (err) {
      console.error("[SIGN-IN] ✗ Failed to create Supabase client:", err);
      throw new Error("Failed to create Supabase client: " + (err as Error).message);
    }

    // Get form fields
    let email, password;
    try {
      console.log("[SIGN-IN] About to parse request body...");
      const body = await request.json();
      email = body.email;
      password = body.password;
      console.log("[SIGN-IN] ✓ Request body parsed");
      console.log("[SIGN-IN] Email received:", email);
      console.log("[SIGN-IN] Password length:", password?.length || 0);
    } catch (err) {
      console.error("[SIGN-IN] ✗ Failed to parse request body:", err);
      throw new Error("Failed to parse request body: " + (err as Error).message);
    }

    // Server side form validation
    console.log("[SIGN-IN] About to validate form data...");
    const { errors } = validateFormData(loginFormSchema, {
      email,
      password,
    });

    // If there are validation errors, return a JSON response with the errors and a 401 status.
    if (errors) {
      console.log("[SIGN-IN] ✗ Validation errors:", JSON.stringify(errors));
      return NextResponse.json({ errors }, { status: 401 });
    }
    console.log("[SIGN-IN] ✓ Validation passed");

    console.log("[SIGN-IN] About to call Supabase signInWithPassword...");
    console.log("[SIGN-IN] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    let data, error;
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      data = result.data;
      error = result.error;
      console.log("[SIGN-IN] ✓ Supabase API call completed");
    } catch (err) {
      console.error("[SIGN-IN] ✗ Supabase API call threw exception:", err);
      throw new Error("Supabase API call failed: " + (err as Error).message);
    }

    console.log("[SIGN-IN] Supabase response received");
    console.log("[SIGN-IN] Has session:", !!data?.session);
    console.log("[SIGN-IN] Has user:", !!data?.user);
    console.log("[SIGN-IN] User ID:", data?.user?.id || "N/A");
    console.log("[SIGN-IN] User email:", data?.user?.email || "N/A");
    console.log("[SIGN-IN] Error:", error?.message || "No error");

    // If there is an error during sign-in, return a JSON response with the error message and a 401 status.
    if (error) {
      console.log("[SIGN-IN] ✗ Authentication failed:", error.message);
      console.log("[SIGN-IN] Error details:", JSON.stringify(error));
      return NextResponse.json(
        {
          errors: {
            password: error.message,
          },
        },
        { status: 401 }
      );
    }

    console.log("[SIGN-IN] ✓ Sign-in successful, returning success response");
    console.log("[SIGN-IN] ==================== END SUCCESS ====================");

    // If sign-in is successful, return a JSON response indicating success.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SIGN-IN] ==================== CAUGHT ERROR ====================");
    console.error("[SIGN-IN] Error type:", error?.constructor?.name);
    console.error("[SIGN-IN] Error message:", (error as Error)?.message);
    console.error("[SIGN-IN] Error stack:", (error as Error)?.stack);
    console.error("[SIGN-IN] Full error object:", error);
    console.error("[SIGN-IN] ==================== END ERROR ====================");

    return NextResponse.json(
      {
        errors: {
          password: `Server error: ${(error as Error)?.message || "An unexpected error occurred during sign-in"}`,
        },
      },
      { status: 500 }
    );
  }
}
