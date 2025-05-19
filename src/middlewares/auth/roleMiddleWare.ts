import { NextFunction, Response } from "express";
import asyncHandler from "../asyncHandler"
import { UserRequest } from "../../utils/types/userTypes";


//ensure user has required roles
export const roleGuard = (allowedRoles: string[], ...args: string[]) =>
    asyncHandler<void, UserRequest>(async (req:UserRequest, res:Response, next:NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            res.status(403).json({ message: "Access denied: Insufficient permissions" });
            return;
        }
        next();
    });



// // Specific guards
export const adminGuard = roleGuard(["admin"]);
export const archbishopGuard = roleGuard(["archbishop"]);
export const deanGuard = roleGuard(["dean"]);
export const clerkGuard = roleGuard(["clerk"]);
export const priestGuard = roleGuard(["priest"]);
export const memberGuard = roleGuard(["member"]);
export const allGuard = roleGuard([
    "admin",
    "archbishop",
    "dean",
    "clerk",
    "priest",
    "member"
]);
