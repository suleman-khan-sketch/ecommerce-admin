import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import { loginFormSchema } from "@/app/(authentication)/login/_components/schema";
import validateFormData from "@/helpers/validateFormData";

export async function POST(request: Request) {
  try {
    console.log("[SIGN-IN] Starting sign-in process");

    const supabase = createRouteHandlerClient({ cookies });
    console.log("[SIGN-IN] Supabase client created");

    // Get form fields
    const { email, password } = await request.json();
    console.log("[SIGN-IN] Email received:", email);

    // Server side form validation
    const { errors } = validateFormData(loginFormSchema, {
      email,
      password,
    });

    // If there are validation errors, return a JSON response with the errors and a 401 status.
    if (errors) {
      console.log("[SIGN-IN] Validation errors:", errors);
      return NextResponse.json({ errors }, { status: 401 });
    }

    console.log("[SIGN-IN] Validation passed, attempting Supabase sign-in");

    // Attempt to sign in the user with the provided email and password using Supabase's signInWithPassword method.
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("[SIGN-IN] Supabase response received");
    console.log("[SIGN-IN] Has session:", !!data?.session);
    console.log("[SIGN-IN] Has user:", !!data?.user);
    console.log("[SIGN-IN] Error:", error?.message || "No error");

    // If there is an error during sign-in, return a JSON response with the error message and a 401 status.
    if (error) {
      console.log("[SIGN-IN] Authentication failed:", error.message);
      return NextResponse.json(
        {
          errors: {
            password: error.message,
          },
        },
        { status: 401 }
      );
    }

    console.log("[SIGN-IN] Sign-in successful, returning success response");

    // If sign-in is successful, return a JSON response indicating success.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SIGN-IN] CAUGHT ERROR:", error);
    return NextResponse.json(
      {
        errors: {
          password: "An unexpected error occurred during sign-in",
        },
      },
      { status: 500 }
    );
  }
}
