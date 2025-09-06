import express from "express";
import dotenv from "dotenv";
import apiRouter from "./routes/index.js";
import corsManual from "./middlewares/cors.js"; // ← מידלוור CORS שלנו

dotenv.config();
const app = express();

// פריסת JSON מהלקוח
app.use(express.json());

// CORS ידני – לפני הראוטים
app.use(corsManual);

// כל ה-API תחת /api
app.use("/api", apiRouter);

// 404 ברירת מחדל
app.use((req, res) => {
  res.status(404).json({ error: "הנתיב לא קיים" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 השרת רץ על http://localhost:${PORT}`);
});
