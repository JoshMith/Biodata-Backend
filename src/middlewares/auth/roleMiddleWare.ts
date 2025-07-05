import { NextFunction, Response } from "express";
import asyncHandler from "../asyncHandler"
import { UserRequest } from "../../utils/types/userTypes";


//ensure user has required roles
export const roleGuard = (allowedRoles: string[], ...args: string[]) =>
    asyncHandler<void, UserRequest>(async (req:UserRequest, res:Response, next:NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.roles)) {
            res.status(403).json({ message: "Access denied: Insufficient permissions" });
            return;
        }
        next();
    });



// // Specific guards
export const superuserGuard = roleGuard(["superuser"]);
export const viewerGuard = roleGuard(["viewer"]);
export const editorGuard = roleGuard(["editor"]);
export const memberGuard = roleGuard(["member"]);
export const allViewersGuard = roleGuard(["superuser", "viewer", "editor"]);
export const adminEditorGuard = roleGuard(["superuser", "editor"]);
export const allGuard = roleGuard(["superuser", "viewer", "editor", "member"]);
