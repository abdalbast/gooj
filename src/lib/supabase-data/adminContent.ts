import { getSupabaseClient } from "@/lib/supabase";
import { mapAdminContentBlock } from "./shared";
import type { AdminContentBlockRecord } from "./types";

export const listAdminContentBlocks = async () => {
  const { data, error } = await getSupabaseClient()
    .from("admin_content_blocks")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data.map(mapAdminContentBlock);
};

export const updateAdminContentBlock = async (
  blockId: string,
  block: Pick<AdminContentBlockRecord, "body" | "title">,
) => {
  const { data, error } = await getSupabaseClient()
    .from("admin_content_blocks")
    .update({
      body: block.body.trim(),
      title: block.title.trim(),
    })
    .eq("id", blockId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapAdminContentBlock(data);
};
