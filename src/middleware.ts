import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  console.log("[MIDDLEWARE] Request path:", req.nextUrl.pathname);

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  console.log("[MIDDLEWARE] Supabase client created");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("[MIDDLEWARE] Session check:", {
    hasSession: !!session,
    hasUser: !!session?.user,
    userEmail: session?.user?.email,
  });

  const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/update-password",
  ];

  const isAuthRoute = authRoutes.includes(req.nextUrl.pathname);
  const isLoggedIn = !!session?.user;

  console.log("[MIDDLEWARE] Route info:", {
    path: req.nextUrl.pathname,
    isAuthRoute,
    isLoggedIn,
  });

  if (isLoggedIn && isAuthRoute) {
    console.log("[MIDDLEWARE] Redirecting logged-in user away from auth page to /");
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!isLoggedIn && !isAuthRoute) {
    console.log("[MIDDLEWARE] Redirecting non-logged-in user to login");
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect_to", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user is admin or super_admin
  if (isLoggedIn && !isAuthRoute) {
    console.log("[MIDDLEWARE] Checking user role");
    const { data: profile } = await supabase.rpc("get_my_profile").maybeSingle() as {
      data: { name: string; image_url: string | null; role: string } | null
    };

    console.log("[MIDDLEWARE] Profile check:", {
      hasProfile: !!profile,
      role: profile?.role,
    });

    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      console.log("[MIDDLEWARE] User not authorized, signing out and redirecting");
      // User is logged in but not admin - redirect to login with error
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "unauthorized");
      await supabase.auth.signOut();
      return NextResponse.redirect(loginUrl);
    }

    console.log("[MIDDLEWARE] User authorized, allowing access");
  }

  console.log("[MIDDLEWARE] Allowing request through");
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth|.*\\..*).*)"],
};
