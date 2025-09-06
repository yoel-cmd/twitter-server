import { Router } from "express";

const router = Router();

let users = []; // DB זמני

// CREATE – משתמש חדש
router.post("/", (req, res) => {
  const { username, role } = req.body;
  const newUser = { id: Date.now(), username, role };
  users.push(newUser);
  res.status(201).json(newUser);
});

// READ – כל המשתמשים
router.get("/", (req, res) => {
  res.json(users);
});

// READ – לפי id
router.get("/:id", (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  if (!user) return res.status(404).json({ error: "משתמש לא נמצא" });
  res.json(user);
});

// UPDATE – עדכון role
router.put("/:id", (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  if (!user) return res.status(404).json({ error: "משתמש לא נמצא" });
  user.role = req.body.role || user.role;
  res.json(user);
});

// DELETE – מחיקה
router.delete("/:id", (req, res) => {
  const index = users.findIndex(u => u.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: "משתמש לא נמצא" });
  const deleted = users.splice(index, 1);
  res.json(deleted[0]);
});

export default router;
