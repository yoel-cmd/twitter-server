// import { Router } from "express";

// const router = Router();

// let tweets = []; // DB זמני בזיכרון

// // CREATE – יצירת ציוץ
// router.post("/", (req, res) => {
//   const { text, author } = req.body;
//   const newTweet = { id: Date.now(), text, author };
//   tweets.push(newTweet);
//   res.status(201).json(newTweet);
// });

// // READ – כל הציוצים
// router.get("/", (req, res) => {
//   res.json(tweets);
// });

// // READ – ציוץ לפי id
// router.get("/:id", (req, res) => {
//   const tweet = tweets.find(t => t.id == req.params.id);
//   if (!tweet) return res.status(404).json({ error: "ציוץ לא נמצא" });
//   res.json(tweet);
// });

// // UPDATE – עדכון ציוץ
// router.put("/:id", (req, res) => {
//   const tweet = tweets.find(t => t.id == req.params.id);
//   if (!tweet) return res.status(404).json({ error: "ציוץ לא נמצא" });
//   tweet.text = req.body.text || tweet.text;
//   res.json(tweet);
// });

// // DELETE – מחיקה
// router.delete("/:id", (req, res) => {
//   const index = tweets.findIndex(t => t.id == req.params.id);
//   if (index === -1) return res.status(404).json({ error: "ציוץ לא נמצא" });
//   const deleted = tweets.splice(index, 1);
//   res.json(deleted[0]);
// });

// export default router;


// import { Router } from "express";
// import requireAuth from "../middlewares/auth.js";       // ← חדש: דורש JWT
// import requireRole from "../middlewares/requireRole.js"; // ← חדש: בדיקת תפקיד

// const router = Router();

// let tweets = []; // DB זמני בזיכרון

// // CREATE – יצירת ציוץ (מאומת בלבד)
// router.post("/", requireAuth, (req, res) => {
//   // מי המשתמש? מתוך הטוקן
//   const { userId, username } = req.user;

//   // גוף הבקשה
//   const { text } = req.body;
//   if (!text || !text.trim()) {
//     return res.status(400).json({ error: "חסר טקסט לציוץ" });
//     }

//   // יוצר אובייקט ציוץ חדש; שומר author מתוך הטוקן, לא מלקוח
//   const newTweet = { id: Date.now(), text: text.trim(), authorId: userId, authorName: username };
//   tweets.push(newTweet);

//   return res.status(201).json(newTweet);
// });

// // READ – כל הציוצים (ציבורי)
// router.get("/", (req, res) => {
//   res.json(tweets);
// });

// // READ – ציוץ לפי id (ציבורי)
// router.get("/:id", (req, res) => {
//   const tweet = tweets.find(t => t.id == req.params.id);
//   if (!tweet) return res.status(404).json({ error: "ציוץ לא נמצא" });
//   res.json(tweet);
// });

// // UPDATE – עדכון ציוץ (מאומת בלבד; ב-MVP נאפשר רק לאותו יוצר או לאדמין)
// // לשם פשטות כאן – נ鎖על לכל מאומת (בשלב הבא תוסיף בדיקת בעלות).
// router.put("/:id", requireAuth, (req, res) => {
//   const tweet = tweets.find(t => t.id == req.params.id);
//   if (!tweet) return res.status(404).json({ error: "ציוץ לא נמצא" });

//   const { text } = req.body;
//   if (text && text.trim()) {
//     tweet.text = text.trim();
//   }
//   res.json(tweet);
// });

// // DELETE – מחיקת ציוץ (אדמין בלבד ב-MVP)
// router.delete("/:id", requireAuth, requireRole("admin"), (req, res) => {
//   const index = tweets.findIndex(t => t.id == req.params.id);
//   if (index === -1) return res.status(404).json({ error: "ציוץ לא נמצא" });

//   const deleted = tweets.splice(index, 1);
//   res.json(deleted[0]);
// });

// export default router;




// server/src/routes/tweets.routes.js
// ראוטים לציוצים – נקי, חד, עם אימות והרשאות

import { Router } from "express";
import requireAuth from "../middlewares/auth.js";          // חייב Bearer JWT
import requireRole from "../middlewares/requireRole.js";   // RBAC בסיסי
import {
  createTweet,
  getTweetById,
  listTweets,
  updateTweet,
  deleteTweet,
  listFeedForUser, // ← חשוב: גרסת שני השלבים (follows → tweets)
} from "../repositories/tweets.repo.js";

