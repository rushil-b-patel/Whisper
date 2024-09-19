import { VERIFICATION_TEMPLATE, WELCOME_TEMPLATE } from "./emailTemplates.js";
import nodemailer from "nodemailer";
import { GMAIL_USER, GMAIL_PASS } from "../utils/envVariables.js";

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
    }
});

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = email;
    try{
      const response = await transporter.sendMail({
        // from: '"Whisper 👻" <rushil13579@gmail.email>', 
        to: recipient,
        subject: "Verify your email", 
        html: VERIFICATION_TEMPLATE.replace("{verificationCode}", verificationToken),
      });
      console.log("Message sent: %s", response.messageId);
    }
    catch(error){
      console.error(error);
      throw new Error("Error sending email");
    }
}

export const sendWelcomeEmail = async (email, userName) => {
  const recipient = email;
  try{
    const response = await transporter.sendMail({
      to: recipient,
      subject: "Welcome to Whisper",
      html: WELCOME_TEMPLATE.replace("{userName}", userName)
    })
    console.log("Message sent: %s", response.messageId);
  }
  catch(error){
    console.error(error);
    throw new Error("Error sending email");
  }
}