import mongoose from "mongoose";

export const PortfolioLinksSchema = new mongoose.Schema({
  website: { type: String },
  youtube: { type: String },
  dribbble: { type: String },
  behance: { type: String },
  pigment: { type: String },
  canva: { type: String },
});
