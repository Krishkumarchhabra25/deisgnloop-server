import { NextFunction, Request, Response } from "express";
import { sendError } from "../../utils/responseHandler";

export const validateFirebaseLogin =(req: Request , res:Response , next:NextFunction)=>{
    const {idToken} = req.body;

    if(!idToken || typeof idToken !== 'string'){
        return sendError(res, "Firebase ID token is required", 400)
    }
    next();
}