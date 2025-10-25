import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const ExperienceSchema = new mongoose.Schema({
  experienceId: { type: String, default: uuidv4, unique: true, sparse: true },
  position: { type: String, required: true },
  organization: { type: String, required: true },
  startedIn: { type: Date, required: true },
  completedIn: { type: Date },
  currentlyWorking: { type: Boolean, default: false },
  summary: { type: String },
});

