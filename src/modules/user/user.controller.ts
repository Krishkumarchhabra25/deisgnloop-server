import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/responseHandler";
import {
  checkAccountSetupStatus,
  updatePersonalInfo,
  updateDesignNiche,
  completeAccountSetup,
  getUserProfile,
} from "./user.service";

export const checkSetupStatusController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; 
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }
    const status = await checkAccountSetupStatus(userId);
    return sendSuccess(res, "Setup status retrieved", status);
  } catch (error) {
    return sendError(res, "Failed to check setup status", 500, error);
  }
};

export const updatePersonalInfoController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const { name, bioTagline, gender, dob, profilePhoto } = req.body;

    if (!name || !bioTagline || !gender || !dob) {
      return sendError(res, "Missing required fields", 400);
    }

    const result = await updatePersonalInfo(userId, {
      name,
      bioTagline,
      gender,
      dob,
      profilePhoto,
    });

    return sendSuccess(res, "Personal info updated successfully", result);
  } catch (error) {
    return sendError(res, "Failed to update personal info", 500, error);
  }
};

export const updateDesignNicheController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const { designNicheTags } = req.body;

    
    if (!designNicheTags || !Array.isArray(designNicheTags)) {
      return sendError(res, "Design niche tags must be an array", 400);
    }

    if (designNicheTags.length === 0) {
      return sendError(res, "Please select at least one interest", 400);
    }

    const result = await updateDesignNiche(userId, { designNicheTags });

    return sendSuccess(res, "Design niche updated successfully", result);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to update design niche", 500, error);
  }
};

export const completeSetupController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const result = await completeAccountSetup(userId);

    return sendSuccess(res, "Account setup completed", result);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to complete setup", 500, error);
  }
};

export const getUserProfileController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const user = await getUserProfile(userId);

    return sendSuccess(res, "User profile retrieved", { user });
  } catch (error) {
    return sendError(res, "Failed to get user profile", 500, error);
  }
};