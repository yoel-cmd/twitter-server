import bcrypt from "bcrypt";

// כמה סבבים של salt – 10 זה סטנדרט טוב לפיתוח
const SALT_ROUNDS = 10;

/**
 * מקבל סיסמה גולמית ומחזיר מחרוזת hash מאובטחת
 */
export async function hashPassword(plain) {
  // מוסיפים salt ומחשבים hash
  const hashed = await bcrypt.hash(plain, SALT_ROUNDS);
  return hashed;
}

/**
 * מקבל סיסמה גולמית ו-hash מה-DB, ומחזיר true/false אם תואם
 */
export async function verifyPassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}
