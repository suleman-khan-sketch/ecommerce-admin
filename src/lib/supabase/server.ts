import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { cookies } from "next/headers";

export const createServerClient = async () => {
  const cookieStore = await cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};
