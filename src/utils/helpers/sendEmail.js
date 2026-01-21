"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sendVerificationEmail = (to, token) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });
    const verificationLink = `${process.env.FRONTEND_URL}/verifyEmail?token=${encodeURIComponent(token)}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Welcome to Christian Data Management System - Email Verification',
        html: `
            <p>Dear Christian,</p>
            <p>An account was created with your email address for the <strong>Christian Data Management System:</strong><strong> Archdiocese of Nyeri</strong>!</p>
            <p>To complete the registration and activate your account, please verify your email address by clicking the link below:</p>
            <p><strong><a href="${verificationLink}">Verify Email</a></strong></p>
            <p>This link will expire in 1 hour for your security.</p>
            <p>If you did not create an account, please ignore this email.</p>
            <br>
            <p>Thank you,<br>The Archdiocese of Nyeri Team</p>
        `,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully to:', to);
        return { success: true, message: 'Verification email sent successfully' };
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Could not send verification email');
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
