import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/responseHandler";


export const errorHandler = (err:any , req:Request , res:Response , next:NextFunction) => {
    console.error('Global Error', err);
    return sendError(res, err.message || "Something went wrong" , err.statusCode || 500 , err)
}