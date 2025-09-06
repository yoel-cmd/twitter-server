import { Router } from "express";
import tweetsRouter from "./tweets.routes.js";
import usersRouter from "./users.routes.js";
import authRouter from "./auth.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/tweets", tweetsRouter);
router.use("/users", usersRouter);

export default router;
