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
export const adminGuard = roleGuard(["Admin"]);
export const clergyGuard = roleGuard(["Clergy"]);
export const memberGuard = roleGuard(["Member"]);
export const adminClergyGuard = roleGuard(["Admin" , "Clergy"]);
export const allGuard = roleGuard(["Admin", "Clergy", "Member"]);

