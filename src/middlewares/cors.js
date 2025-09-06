// מידלוור CORS ידני – נותן הרשאות לדפדפן לגשת לשרת שלנו
export default function corsManual(req, res, next) {
  // מאיזה מקור (דומיין/פורט) מותר להגיע – כאן הפיתוח של ה-React מקומי
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  // אילו כותרות (Headers) הבקשה יכולה לשלוח – חובה Authorization בשביל JWT
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  // אילו מתודות HTTP מותרות – CRUD מלא + OPTIONS לפרפלייט
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  // לאפשר שליחת Cookies/קרדנשלס (אם בעתיד נשתמש) – לא מזיק להשאיר true
  res.header("Access-Control-Allow-Credentials", "true");

  // בקשת OPTIONS (preflight) – מחזירים OK בלי לעבור לראוטים
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  // ממשיכים לשרשרת המידלוורים הבאה
  next();
}
