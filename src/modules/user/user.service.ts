import { deleteFromS3 } from "../../lib/aws/s3-operations";
import UserModels from "../../models/UserModels";
import { extractS3KeyFromUrl, isValidS3Url } from "../../utils/urlGenerator";

interface PersonalInfoData {
  name: string;
  bioTagline: string;
  gender: "Male" | "Female" | "Other";
  dob: string; // ISO date string
  profilePhoto?: string;
}

interface DesignNicheData {
  designNicheTags: string[];
}


export const checkAccountSetupStatus = async(userId:string)=>{
    const user = await UserModels.findById(userId).select("isAccountSetupComplete accountSetupStep name email username profilePhoto");

    if(!user){
        throw new Error("User not found")
    }

    return {
     isAccountSetupComplete: user.isAccountSetupComplete,
    accountSetupStep: user.accountSetupStep,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePhoto: user.profilePhoto,
    },
    }
};

export const updatePersonalInfo = async (
  userId: string,
  data: PersonalInfoData
) => {
  const user = await UserModels.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (data.profilePhoto && user.profilePhoto && user.profilePhoto !== data.profilePhoto) {
    if (isValidS3Url(user.profilePhoto)) {
      const oldPhotoKey = extractS3KeyFromUrl(user.profilePhoto);
      if (oldPhotoKey) {
        try {
          await deleteFromS3(oldPhotoKey);
          console.log(`Deleted old profile photo: ${oldPhotoKey}`);
        } catch (error) {
          console.error("Error deleting old profile photo:", error);
        }
      }
    }
  }

  user.name = data.name;
  user.bioTagline = data.bioTagline;
  user.gender = data.gender;
  user.dob = new Date(data.dob);

  if (data.profilePhoto) {
    user.profilePhoto = data.profilePhoto;
  }

  user.accountSetupStep = Math.max(user.accountSetupStep, 1);

  await user.save();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePhoto: user.profilePhoto,
      bioTagline: user.bioTagline,
      gender: user.gender,
      dob: user.dob,
    },
    accountSetupStep: user.accountSetupStep,
  };
};
export const updateDesignNiche = async (
  userId: string,
  data: DesignNicheData
) => {
  const user = await UserModels.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.accountSetupStep < 1) {
    throw new Error("Please complete personal info first");
  }

  // Update design niche tags
  user.designNicheTags = data.designNicheTags;

  user.accountSetupStep = Math.max(user.accountSetupStep, 2);

  await user.save();

  return {
    user,
    accountSetupStep: user.accountSetupStep,
  };
};

export const completeAccountSetup = async (userId: string) => {
  const user = await UserModels.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Validate that all required steps are completed
  if (user.accountSetupStep < 2) {
    throw new Error("Please complete all setup steps first");
  }

  // Mark account setup as complete
  user.isAccountSetupComplete = true;
  user.accountSetupStep = 3;

  await user.save();

  return {
    user,
    message: "Account setup completed successfully",
  };
};

export const getUserProfile = async (userId: string) => {
  const user = await UserModels.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};