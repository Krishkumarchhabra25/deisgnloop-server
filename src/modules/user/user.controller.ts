import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/responseHandler";
import {
  checkAccountSetupStatus,
  updatePersonalInfo,
  updateDesignNiche,
  completeAccountSetup,
  getUserProfile,
  editUserProfile,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  getUserEducation,
  getUserExperience,
  getFollowers,
  checkFollowStatus,
  getFollowStats,
  getFollowing,
  unfollowUser,
  followUser,
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

    if (!name || !bioTagline || !gender || !dob) {
      console.error("Missing required fields:", { name, bioTagline, gender, dob });
      return sendError(res, "Missing required fields", 400, { missing: { name: !name, bioTagline: !bioTagline, gender: !gender, dob: !dob }});
    }

    let profilePhotoUrl: string | undefined;

    if (req.file) {
      try {
        const fileName = generateUniqueFileName(req.file.originalname);
        const contentType = getContentType(req.file.mimetype);

        console.info("Cal`ling uploadToS3 with fileName:", fileName, "contentType:", contentType);
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

export const editProfileController = async (req: Request, res: Response) => {
  console.info("=== editProfileController invoked ===");
  try {
    const userId = req.user?.id;
    if (!userId) {
      console.error("Unauthorized: no userId on req.user");
      return sendError(res, "Unauthorized", 401, { reason: "missing_user" });
    }

    console.info("req.body:", req.body);
    console.info("req.file present:", Boolean(req.file), req.file?.originalname);

    const {
      name,
      bioTagline,
      summary,
      location,
      gender,
      dob,
      linkedIn,
      facebook,
      twitter,
      instagram,
      designNicheTags,
    } = req.body;

    let profilePhotoUrl: string | undefined;

    // Handle profile photo upload if provided
    if (req.file) {
      try {
        const fileName = generateUniqueFileName(req.file.originalname);
        const contentType = getContentType(req.file.mimetype);

        console.info("Calling uploadToS3 for profile photo:", fileName);
        const uploadResult = await uploadToS3({
          file: req.file.buffer,
          fileName,
          contentType,
          folder: S3Folders.PROFILE_PHOTOS,
        });

        if (!uploadResult) {
          console.error("Profile photo upload returned null");
          return sendError(res, "Failed to upload profile photo", 500, { reason: "s3_upload_failed" });
        }

        profilePhotoUrl = uploadResult.url;
        console.info("Profile photo uploaded successfully:", profilePhotoUrl);
      } catch (uploadError) {
        console.error("Profile photo upload error:", uploadError);
        return sendError(res, "Failed to upload profile photo", 500, { uploadError });
      }
    }

    // Normalize gender if provided
    let genderNormalized: "Male" | "Female" | "Other" | undefined;
    if (gender) {
      const genderRaw = gender.toString().trim().toLowerCase();
      genderNormalized = genderRaw === "male" ? "Male" :
                         genderRaw === "female" ? "Female" : "Other";
    }

    // Parse designNicheTags if it's a string (from form data)
    let parsedDesignNicheTags: string[] | undefined;
    if (designNicheTags) {
      if (typeof designNicheTags === 'string') {
        try {
          parsedDesignNicheTags = JSON.parse(designNicheTags);
        } catch (e) {
          // If not JSON, treat as comma-separated string
          parsedDesignNicheTags = designNicheTags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
        }
      } else if (Array.isArray(designNicheTags)) {
        parsedDesignNicheTags = designNicheTags;
      }
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (bioTagline !== undefined) updateData.bioTagline = bioTagline;
    if (summary !== undefined) updateData.summary = summary;
    if (location !== undefined) updateData.location = location;
    if (genderNormalized !== undefined) updateData.gender = genderNormalized;
    if (dob !== undefined) updateData.dob = dob;
    if (profilePhotoUrl !== undefined) updateData.profilePhoto = profilePhotoUrl;
    if (parsedDesignNicheTags !== undefined) updateData.designNicheTags = parsedDesignNicheTags;

    // Handle social links
    const socialLinks: any = {};
    if (linkedIn !== undefined) socialLinks.linkedIn = linkedIn;
    if (facebook !== undefined) socialLinks.facebook = facebook;
    if (twitter !== undefined) socialLinks.twitter = twitter;
    if (instagram !== undefined) socialLinks.instagram = instagram;

    if (Object.keys(socialLinks).length > 0) {
      updateData.socialLinks = socialLinks;
    }

    console.info("Calling editUserProfile for userId:", userId, "with data:", updateData);

    const result = await editUserProfile(userId, updateData);

    console.info("editUserProfile result:", result);

    return sendSuccess(res, "Profile updated successfully", result);
  } catch (error) {
    console.error("Unhandled error in editProfileController:", error);
    const details = { message: (error as any)?.message ?? String(error) };
    return sendError(res, "Failed to update profile", 500, details);
  }
};

export const addExperienceController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const { position, organisation, startedIn, workedTill, currentlyWorking, summary } = req.body;

    const result = await addExperience(userId, {
      position,
      organisation,
      startedIn,
      workedTill: currentlyWorking ? undefined : workedTill,
      currentlyWorking,
      summary,
    });

    return sendSuccess(res, "Experience added successfully", result);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to add experience", 500, error);
  }
};

export const updateExperienceController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const { experienceId } = req.params;
    const { position, organisation, startedIn, workedTill, currentlyWorking, summary } = req.body;

    const result = await updateExperience(userId, experienceId, {
      position,
      organisation,
      startedIn,
      workedTill: currentlyWorking ? undefined : workedTill,
      currentlyWorking,
      summary,
    });

    return sendSuccess(res, "Experience updated successfully", result);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to update experience", 500, error);
  }
};

