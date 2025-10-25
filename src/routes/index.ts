// src/routes/index.ts
import express from "express";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/user/user.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);

export default router;
