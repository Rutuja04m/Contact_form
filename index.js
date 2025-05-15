const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const CONTACTS_FILE = path.join(__dirname, "contacts.json");

app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  const data = {
    name,
    email,
    subject,
    message,
    timestamp: new Date().toISOString(),
  };

  // ✅ Step 1: Save form data to contacts.json
  try {
    let existingData = [];

    if (fs.existsSync(CONTACTS_FILE)) {
      const fileContent = fs.readFileSync(CONTACTS_FILE, "utf-8");
      existingData = JSON.parse(fileContent || "[]");
    }

    existingData.push(data);
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(existingData, null, 2));
    console.log("✅ Contact data saved");
  } catch (err) {
    console.error("❌ Error saving contact data:", err);
  }

  // ✅ Step 2: Setup Brevo (Sendinblue) SMTP for Nodemailer
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: "8cba47001@smtp-brevo.com", // your Brevo login
      pass: process.env.BREVO_SMTP_KEY  // store this in your .env securely
    }
  });

  transporter.verify((error, success) => {
    if (error) {
      console.log("❌ Email transporter error:", error);
    } else {
      console.log("✅ Server is ready to take messages");
    }
  });

  const mailOptions = {
    from: '"ContactForm Team" <8cba47001@smtp-brevo.com>', // must match Brevo identity
    to: email,
    subject: "Thanks for contacting us!",
    html: `
      <p>Hi <b>${name}</b>,</p>
      <p>Thank you for contacting us. We've received your message:</p>
      <blockquote>${message}</blockquote>
      <p>We'll get back to you soon!</p>
      <br><p>– Team ContactForm</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to", email);
    res.status(200).json({ success: true });
  } catch (err) {
    console.log("❌ Email failed:", err);
    res.status(500).json({ success: false, message: "Error sending email" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
