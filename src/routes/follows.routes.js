// ראוטים למעקב: עקוב, בטל־עקיבה, ושליפה של "את מי אני עוקב"
import { Router } from "express";
import requireAuth from "../middlewares/auth.js";
import { follow, unfollow, listFollowing } from "../repositories/follows.repo.js";

const router = Router();

/**
 * POST /api/follows/:userId
 * עקוב אחרי משתמש יעד (userId)
 */
router.post("/:userId", requireAuth, async (req, res) => {
  try {
    const follower_id = req.user.userId;      // מי אני (מהטוקן)
    const followed_id = req.params.userId;    // אחרי מי אני עוקב (מה־URL)

    if (follower_id === followed_id) {
      return res.status(400).json({ error: "אי אפשר לעקוב אחרי עצמך" });
    }

    const row = await follow({ follower_id, followed_id });
    return res.status(201).json(row);
  } catch (err) {
    // אם כבר קיים רישום – Supabase יחזיר שגיאת כפילות (PK קיים)
    return res.status(409).json({ error: "כבר עוקב (או שגיאה במעקב)" });
  }
});

/**
 * DELETE /api/follows/:userId
 * בטל־עקיבה למשתמש יעד
 */
router.delete("/:userId", requireAuth, async (req, res) => {
  try {
    const follower_id = req.user.userId;
    const followed_id = req.params.userId;

    const row = await unfollow({ follower_id, followed_id });
    // אם לא הייתה רשומה – row עלול להיות null; נתייחס כ־204
    if (!row) return res.status(204).end();
    return res.json(row);
  } catch (err) {
    return res.status(500).json({ error: "שגיאה בביטול עקיבה" });
  }
});

/**
 * GET /api/follows/me
 * מחזיר רשימת userIds שאני עוקב אחריהם (לבדיקות/לקליינט)
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const list = await listFollowing(req.user.userId);
    return res.json({ following: list });
  } catch (err) {
    return res.status(500).json({ error: "שגיאה בשליפת רשימת המעקבים" });
  }
});

export default router;
