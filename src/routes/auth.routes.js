// import { Router } from "express";
// import { hashPassword, verifyPassword } from "../utils/hash.js";
// import { signAccessToken } from "../utils/jwt.js";

// const router = Router();

// // "DB" זמני בזיכרון – שומר משתמשים שנרשמו
// const users = []; 
// מבנה משתמש: { id, username, password_hash, role }

// function sanitizeUser(u) {
//   // מחזירים ללקוח בלי password_hash
//   const { password_hash, ...safe } = u;
//   return safe;
// }

// function sanitizeUser(user) {
//   // יוצרים אובייקט ריק שאליו נכניס רק שדות "בטוחים"
//   const safeUser = {};

//   // אם יש למשתמש id – נוסיף אותו
//   if (user.id) {
//     safeUser.id = user.id;
//   }

//   // אם יש שם משתמש – נוסיף אותו
//   if (user.username) {
//     safeUser.username = user.username;
//   }

//   // אם יש role – נוסיף אותו
//   if (user.role) {
//     safeUser.role = user.role;
//   }

//   // במכוון לא נעתיק את user.password_hash

//   // מחזירים את האובייקט הבטוח
//   return safeUser;
// }

// /**
//  * POST /api/auth/register
//  * רישום משתמש חדש – username ייחודי, סיסמה מוצפנת, role חובה
//  */
// router.post("/register", async (req, res) => {
//   const { username, password, role } = req.body;

//   // בדיקות בסיסיות
//   if (!username || !password || !role) {
//     return res.status(400).json({ error: "חסר username / password / role" });
//   }

//   // האם המשתמש קיים כבר
//   const exists = users.find(u => u.username === username);
//   if (exists) {
//     return res.status(409).json({ error: "שם משתמש כבר קיים" });
//   }

//   // מחשבים hash לסיסמה
//   const password_hash = await hashPassword(password);

//   // יוצרים משתמש חדש
//   const newUser = {
//     id: Date.now().toString(), // מזהה זמני
//     username,
//     role, // למשל "user" או "admin"
//     password_hash
//   };

//   users.push(newUser);

//   // יוצרים Access Token קצר (15 דק') – נשמר ב-LS בצד לקוח
//   const accessToken = signAccessToken({
//     userId: newUser.id,
//     username: newUser.username,
//     role: newUser.role
//   }, "15m");

//   return res.status(201).json({
//     user: sanitizeUser(newUser),
//     accessToken
//   });
// });

// /**
//  * POST /api/auth/login
//  * התחברות – בדיקת סיסמה מול ה-hash, החזרת Access Token קצר
//  */
// router.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   // בדיקות בסיסיות
//   if (!username || !password) {
//     return res.status(400).json({ error: "חסר username / password" });
//   }

//   // איתור משתמש
//   const user = users.find(u => u.username === username);
//   if (!user) {
//     // בכוונה לא חושפים אם המשתמש לא קיים – הודעה כללית
//     return res.status(401).json({ error: "שם משתמש או סיסמה שגויים" });
//   }

//   // בדיקת סיסמה
//   const ok = await verifyPassword(password, user.password_hash);
//   if (!ok) {
//     return res.status(401).json({ error: "שם משתמש או סיסמה שגויים" });
//   }

//   // יצירת טוקן
//   const accessToken = signAccessToken({
//     userId: user.id,
//     username: user.username,
//     role: user.role
//   }, "15m");

//   return res.json({
//     user: sanitizeUser(user),
//     accessToken
//   });
// });

// export default router;


import { Router } from "express";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { signAccessToken } from "../utils/jwt.js";
import { createUser, getUserByUsername } from "../repositories/users.repo.js";

const router = Router();

// מסנן שדות מסוכנים מהאובייקט לפני החזרה ללקוח
function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    created_at: user.created_at,
  };
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: "חסר username / password / role" });
    }

    // קיום משתמש
    const exists = await getUserByUsername(username);
    if (exists) {
      return res.status(409).json({ error: "שם משתמש כבר קיים" });
    }

    // האש לסיסמה
    const password_hash = await hashPassword(password);

    // יצירת משתמש ב-DB
    const user = await createUser({ username, password_hash, role });

    // טוקן גישה קצר
    const accessToken = signAccessToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    }, "15m");

    return res.status(201).json({ user: sanitizeUser(user), accessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "שגיאה ביצירת משתמש" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "חסר username / password" });
    }

    const user = await getUserByUsername(username);
    // לא חושפים מי שגוי – משתמש/סיסמה
    if (!user) return res.status(401).json({ error: "שם משתמש או סיסמה שגויים" });

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "שם משתמש או סיסמה שגויים" });

    const accessToken = signAccessToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    }, "15m");

    return res.json({ user: sanitizeUser(user), accessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "שגיאה בהתחברות" });
  }
});

export default router;
