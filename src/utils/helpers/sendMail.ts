import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config()


export const sendVerificationEmail =async (to:string,token:string)=>{
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationLink=`${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Welcome to Christian Data Management System - Email Verification',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4A002A; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 30px; }
                .button { 
                  display: inline-block; 
                  padding: 12px 30px; 
                  background-color: #4A002A; 
                  color: white; 
                  text-decoration: none; 
                  border-radius: 5px; 
                  margin: 20px 0;
                  font-weight: bold;
                  transition: background-color 0.3s ease;
                }
                .button:hover {
                  background-color: #c2ae6d;
                  color: #4A002A;
                }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                .warning { background-color: #fff3cd; border-left: 4px solid #c2ae6d; padding: 10px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to Christian Data Management System</h1>
                </div>
                <div class="content">
                  <p>Dear Christian,</p>
                  <p>An account was created with your email address for the <strong>Christian Data Management System:</strong><strong> Archdiocese of Nyeri</strong>!</p>
                  
                  <p>To complete the registration and activate your account, please verify your email address by clicking the button below:</p>
                  
                  <p style="text-align: center;">
                    <a href="${verificationLink}" class="button">Verify Email Address</a>
                  </p>
                  
                  <p>Or copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; color: #4a002a; background-color: #f0f0f0; padding: 10px; border-radius: 5px;">${verificationLink}</p>
                  
                  <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul>
                      <li>This link will expire in 1 hour for your security</li>
                      <li>If you did not create an account, please ignore this email</li>
                      <li>Your account will not be fully activated until you verify your email</li>
                    </ul>
                  </div>
                  
                  <p>Thank you for joining our community!</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Archdiocese of Nyeri - Christian Data Management System</p>
                  <p>This is an automated email. Please do not reply.</p>
                </div>
              </div>
            </body>
            </html>
        `,
    }
    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully to:', to);
        return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
        console.error('Error sending email:',error);
        throw new Error('Could not send verification email')
    }
}

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  firstName?: string,
) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Frontend reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - CBMS Archdiocese of Nyeri",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4A002A; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background-color: #4A002A; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
              font-weight: bold;
              transition: background-color 0.3s ease;
            }
            .button:hover {
              background-color: #c2ae6d;
              color: #4A002A;
            }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .warning { background-color: #fff3cd; border-left: 4px solid #c2ae6d; padding: 10px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${firstName || ""},</p>
              
              <p>We received a request to reset your password for your CBMS account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4a002a; background-color: #f0f0f0; padding: 10px; border-radius: 5px;">${resetUrl}</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in 15 minutes</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your password will not change until you create a new one</li>
                </ul>
              </div>
              
              <p>For security reasons, we cannot tell you your current password. You must create a new one.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Archdiocese of Nyeri - Christian Data Management System</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};