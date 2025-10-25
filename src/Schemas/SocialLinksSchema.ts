import mongoose from "mongoose";

export const SocialLinksSchema = new mongoose.Schema({
  linkedin: { type: String },
  facebook: { type: String },
  twitter: { type: String },
  instagram: { type: String },
});
