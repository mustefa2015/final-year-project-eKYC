// emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv"; 

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // This allows self-signed certificates
  },
});

// Updated sendEmail function to include HTML and attachments
export const sendEmail = async (to, subject, text, html, attachments) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
      attachments, // Attachments array
    });

    console.log(`Email sent to ${to}:`, info.response);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw error;
  }
};
