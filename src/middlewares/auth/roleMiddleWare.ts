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
export const superAdminGuard = roleGuard(["superadmin"]);
export const superViewerGuard = roleGuard(["superviewer"]);
export const deaneryViewerGuard = roleGuard(["deaneryviewer"]);
export const parishAdminGuard = roleGuard(["parishadmin"]);
export const parishViewerGuard = roleGuard(["parishviewer"]);
export const secretaryGuard = roleGuard(["secretary"]);
export const memberGuard = roleGuard(["member"]);
export const allViewersGuard = roleGuard(["superadmin", "superviewer", "deaneryviewer", "parishadmin", "parishviewer", "secretary"]);
export const allAdminsGuard = roleGuard(["superadmin", "parishadmin", "secretary"]);
export const adminsPlusOwnersGuard = roleGuard(["superadmin", "parishadmin", "secretary", "member"])
export const allGuard = roleGuard(["superadmin", "superviewer", "deaneryviewer", "parishadmin", "parishviewer", "secretary", "member"]);
