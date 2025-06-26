import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config()


export const sendVerificationEmail =async (to:string,token:string)=>{
    const transporter=nodemailer.createTransport({
        service:'Gmail',
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS
        },
    });

    const verificationLink=`${process.env.FRONTEND_URL}/verifyEmail?token=${encodeURIComponent(token)}`;

    const mailOptions={
        from:process.env.EMAIL_USER,
        to,
        subject:'Verify your email Address',
        html:`<p>Hi,</p>
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>This link will expire in 1 hour.</p>`,
    }
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${to}`)
    } catch (error) {
        console.error('Error sending email:',error);
        throw new Error('Could not send verification email')
    }
}