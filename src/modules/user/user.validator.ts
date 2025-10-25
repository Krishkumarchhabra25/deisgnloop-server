// src/modules/user/user.validator.ts
import { body, ValidationChain, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { sendError } from "../../utils/responseHandler";

// Step 1: Personal Info validation rules
export const personalInfoRules: ValidationChain[] = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .notEmpty()
    .withMessage("Name is required"),
  body("bioTagline")
    .isString()
    .withMessage("Bio tagline must be a string")
    .isLength({ min: 5, max: 150 })
    .withMessage("Bio tagline must be between 5 and 150 characters")
    .notEmpty()
    .withMessage("Bio tagline is required"),
  body("gender")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be 'Male', 'Female' or 'Other'"),
  body("dob")
    .isISO8601()
    .withMessage("Date of birth must be a valid ISO date")
    .notEmpty()
    .withMessage("Date of birth is required"),
  body("profilePhoto")
    .optional()
    .isURL()
    .withMessage("Profile photo must be a valid URL"),
];

// Step 2: Design Niche validation rules
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

// Middleware to check validation results
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(
      res,
      "Validation Error",
      400,
      errors.array().map((err) => err.msg)
    );
  }
  next();
};
