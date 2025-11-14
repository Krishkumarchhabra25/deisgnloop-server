import mongoose from "mongoose";
import { deleteFromS3 } from "../../lib/aws/s3-operations";
import FollowModel from "../../models/FollowModel";
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

interface EditProfileData {
  name?: string;
  bioTagline?: string;
  summary?: string;
  location?: string;
  gender?: "Male" | "Female" | "Other";
  dob?: string;
  profilePhoto?: string;
  socialLinks?: {
    linkedIn?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  designNicheTags?: string[];
}


interface ExperienceData {
  position: string;
  organisation: string;
  startedIn: string;
  workedTill?: string;
  currentlyWorking: boolean;
  summary: string;
}

// NEW: Education Interface
interface EducationData {
  degree: string;
  stream: string;
  schoolOrCollege: string;
  startedIn: string;
  studiedTill?: string;
  currentlyStudying: boolean;
  summary: string;
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

export const editUserProfile = async (
  userId: string,
  data: EditProfileData
) =>{
  const user = await UserModels.findById(userId);

  if(!user){
    throw new Error("User not Found");

  }

  if(data.profilePhoto && user.profilePhoto && user.profilePhoto !== data.profilePhoto){
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

   if (data.name !== undefined) user.name = data.name;
  if (data.bioTagline !== undefined) user.bioTagline = data.bioTagline;
  if (data.summary !== undefined) user.summary = data.summary;
  if (data.location !== undefined) user.location = data.location;
  if (data.gender !== undefined) user.gender = data.gender;
  if (data.dob !== undefined) user.dob = new Date(data.dob);
  if (data.profilePhoto !== undefined) user.profilePhoto = data.profilePhoto;
  if (data.designNicheTags !== undefined) user.designNicheTags = data.designNicheTags;


   // Update social links if provided
  if (data.socialLinks) {
    // Initialize socialLinks if it doesn't exist
    if (!user.socialLinks) {
      user.socialLinks = {} as any;
    }

    if (data.socialLinks.linkedIn !== undefined) {
      user.socialLinks.linkedIn = data.socialLinks.linkedIn;
    }
    if (data.socialLinks.facebook !== undefined) {
      user.socialLinks.facebook = data.socialLinks.facebook;
    }
    if (data.socialLinks.twitter !== undefined) {
      user.socialLinks.twitter = data.socialLinks.twitter;
    }
    if (data.socialLinks.instagram !== undefined) {
      user.socialLinks.instagram = data.socialLinks.instagram;
    }
  }
   await user.save();

    return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePhoto: user.profilePhoto,
      bioTagline: user.bioTagline,
      summary: user.summary,
      location: user.location,
      gender: user.gender,
      dob: user.dob,
      socialLinks: user.socialLinks,
      designNicheTags: user.designNicheTags,
    },
  };
}

export const addExperience = async (userId: string, data: ExperienceData) => {
  const user = await UserModels.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const newExperience = {
    position: data.position,
    organisation: data.organisation,
    startedIn: new Date(data.startedIn),
    workedTill: data.workedTill ? new Date(data.workedTill) : undefined,
    currentlyWorking: data.currentlyWorking,
    summary: data.summary,
  };

  user.experience.push(newExperience as any);
  await user.save();

  return {
    user: {
      id: user._id,
      experience: user.experience,
    },
  };
};

export const updateExperience = async (
  userId: string,
  experienceId: string,
  data: Partial<ExperienceData>
) => {
  const user = await UserModels.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const experience = user.experience.id(experienceId);

  if (!experience) {
    throw new Error("Experience not found");
  }

  if (data.position !== undefined) experience.position = data.position;
  if (data.organisation !== undefined) experience.organisation = data.organisation;
  if (data.startedIn !== undefined) experience.startedIn = new Date(data.startedIn);
  if (data.workedTill !== undefined) {
    experience.workedTill = data.workedTill ? new Date(data.workedTill) : undefined;
  }
  if (data.currentlyWorking !== undefined) {
    experience.currentlyWorking = data.currentlyWorking;
    if (data.currentlyWorking) {
      experience.workedTill = undefined;
    }
  }
  if (data.summary !== undefined) experience.summary = data.summary;

  await user.save();

  return {
    user: {
      id: user._id,
      experience: user.experience,
    },
  };
};

export const deleteExperience = async (userId: string, experienceId: string) => {
  const user = await UserModels.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const experienceIndex = user.experience.findIndex(
    (exp: any) => exp._id.toString() === experienceId
  );

  if (experienceIndex === -1) {
    throw new Error("Experience not found");
  }

  user.experience.splice(experienceIndex, 1);
  await user.save();

  return {
    user: {
      id: user._id,
      experience: user.experience,
    },
  };
};

export const addEducation = async (userId: string, data: EducationData) => {
  const user = await UserModels.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const newEducation = {
    degree: data.degree,
    stream: data.stream,
    schoolOrCollege: data.schoolOrCollege,
    startedIn: new Date(data.startedIn),
    studiedTill: data.studiedTill ? new Date(data.studiedTill) : undefined,
    currentlyStudying: data.currentlyStudying,
    summary: data.summary,
  };

  user.education.push(newEducation as any);
  await user.save();

  return {
    user: {
      id: user._id,
      education: user.education,
    },
  };
};

export const updateEducation = async (
  userId: string,
  educationId: string,
  data: Partial<EducationData>
) => {
  const user = await UserModels.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const education = user.education.id(educationId);

  if (!education) {
    throw new Error("Education not found");
  }

  if (data.degree !== undefined) education.degree = data.degree;
  if (data.stream !== undefined) education.stream = data.stream;
  if (data.schoolOrCollege !== undefined) education.schoolOrCollege = data.schoolOrCollege;
  if (data.startedIn !== undefined) education.startedIn = new Date(data.startedIn);
  if (data.studiedTill !== undefined) {
    education.studiedTill = data.studiedTill ? new Date(data.studiedTill) : undefined;
  }
  if (data.currentlyStudying !== undefined) {
    education.currentlyStudying = data.currentlyStudying;
    if (data.currentlyStudying) {
      education.studiedTill = undefined;
    }
  }
  if (data.summary !== undefined) education.summary = data.summary;

  await user.save();

  return {
    user: {
      id: user._id,
      education: user.education,
    },
  };
};

export const deleteEducation = async (userId: string, educationId: string) => {
  const user = await UserModels.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const educationIndex = user.education.findIndex(
    (edu: any) => edu._id.toString() === educationId
  );

  if (educationIndex === -1) {
    throw new Error("Education not found");
  }

  user.education.splice(educationIndex, 1);
  await user.save();

  return {
    user: {
      id: user._id,
      education: user.education,
    },
  };
};

export const getUserExperience = async (userId: string) => {
  const user = await UserModels.findById(userId).select("experience");

  if (!user) {
    throw new Error("User not found");
  }

  return {
    user: {
      id: user._id,
      experience: user.experience,
    },
  };
};

export const getUserEducation = async (userId: string) => {
  const user = await UserModels.findById(userId).select("education");

  if (!user) {
    throw new Error("User not found");
  }

  return {
    user: {
      id: user._id,
      education: user.education,
    },
  };
};


//Followers and following Services

// Follow a user
export const followUser = async (followerId: string, followingId: string) => {
  // Prevent self-following
  if (followerId === followingId) {
    throw new Error("You cannot follow yourself");
  }

  // Check if both users exist
  const [follower, following] = await Promise.all([
    UserModels.findById(followerId),
    UserModels.findById(followingId),
  ]);

  if (!follower) {
    throw new Error("Follower user not found");
  }

  if (!following) {
    throw new Error("User to follow not found");
  }

  // Check if already following
  const existingFollow = await FollowModel.findOne({
    follower: followerId,
    following: followingId,
  });

  if (existingFollow) {
    throw new Error("You are already following this user");
  }

  // Use a session for atomic operations
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create follow relationship
    await FollowModel.create(
      [
        {
          follower: followerId,
          following: followingId,
        },
      ],
      { session }
    );

    // Update counts atomically
    await Promise.all([
      UserModels.findByIdAndUpdate(
        followerId,
        { $inc: { followingCount: 1 } },
        { session }
      ),
      UserModels.findByIdAndUpdate(
        followingId,
        { $inc: { followerCount: 1 } },
        { session }
      ),
    ]);

    await session.commitTransaction();

    // Get updated user data
    const updatedFollowing = await UserModels.findById(followingId).select(
      "name username profilePhoto bioTagline followerCount followingCount"
    );

    return {
      success: true,
      message: "Successfully followed user",
      user: updatedFollowing,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Unfollow a user
export const unfollowUser = async (followerId: string, followingId: string) => {
  // Prevent self-unfollowing
  if (followerId === followingId) {
    throw new Error("Invalid operation");
  }

  // Check if follow relationship exists
  const followRelation = await FollowModel.findOne({
    follower: followerId,
    following: followingId,
  });

  if (!followRelation) {
    throw new Error("You are not following this user");
  }

  // Use a session for atomic operations
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Delete follow relationship
    await FollowModel.findByIdAndDelete(followRelation._id, { session });

    // Update counts atomically
    await Promise.all([
      UserModels.findByIdAndUpdate(
        followerId,
        { $inc: { followingCount: -1 } },
        { session }
      ),
      UserModels.findByIdAndUpdate(
        followingId,
        { $inc: { followerCount: -1 } },
        { session }
      ),
    ]);

    await session.commitTransaction();

    // Get updated user data
    const updatedFollowing = await UserModels.findById(followingId).select(
      "name username profilePhoto bioTagline followerCount followingCount"
    );

    return {
      success: true,
      message: "Successfully unfollowed user",
      user: updatedFollowing,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
export const getFollowers = async(userId: string , page:string , limit: number = 20 , searchQuery?:string)=>{
  const  user = await UserModels.findById(userId);
  if(!user){
    throw new Error("User not found");
  }

  const pageNumber = Number(page);
  const skip = (pageNumber - 1) * limit;

  let userFilter = {};

  if(searchQuery && searchQuery.trim()){
    userFilter = {
      $or: [
        {name: {$regex: searchQuery , $options: "i"}},
        {username: {$regex: searchQuery , $options: "i"}},
        {bioTagline: {$regex: searchQuery , $options: "i"}},
      ]
    }
  }

    const followQuery = { following: userId };

    const [followers , totalCount]= await Promise.all([
      FollowModel.find(followQuery)
        .populate({
            path: "follower",
            select:"name username profilePhoto bioTagline followerCount followingCount",
            match: Object.keys(userFilter).length ? userFilter : undefined
        })
       .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    searchQuery && searchQuery.trim() ? 
       FollowModel.find(followQuery)
        .populate({
          path: "follower",
          select: "_id",
          match:userFilter
        })
          .then((results) => results.filter((r) => r.follower).length)
      : FollowModel.countDocuments(followQuery),
    ])

    const filteredFollowers = followers
    .filter((f) => f.follower)
    .map((f) => f.follower);

    return {
    followers: filteredFollowers,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasMore: skip + filteredFollowers.length < totalCount,
    },
  };

}

export const getFollowing = async(userId:string , page:string , limit:number = 20 , searchQuery?:string)=>{
  const user = await UserModels.findById(userId);

  if(!user){
    throw new Error("User not found");
  }

   const pageNumber = Number(page);
  const skip = (pageNumber - 1) * limit;

  let userFilter = {};

  if(searchQuery && searchQuery.trim()){
    userFilter = {
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { username: { $regex: searchQuery, $options: "i" } },
        { bioTagline: { $regex: searchQuery, $options: "i" } },
      ]
    };
  };

  const followQuery = {follower:userId};

  const [following , totalCount] = await Promise.all([
    FollowModel.find(followQuery)
      .populate({
        path: "following",
        select: "name username profilePhoto bioTagline followerCount followingCount",
        match: Object.keys(userFilter).length > 0 ? userFilter : undefined,
      })
       .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
      searchQuery && searchQuery.trim()
      ? FollowModel.find(followQuery)
          .populate({
            path: "following",
            select: "_id",
            match: userFilter,
          })
          .then((results) => results.filter((r) => r.following).length)
      : FollowModel.countDocuments(followQuery),
  ]);
   const filteredFollowing = following
    .filter((f) => f.following)
    .map((f) => f.following);

      return {
    following: filteredFollowing,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasMore: skip + filteredFollowing.length < totalCount,
    },
  };
}

export const checkFollowStatus = async (
  currentUserId: string,
  targetUserId: string
) => {
  const followRelation = await FollowModel.findOne({
    follower: currentUserId,
    following: targetUserId,
  }).lean();

  return {
    isFollowing: !!followRelation,
  };
};

export const getFollowStats = async(userId: string) => {
  const user = await UserModels.findById(userId);

  if(!user){
    throw new Error("User not found");
  }

  return {
    followerCount: user.followerCount || 0,
    followingCount: user.followingCount || 0,
  }
}