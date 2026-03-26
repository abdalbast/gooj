import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

const getSupabaseConfig = () => ({
  url: import.meta.env.VITE_SUPABASE_URL,
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
});

export const hasSupabaseConfig = () => {
  const { url, publishableKey } = getSupabaseConfig();
  return Boolean(url && publishableKey);
};

export const getSupabaseClient = () => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const { url, publishableKey } = getSupabaseConfig();

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  supabaseClient = createClient(url, publishableKey);

  return supabaseClient;
};
