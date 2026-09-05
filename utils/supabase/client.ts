import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://btnhbfumnvwymbcwoonr.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_4hbNV5b9f82vE1CWN6Jxuw_O3EUC3wE";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