const router = Router();

/**
 * POST /api/tweets
 * יצירת ציוץ – מאומת בלבד. את המחבר לוקחים מהטוקן, לא מהלקוח.
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { userId } = req.user;          // מזהה משתמש מתוך ה-JWT
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "חסר טקסט לציוץ" });
    }

    const tweet = await createTweet({ author_id: userId, body: text.trim() });
    return res.status(201).json(tweet);
  } catch (err) {
    console.error("create tweet error:", err);
    return res.status(500).json({ error: "שגיאה ביצירת ציוץ" });
  }
});

/**
 * GET /api/tweets
 * שליפת כל הציוצים (פומבי; בעיקר לבדיקה/אדמין)
 */
router.get("/", async (req, res) => {
  try {
    const data = await listTweets({});
    return res.json(data);
  } catch (err) {
    console.error("list tweets error:", err);
    return res.status(500).json({ error: "שגיאה בשליפה" });
  }
});

/**
 * GET /api/tweets/:id
 * שליפת ציוץ בודד לפי מזהה
 */
router.get("/:id", async (req, res) => {
  try {
    const tweet = await getTweetById(req.params.id);
    if (!tweet) return res.status(404).json({ error: "ציוץ לא נמצא" });
    return res.json(tweet);
  } catch (err) {
    console.error("get tweet error:", err);
    return res.status(500).json({ error: "שגיאה בשליפה" });
  }
});

// /**
//  * PUT /api/tweets/:id
//  * עדכון ציוץ – מאומת. (בהמשך: הוסף בדיקת בעלות כדי שרק המחבר או אדמין יוכל)
//  */
// router.put("/:id", requireAuth, async (req, res) => {
//   try {
//     const { text } = req.body;
//     if (!text || !text.trim()) {
//       return res.status(400).json({ error: "חסר טקסט לציוץ" });
//     }

//     const updated = await updateTweet(req.params.id, { body: text.trim() });
//     return res.json(updated);
//   } catch (err) {
//     console.error("update tweet error:", err);
//     return res.status(500).json({ error: "שגיאה בעדכון ציוץ" });
//   }
// });

// עדכון ציוץ – מאומת, ורק המחבר או אדמין
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "חסר טקסט לציוץ" });
    }

    // שלב בעלות: נטען את הציוץ כדי לבדוק מי המחבר
    const existing = await getTweetById(req.params.id);
    if (!existing) return res.status(404).json({ error: "ציוץ לא נמצא" });

    const isOwner = existing.author_id === req.user.userId;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "רק המחבר או אדמין יכולים לעדכן" });
    }

    const updated = await updateTweet(req.params.id, { body: text.trim() });
    return res.json(updated);
  } catch (err) {
    console.error("update tweet error:", err);
    return res.status(500).json({ error: "שגיאה בעדכון ציוץ" });
  }
});

// /**
//  * DELETE /api/tweets/:id
//  * מחיקת ציוץ – כרגע אדמין בלבד (RBAC). אפשר להרחיב לבדוק בעלות.
//  */
// router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
//   try {
//     const deleted = await deleteTweet(req.params.id);
//     return res.json(deleted);
//   } catch (err) {
//     console.error("delete tweet error:", err);
//     return res.status(500).json({ error: "שגיאה במחיקה" });
//   }
// });

// מחיקת ציוץ – רק המחבר או אדמין
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await getTweetById(req.params.id);
    if (!existing) return res.status(404).json({ error: "ציוץ לא נמצא" });

    const isOwner = existing.author_id === req.user.userId;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "רק המחבר או אדמין יכולים למחוק" });
    }

    const deleted = await deleteTweet(req.params.id);
    // (מומלץ ב-repo להשתמש ב-.maybeSingle() כדי לא לקבל 500 אם לא קיים)
    return res.json(deleted);
  } catch (err) {
    console.error("delete tweet error:", err);
    return res.status(500).json({ error: "שגיאה במחיקה" });
  }
});

/**
 * GET /api/tweets/feed
 * פיד אישי – ציוצים של כל מי שאני עוקב אחריו (דורש JWT).
 * בפנים: 1) מביא followed_id מה-follows  2) .in("author_id", [...])
 */
router.get("/feed", requireAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const feed = await listFeedForUser(userId, { limit: 50 });
    return res.json(feed);
  } catch (err) {
    console.error("feed error:", err);
    return res.status(500).json({ error: "שגיאה בשליפת הפיד" });
  }
});

export default router;
