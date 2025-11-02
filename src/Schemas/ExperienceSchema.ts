import mongoose from "mongoose";

export const ExperienceSchema = new mongoose.Schema({
  position: { type: String, required: true },
  organisation: { type: String, required: true },
  startedIn: { type: Date, required: true },
  workedTill: { type: Date },
  currentlyWorking: { type: Boolean, default: false },
  summary: { type: String, required: true },
}, {
  timestamps: true,
});
