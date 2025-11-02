// src/modules/user/user.validator.ts
import { body, ValidationChain, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { sendError } from "../../utils/responseHandler";

/**
 * Personal Info validation rules.
 *
 * Keeps your original constraints but also allows a file upload for profilePhoto.
 * - profilePhoto can be provided either as a URL (req.body.profilePhoto) OR as an uploaded file (req.file).
 * - gender check is case-insensitive but still limited to the original three options.
 */
export const personalInfoRules: ValidationChain[] = [
body("name")
  .exists({ checkFalsy: true })
  .withMessage("Name is required")
  .isString()
  .withMessage("Name must be a string")
  .isLength({ min: 2, max: 50 })
  .withMessage("Name must be between 2 and 50 characters"),

body("bioTagline")
  .exists({ checkFalsy: true })
  .withMessage("Bio tagline is required")
  .isString()
  .withMessage("Bio tagline must be a string")
  .isLength({ min: 5, max: 150 })
  .withMessage("Bio tagline must be between 5 and 150 characters"),

body("gender")
  .exists({ checkFalsy: true })
  .withMessage("Gender is required")
  .trim()
  .toLowerCase()
  .isIn(["male", "female", "other"])
  .withMessage("Gender must be 'Male', 'Female' or 'Other'"),

body("dob")
  .exists({ checkFalsy: true })
  .withMessage("Date of birth is required")
  .isISO8601()
  .withMessage("Date of birth must be a valid ISO date"),

];

// Design Niche rules unchanged
export const designNicheRules: ValidationChain[] = [
  body("designNicheTags")
    .isArray({ min: 1 })
    .withMessage("Design niche tags must be a non-empty array"),
  body("designNicheTags.*")
    .isString()
    .withMessage("Each design niche tag must be a string")
    .isLength({ min: 2 })
    .withMessage("Each tag must be at least 2 characters"),
];

export const editProfileRules: ValidationChain[] = [
  // Name - optional but must be valid if provided
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .trim(),

  // Bio Tagline - optional but must be valid if provided
  body("bioTagline")
    .optional()
    .isString()
    .withMessage("Bio tagline must be a string")
    .isLength({ min: 5, max: 150 })
    .withMessage("Bio tagline must be between 5 and 150 characters")
    .trim(),

  // Profile Summary - optional
  body("summary")
    .optional()
    .isString()
    .withMessage("Summary must be a string")
    .isLength({ max: 500 })
    .withMessage("Summary must be maximum 500 characters")
    .trim(),

  // Location - optional
  body("location")
    .optional()
    .isString()
    .withMessage("Location must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters")
    .trim(),

  // Gender - optional but must be valid if provided
  body("gender")
    .optional()
    .trim()
    .toLowerCase()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be 'Male', 'Female' or 'Other'"),

  // Date of Birth - optional but must be valid ISO date if provided
  body("dob")
    .optional()
    .isISO8601()
    .withMessage("Date of birth must be a valid ISO date")
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      if (age < 13 || age > 120) {
        throw new Error("Date of birth must represent age between 13 and 120");
      }
      return true;
    }),

  // Social Links - all optional but must be valid URLs if provided
  body("linkedIn")
    .optional()
    .trim()
    .custom((value) => {
      if (value === "") return true; // Allow empty string to clear the field
      if (!value.includes("linkedin.com")) {
        throw new Error("LinkedIn URL must be a valid LinkedIn profile link");
      }
      return true;
    }),

  body("facebook")
    .optional()
    .trim()
    .custom((value) => {
      if (value === "") return true;
      if (!value.includes("facebook.com") && !value.includes("fb.com")) {
        throw new Error("Facebook URL must be a valid Facebook profile link");
      }
      return true;
    }),

  body("twitter")
    .optional()
    .trim()
    .custom((value) => {
      if (value === "") return true;
      if (!value.includes("twitter.com") && !value.includes("x.com")) {
        throw new Error("Twitter/X URL must be a valid Twitter or X profile link");
      }
      return true;
    }),

  body("instagram")
    .optional()
    .trim()
    .custom((value) => {
      if (value === "") return true;
      if (!value.includes("instagram.com")) {
        throw new Error("Instagram URL must be a valid Instagram profile link");
      }
      return true;
    }),

  // Design Niche Tags - optional but must be valid array if provided
  body("designNicheTags")
    .optional()
    .custom((value) => {
      // Handle string input (might be JSON string from form data)
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) {
            throw new Error("Design niche tags must be an array");
          }
          return true;
        } catch (e) {
          // If not JSON, treat as comma-separated
          const tags = value.split(',').map((tag: string) => tag.trim()).filter(Boolean);
          if (tags.length === 0) {
            throw new Error("Design niche tags must contain at least one tag");
          }
          return true;
        }
      }
      
      // Handle array input
      if (!Array.isArray(value)) {
        throw new Error("Design niche tags must be an array");
      }
      
      if (value.length > 0) {
        for (const tag of value) {
          if (typeof tag !== 'string' || tag.trim().length < 2) {
            throw new Error("Each design niche tag must be a string with at least 2 characters");
          }
        }
      }
      
      return true;
    }),
];

