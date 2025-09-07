// טוען את .env מיד כשמודול נטען – חייב להיות בשורה הראשונה
import "dotenv/config";

// חיבור יחיד ל-Supabase לשימוש בכל המודולים
import { createClient } from "@supabase/supabase-js";

// קורא מה-ENV (אל תעלה את .env לגיט)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // service_role key – שרת בלבד!

// ולידציה מינימלית – אם אין מפתחות, אין חיבור
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ חסרים SUPABASE_URL/KEY ב-.env");
  process.exit(1);
}

// מייצר קליינט אחד לשיתוף
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }, // בשרת לא שומרים סשן
});
