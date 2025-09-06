import jwt from "jsonwebtoken";

// סוד ל-JWT מגיע מה-ENV, ברירת מחדל רק לפיתוח
const SECRET = process.env.JWT_SECRET || "dev-secret";

/**
 * יוצר Access Token קצר טווח (ברירת מחדל: 15 דקות)
 * payload יכול לכלול: { userId, username, role }
 */
export function signAccessToken(payload, expiresIn = "15m") {
  return jwt.sign(payload, SECRET, { expiresIn });
}

/**
 * מאמת טוקן (מחזיר payload אם תקף או זורק שגיאה אם לא)
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, SECRET);
}