export const addExperienceRules: ValidationChain[] = [
  body("position")
    .exists({ checkFalsy: true })
    .withMessage("Position is required")
    .isString()
    .withMessage("Position must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Position must be between 2 and 100 characters")
    .trim(),

  body("organisation")
    .exists({ checkFalsy: true })
    .withMessage("Organisation is required")
    .isString()
    .withMessage("Organisation must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Organisation must be between 2 and 100 characters")
    .trim(),

  body("startedIn")
    .exists({ checkFalsy: true })
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid ISO date"),

  body("workedTill")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO date")
    .custom((value, { req }) => {
      if (req.body.currentlyWorking) {
        return true; // Skip validation if currently working
      }
      if (!value) {
        throw new Error("End date is required when not currently working");
      }
      return true;
    }),

  body("currentlyWorking")
    .optional()
    .isBoolean()
    .withMessage("Currently working must be a boolean"),

  body("summary")
    .exists({ checkFalsy: true })
    .withMessage("Summary is required")
    .isString()
    .withMessage("Summary must be a string")
    .isLength({ min: 10, max: 500 })
    .withMessage("Summary must be between 10 and 500 characters")
    .trim(),
];

export const updateExperienceRules: ValidationChain[] = [
  body("position")
    .optional()
    .isString()
    .withMessage("Position must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Position must be between 2 and 100 characters")
    .trim(),

  body("organisation")
    .optional()
    .isString()
    .withMessage("Organisation must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Organisation must be between 2 and 100 characters")
    .trim(),

  body("startedIn")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO date"),

  body("workedTill")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO date"),

  body("currentlyWorking")
    .optional()
    .isBoolean()
    .withMessage("Currently working must be a boolean"),

  body("summary")
    .optional()
    .isString()
    .withMessage("Summary must be a string")
    .isLength({ min: 10, max: 500 })
    .withMessage("Summary must be between 10 and 500 characters")
    .trim(),
];

// NEW: Education Validators

export const addEducationRules: ValidationChain[] = [
  body("degree")
    .exists({ checkFalsy: true })
    .withMessage("Degree is required")
    .isString()
    .withMessage("Degree must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Degree must be between 2 and 100 characters")
    .trim(),

  body("stream")
    .exists({ checkFalsy: true })
    .withMessage("Stream is required")
    .isString()
    .withMessage("Stream must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Stream must be between 2 and 100 characters")
    .trim(),

  body("schoolOrCollege")
    .exists({ checkFalsy: true })
    .withMessage("School/College is required")
    .isString()
    .withMessage("School/College must be a string")
    .isLength({ min: 2, max: 150 })
    .withMessage("School/College must be between 2 and 150 characters")
    .trim(),

  body("startedIn")
    .exists({ checkFalsy: true })
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid ISO date"),

  body("studiedTill")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO date")
    .custom((value, { req }) => {
      if (req.body.currentlyStudying) {
        return true; // Skip validation if currently studying
      }
      if (!value) {
        throw new Error("End date is required when not currently studying");
      }
      return true;
    }),

  body("currentlyStudying")
    .optional()
    .isBoolean()
    .withMessage("Currently studying must be a boolean"),

  body("summary")
    .exists({ checkFalsy: true })
    .withMessage("Summary is required")
    .isString()
    .withMessage("Summary must be a string")
    .isLength({ min: 10, max: 500 })
    .withMessage("Summary must be between 10 and 500 characters")
    .trim(),
];

export const updateEducationRules: ValidationChain[] = [
  body("degree")
    .optional()
    .isString()
    .withMessage("Degree must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Degree must be between 2 and 100 characters")
    .trim(),

  body("stream")
    .optional()
    .isString()
    .withMessage("Stream must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Stream must be between 2 and 100 characters")
    .trim(),

  body("schoolOrCollege")
    .optional()
    .isString()
    .withMessage("School/College must be a string")
    .isLength({ min: 2, max: 150 })
    .withMessage("School/College must be between 2 and 150 characters")
    .trim(),

  body("startedIn")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO date"),

  body("studiedTill")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO date"),

  body("currentlyStudying")
    .optional()
    .isBoolean()
    .withMessage("Currently studying must be a boolean"),

  body("summary")
    .optional()
    .isString()
    .withMessage("Summary must be a string")
    .isLength({ min: 10, max: 500 })
    .withMessage("Summary must be between 10 and 500 characters")
    .trim(),
];


/**
 * validateRequest middleware
 * - returns a structured 'details' array of validation errors
 * - uses validationResult().mapped() to avoid TypeScript union-shape issues
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // mapped returns Record<string, ValidationError>
    const mapped = result.mapped();
    // convert to friendly array: { param, msg, value }
    const errs = Object.keys(mapped).map((param) => {
      const err: any = mapped[param];
      return { param, msg: err.msg, value: err.value };
    });
    console.error("Validation errors:", JSON.stringify(errs, null, 2));
    return sendError(res, "Validation Error", 400, errs);
  }
  next();
};
