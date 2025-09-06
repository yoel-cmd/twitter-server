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


import { Router } from "express";
import requireAuth from "../middlewares/auth.js";       // ← חדש: דורש JWT
import requireRole from "../middlewares/requireRole.js"; // ← חדש: בדיקת תפקיד

const router = Router();

let tweets = []; // DB זמני בזיכרון

// CREATE – יצירת ציוץ (מאומת בלבד)
router.post("/", requireAuth, (req, res) => {
  // מי המשתמש? מתוך הטוקן
  const { userId, username } = req.user;

  // גוף הבקשה
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "חסר טקסט לציוץ" });
    }

  // יוצר אובייקט ציוץ חדש; שומר author מתוך הטוקן, לא מלקוח
  const newTweet = { id: Date.now(), text: text.trim(), authorId: userId, authorName: username };
  tweets.push(newTweet);

  return res.status(201).json(newTweet);
});

// READ – כל הציוצים (ציבורי)
router.get("/", (req, res) => {
  res.json(tweets);
});

// READ – ציוץ לפי id (ציבורי)
router.get("/:id", (req, res) => {
  const tweet = tweets.find(t => t.id == req.params.id);
  if (!tweet) return res.status(404).json({ error: "ציוץ לא נמצא" });
  res.json(tweet);
});

// UPDATE – עדכון ציוץ (מאומת בלבד; ב-MVP נאפשר רק לאותו יוצר או לאדמין)
// לשם פשטות כאן – נ鎖על לכל מאומת (בשלב הבא תוסיף בדיקת בעלות).
router.put("/:id", requireAuth, (req, res) => {
  const tweet = tweets.find(t => t.id == req.params.id);
  if (!tweet) return res.status(404).json({ error: "ציוץ לא נמצא" });

  const { text } = req.body;
  if (text && text.trim()) {
    tweet.text = text.trim();
  }
  res.json(tweet);
});

// DELETE – מחיקת ציוץ (אדמין בלבד ב-MVP)
router.delete("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const index = tweets.findIndex(t => t.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: "ציוץ לא נמצא" });

  const deleted = tweets.splice(index, 1);
  res.json(deleted[0]);
});

export default router;
