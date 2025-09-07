// server/src/middlewares/requireRole.js
// בודק שלמשתמש יש אחד מהתפקידים המותרים (RBAC בסיסי)
export default function requireRole(...allowedRoles) {
  return function (req, res, next) {
    // אם אין req.user – מישהו שכח את requireAuth לפני
    if (!req.user) {
      return res.status(401).json({ error: "לא מאומת (חסר req.user). ודא שיש requireAuth לפני requireRole" });
    }

    const userRole = req.user.role;

    // אם התפקיד לא ברשימת המותרים – אין הרשאה
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "אין הרשאה לבצע פעולה זו" });
    }

    next();
  };
}
