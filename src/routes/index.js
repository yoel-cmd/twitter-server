import { Router } from "express";
import tweetsRouter from "./tweets.routes.js";
import usersRouter from "./users.routes.js";
import authRouter from "./auth.routes.js";
import followsRouter from "./follows.routes.js"; // ← חייב להיות פה

const router = Router();

router.use("/auth", authRouter);
router.use("/tweets", tweetsRouter);
router.use("/users", usersRouter);
router.use("/follows", followsRouter);        // ← וחייב להיות פה

export default router;
