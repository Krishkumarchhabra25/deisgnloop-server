import express from "express";
import {
  checkSetupStatusController,
  updatePersonalInfoController,
  updateDesignNicheController,
  completeSetupController,
  getUserProfileController,
} from "./user.controller";
import { authMiddleware } from "../../middlewares/authMiddleware"; 
import { designNicheRules, personalInfoRules, validateRequest } from "./user.validator";

const router = express.Router();

router.use(authMiddleware);

router.get("/status", checkSetupStatusController);

router.get("/profile", getUserProfileController);

router.post("/personal-info",personalInfoRules, validateRequest, updatePersonalInfoController);

router.post("/design-niche",designNicheRules, validateRequest, updateDesignNicheController);

router.post("/complete", completeSetupController);

export default router;