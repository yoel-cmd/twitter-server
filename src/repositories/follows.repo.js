import { supabase } from "../config/supabase.js";

// follow
export async function follow({ follower_id, followed_id }) {
  const { data, error } = await supabase
    .from("follows")
    .insert([{ follower_id, followed_id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// unfollow
export async function unfollow({ follower_id, followed_id }) {
  const { data, error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", follower_id)
    .eq("followed_id", followed_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// מחזיר את כל מי שאני עוקב אחריו
export async function listFollowing(follower_id) {
  const { data, error } = await supabase
    .from("follows")
    .select("followed_id")
    .eq("follower_id", follower_id);

  if (error) throw error;
  return data.map(r => r.followed_id);
}
