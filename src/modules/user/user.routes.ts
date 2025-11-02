import express from "express";
import {
  checkSetupStatusController,
  updatePersonalInfoController,
  updateDesignNicheController,
  completeSetupController,
  getUserProfileController,
  editProfileController,
  addEducationController,
  updateExperienceController,
  deleteEducationController,
  updateEducationController,
  deleteExperienceController,
  getExperienceController,
  getEducationController,
  addExperienceController,
} from "./user.controller";
import { authMiddleware } from "../../middlewares/authMiddleware"; 
import { addEducationRules, addExperienceRules, designNicheRules, editProfileRules, personalInfoRules, updateEducationRules, updateExperienceRules, validateRequest } from "./user.validator";
import { handleMulterError, uploadProfilePhoto } from "../../middlewares/upload-middleware";

const router = express.Router();

router.use(authMiddleware);

router.get("/status", checkSetupStatusController);

router.get("/profile", getUserProfileController);

router.post("/personal-info", uploadProfilePhoto, personalInfoRules , handleMulterError, validateRequest, updatePersonalInfoController);

router.post("/design-niche",designNicheRules, validateRequest, updateDesignNicheController);

router.post("/complete", completeSetupController);

router.put(
  "/edit-profile",
  uploadProfilePhoto,
  editProfileRules,
  handleMulterError,
  validateRequest,
  editProfileController
);

router.get("/get-experience", getExperienceController);


router.post(
  "/experience",
  addExperienceRules,
  validateRequest,
  addExperienceController
);

// Update experience
router.put(
  "/update-experience/:experienceId",
  updateExperienceRules,
  validateRequest,
  updateExperienceController
);

// Delete experience
router.delete(
  "/delete-experience/:experienceId",
  deleteExperienceController
);

// ===== Education Routes =====

// Add education
router.get("/get-education", getEducationController);

router.post(
  "/add-education",
  addEducationRules,
  validateRequest,
  addEducationController
);

// Update education
router.put(
  "/update-education/:educationId",
  updateEducationRules,
  validateRequest,
  updateEducationController
);

// Delete education
router.delete(
  "/delete-education/:educationId",
  deleteEducationController
);
export default router;