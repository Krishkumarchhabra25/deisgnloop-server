import mongoose from "mongoose";

export const EducationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  stream: { type: String, required: true },
  schoolOrCollege: { type: String, required: true },
  startedIn: { type: Date, required: true },
  studiedTill: { type: Date },
  currentlyStudying: { type: Boolean, default: false },
  summary: { type: String, required: true },
}, {
  timestamps: true,
});