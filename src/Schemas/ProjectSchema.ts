import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const ProjectSchema = new mongoose.Schema({
  projectId: { type: String, default: uuidv4, unique: true, sparse: true },
  projectPhoto: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  startedIn: { type: Date },
  completedIn: { type: Date },
  currentlyInProgress: { type: Boolean, default: false },
  fileAttachment: { type: String },
  projectURL: { type: String },
});
