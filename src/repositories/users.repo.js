// שכבת DB בלבד למשתמשים
import { supabase } from "../config/supabase.js";

// יצירת משתמש חדש
export async function createUser({ username, password_hash, role }) {
  const { data, error } = await supabase
    .from("users")
    .insert([{ username, password_hash, role }])
    .select()
    .single();

  if (error) throw error;          // אם יש שגיאה מה-DB – זורקים מעלה
  return data;                     // מחזירים את הרשומה שנוצרה
}

// שליפה לפי username (לבדיקת קיום/לוגין)
export async function getUserByUsername(username) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single(); // אם לא קיים – error.details יספר

  if (error) return null;          // לא קיים → null
  return data;
}

// שליפה לפי id
export async function getUserById(id) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

// עדכון role (אדמין)
export async function updateUserRole(id, role) {
  const { data, error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// מחיקה
export async function deleteUser(id) {
  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
