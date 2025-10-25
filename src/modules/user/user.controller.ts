import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/responseHandler";
import {
  checkAccountSetupStatus,
  updatePersonalInfo,
  updateDesignNiche,
  completeAccountSetup,
  getUserProfile,
} from "./user.service";
import { generateUniqueFileName } from "../../utils/urlGenerator";
import { getContentType } from "../../utils/fileValidator";
import { uploadToS3 } from "../../lib/aws/s3-operations";
import { S3Folders } from "../../lib/aws/types";

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

// updatePersonalInfoController (drop-in replacement)
export const updatePersonalInfoController = async (req: Request, res: Response) => {
  console.info("=== updatePersonalInfoController invoked ===");
  try {
    console.info("req.user?.id:", req.user?.id);
    console.info("req.body:", req.body);
    console.info("req.file present:", Boolean(req.file), req.file?.originalname);

    const userId = req.user?.id;
    if (!userId) {
      console.error("Unauthorized: no userId on req.user");
      return sendError(res, "Unauthorized", 401, { reason: "missing_user" });
    }

    const { name, bioTagline, gender, dob } = req.body;

    // Keep the same required fields check (but validators should catch this)
    if (!name || !bioTagline || !gender || !dob) {
      console.error("Missing required fields:", { name, bioTagline, gender, dob });
      return sendError(res, "Missing required fields", 400, { missing: { name: !name, bioTagline: !bioTagline, gender: !gender, dob: !dob }});
    }

    let profilePhotoUrl: string | undefined;

    if (req.file) {
      try {
        const fileName = generateUniqueFileName(req.file.originalname);
        const contentType = getContentType(req.file.mimetype);

        console.info("Calling uploadToS3 with fileName:", fileName, "contentType:", contentType);
        const uploadResult = await uploadToS3({
          file: req.file.buffer,
          fileName,
          contentType,
          folder: S3Folders.PROFILE_PHOTOS,
        });

        console.info("uploadToS3 returned:", uploadResult);
        if (!uploadResult) {
          // uploadToS3 returns null on error in your current implementation
          console.error("Profile photo upload returned null");
          return sendError(res, "Failed to upload profile photo", 500, { reason: "s3_upload_failed" });
        }

        profilePhotoUrl = uploadResult.url;
      } catch (uploadError) {
        console.error("Profile photo upload error (caught):", uploadError);
        return sendError(res, "Failed to upload profile photo", 500, { uploadError });
      }
    }

    // Normalize gender if needed
    const genderRaw = (gender || "").toString().trim().toLowerCase();
    const genderNormalized = genderRaw === "male" ? "Male" :
                             genderRaw === "female" ? "Female" : "Other";

    // Prepare data for DB
    const updateData = {
      name,
      bioTagline,
      gender: genderNormalized,
      dob,
      profilePhoto: profilePhotoUrl,
    };

    console.info("Calling updatePersonalInfo for userId:", userId, "with data:", { ...updateData, profilePhotoUrl });

    const result = await updatePersonalInfo(userId, updateData as any);

    console.info("updatePersonalInfo result:", result);

    return sendSuccess(res, "Personal info updated successfully", result);
  } catch (error) {
    // Log full error and return message + details if possible
    console.error("Unhandled error in updatePersonalInfoController:", error);
    // Provide error.message if it exists
    const details = { message: (error as any)?.message ?? String(error) };
    return sendError(res, "Failed to update personal info", 500, details);
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