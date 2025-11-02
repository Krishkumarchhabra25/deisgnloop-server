import mongoose from "mongoose";
import { SocialLinksSchema } from "../Schemas/SocialLinksSchema";
import { PortfolioLinksSchema } from "../Schemas/PortfolioLinksSchema";
import { ExperienceSchema } from "../Schemas/ExperienceSchema";
import { ProjectSchema } from "../Schemas/ProjectSchema";
import { EducationSchema } from "../Schemas/EducationSchema";


const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    password: { type: String }, // for local auth
    provider: { type: String, enum: ["google", "apple", "local"], default: "local" },
    firebaseUid: { type: String },
    
    profilePhoto: { type: String },
    bioTagline: { type: String },
    summary: { type: String },

    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    location: { type: String },

    socialLinks: { type: SocialLinksSchema, default: {} },
    portfolioLinks: { type: PortfolioLinksSchema, default: {} },

    designNicheTags: [{ type: String }],
    experience: [ExperienceSchema],
    education: [EducationSchema],
    projects: [ProjectSchema],

    totalProfileViews: { type: Number, default: 0 },
    followerCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    isAccountSetupComplete: {type:Boolean , default:false},
    accountSetupStep: { type: Number, default: 0 }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
