// שכבת DB לציוצים
import { supabase } from "../config/supabase.js";

// יצירת ציוץ
export async function createTweet({ author_id, body }) {
  const { data, error } = await supabase
    .from("tweets")
    .insert([{ author_id, body }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// שליפת ציוץ בודד
export async function getTweetById(id) {
  const { data, error } = await supabase
    .from("tweets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

// שליפת כל הציוצים (לבדיקה/אדמין; לפיד נעשה בנפרד)
export async function listTweets({ limit = 50, offset = 0 } = {}) {
  // Supabase תומך range: start..end
  const start = offset;
  const end = offset + limit - 1;

  const { data, error } = await supabase
    .from("tweets")
    .select("*")
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) throw error;
  return data;
}

// עדכון ציוץ
export async function updateTweet(id, { body }) {
  const { data, error } = await supabase
    .from("tweets")
    .update({ body })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// מחיקה
export async function deleteTweet(id) {
  const { data, error } = await supabase
    .from("tweets")
    .delete()
    .eq("id", id)
    .select()
    .single()
    .maybeSingle(); // ← עדכון

  if (error) throw error;
  return data;
}

// פיד לפי מעקבים: כל הציוצים של מי שאני עוקב אחריו
export async function listFeedForUser(userId, { limit = 50, offset = 0 } = {}) {
  const start = offset;
  const end = offset + limit - 1;

  // שאילתה: מחזיר ציוצים שה-author_id שלהם נמצא בקבוצת ה-followed של userId
  const { data, error } = await supabase
    .from("tweets")
    .select("*")
    .in(
      "author_id",
      supabase
        .from("follows")
        .select("followed_id")
        .eq("follower_id", userId)
    )
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) throw error;
  return data;
}
