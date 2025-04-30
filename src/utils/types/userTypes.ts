import { Request } from "express";

/**
 * User type defining structure of a user record in PostgreSQL
 * Since these timestamps are mostly used for database records but are not critical for authentication, we can make them optional in our User type.
 */
export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: string;
    father: string;
    mother: string;
    tribe: string;
    clan: string;
    birth_place: string;
    birth_date: string;
    sub_county: string;
    residence: string;
}

/**
 * Custom Express Request Type to include `user` object
 */
export interface UserRequest extends Request {
    user?: User;
}

