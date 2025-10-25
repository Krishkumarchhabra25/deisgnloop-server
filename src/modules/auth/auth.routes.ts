import express from "express";
import { validateFirebaseLogin } from "./auth.validator";
import { firebaseLoginController } from "./auth.controller";


const router = express.Router();

// POST /api/auth/firebase-login
router.post("/firebase-login", validateFirebaseLogin, firebaseLoginController);

export default router;
