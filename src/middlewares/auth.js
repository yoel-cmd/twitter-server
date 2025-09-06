// מאמת JWT ומוסיף את פרטי המשתמש ל-req.user
import { verifyAccessToken } from "../utils/jwt.js"; // פונקציה שמאמתת את הטוקן שלנו

export default function requireAuth(req, res, next) {
  // שולפים את כותרת Authorization (שם אמור לשבת ה-Bearer Token)
  const authHeader = req.headers.authorization;

  // אם אין בכלל כותרת – אין מה לדבר
  if (!authHeader) {
    return res.status(401).json({ error: "חסר Authorization Header" });
  }

  // מצפים לפורמט: "Bearer XXX.YYY.ZZZ"
  const [scheme, token] = authHeader.split(" ");

  // בדיקה שהפורמט תקין ושיש טוקן
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "פורמט Authorization לא תקין (ציפינו ל: Bearer <token>)" });
  }

  try {
    // אימות הטוקן – מחזיר payload אם חוקי, זורק שגיאה אם לא
    const payload = verifyAccessToken(token);

    // שומרים את פרטי המשתמש מה-payload לשימוש בהמשך הראוט
    // לדוגמה: { userId, username, role }
    req.user = payload;

    // ממשיכים לראוט הבא
    next();
  } catch (err) {
    // אם יש חריגה – הטוקן לא חוקי/פג תוקף
    return res.status(401).json({ error: "טוקן לא תקין או שפג תוקפו" });
  }
}
