const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.email,
    pass: process.env.email_pass,
  },
});

// Wrap in an async IIFE so we can use await.
 exports.sendMail = async (option) => {
  const info = await transporter.sendMail({
    from: process.env.email,
    to: option.email,
    subject: option.subject,
    text: option.text, // plain‑text body
    html: option.html, // HTML body
  });

//   console.log("Message sent:", info.messageId);
 };