export const deleteExperienceController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const { experienceId } = req.params;

    const result = await deleteExperience(userId, experienceId);

    return sendSuccess(res, "Experience deleted successfully", result);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to delete experience", 500, error);
  }
};

export const addEducationController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const { degree, stream, schoolOrCollege, startedIn, studiedTill, currentlyStudying, summary } = req.body;

    const result = await addEducation(userId, {
      degree,
      stream,
      schoolOrCollege,
      startedIn,
      studiedTill: currentlyStudying ? undefined : studiedTill,
      currentlyStudying,
      summary,
    });

    return sendSuccess(res, "Education added successfully", result);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to add education", 500, error);
  }
};

export const updateEducationController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const { educationId } = req.params;
    const { degree, stream, schoolOrCollege, startedIn, studiedTill, currentlyStudying, summary } = req.body;

    const result = await updateEducation(userId, educationId, {
      degree,
      stream,
      schoolOrCollege,
      startedIn,
      studiedTill: currentlyStudying ? undefined : studiedTill,
      currentlyStudying,
      summary,
    });

    return sendSuccess(res, "Education updated successfully", result);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to update education", 500, error);
  }
};

export const deleteEducationController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const { educationId } = req.params;

    const result = await deleteEducation(userId, educationId);

    return sendSuccess(res, "Education deleted successfully", result);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to delete education", 500, error);
  }
};

export const getExperienceController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const result = await getUserExperience(userId);
    return sendSuccess(res, "Experience data retrieved successfully", result);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to get experience data", 500, error);
  }
};

export const getEducationController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Unauthorized", 401);
    }

    const result = await getUserEducation(userId);
    return sendSuccess(res, "Education data retrieved successfully", result);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to get education data", 500, error);
  }
};


// Follow a user
export const followUserController = async (req: Request, res: Response) => {
  console.info("=== followUserController invoked ===");
  try {
    const followerId = req.user?.id;
    const { userId } = req.params; // ID of user to follow

    if (!followerId) {
      console.error("Unauthorized: no userId on req.user");
      return sendError(res, "Unauthorized", 401, { reason: "missing_user" });
    }

    console.info("Follower ID:", followerId, "Following ID:", userId);

    const result = await followUser(followerId, userId);
    
    console.info("Follow result:", result);

    return sendSuccess(res, result.message, {
      success: result.success,
      user: result.user,
    });
  } catch (error: any) {
    console.error("Error in followUserController:", error);
    const details = { message: error?.message ?? String(error) };
    return sendError(res, error.message || "Failed to follow user", 500, details);
  }
};

// Unfollow a user
export const unfollowUserController = async (req: Request, res: Response) => {
  console.info("=== unfollowUserController invoked ===");
  try {
    const followerId = req.user?.id;
    const { userId } = req.params; // ID of user to unfollow

    if (!followerId) {
      console.error("Unauthorized: no userId on req.user");
      return sendError(res, "Unauthorized", 401, { reason: "missing_user" });
    }

    console.info("Follower ID:", followerId, "Unfollowing ID:", userId);

    const result = await unfollowUser(followerId, userId);
    
    console.info("Unfollow result:", result);

    return sendSuccess(res, result.message, {
      success: result.success,
      user: result.user,
    });
  } catch (error: any) {
    console.error("Error in unfollowUserController:", error);
    const details = { message: error?.message ?? String(error) };
    return sendError(res, error.message || "Failed to unfollow user", 500, details);
  }
};

export const getFollowersController = async (req: Request , res:Response)=>{
  try {
     const userId = req.user?.id;
       if (!userId) {
      return sendError(res, "Unauthorized" , 401)
    } 
    const page = (req.query.page as string) || "1";
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const result = await getFollowers(userId , page, limit , search);
      return sendSuccess(res, "Followers retrieved successfully", result);
  } catch (error:any) {
    return sendError(res, error.message || "Failed to get following", 500, error);
  }
}

export const getFollowingController = async(req:Request , res:Response)=> {
   try {
     const userId = req.user?.id;
       if (!userId) {
      return sendError(res, "Unauthorized" , 401)
    } 
    const page = (req.query.page as string) || "1";
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const result = await getFollowing(userId , page, limit , search);
      return sendSuccess(res, "following retrieved successfully", result);
   } catch (error:any) {
    return sendError(res, error.message || "Failed to get following", 500, error);
   }
}

export const checkFollowStatusController = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const { userId } = req.params;

    if (!currentUserId) {
      return sendError(res, "Unauthorized", 401);
    }

    const result = await checkFollowStatus(currentUserId, userId);
    return sendSuccess(res, "Follow status retrieved", result);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to check follow status", 500, error);
  }
};

export const getFollowStatsController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await getFollowStats(userId);
    return sendSuccess(res, "Follow stats retrieved", result);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to get follow stats", 500, error);
  }
};