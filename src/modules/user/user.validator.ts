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
