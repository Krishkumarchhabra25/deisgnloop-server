import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/responseHandler";
import { handleFirebaseLogin } from "./auth.service";

export const firebaseLoginController = async (req: Request, res: Response) => {
  console.log("firebaseLoginController called with body:", req.body);

  try {
    const { idToken, provider } = req.body;

    if (!idToken || !provider) {
      console.log("Missing idToken or provider in request");
      return sendError(res, "Missing idToken or provider", 400);
    }

    const { User, token } = await handleFirebaseLogin(idToken);
    console.log("handleFirebaseLogin returned:", { User, token });

    return sendSuccess(res, "Login Successful", { User, token });
  } catch (error) {
    console.error("firebaseLoginController error:", error);
    return sendError(res, "Firebase Login Failed", 500, error);
  }
};
