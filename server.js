require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Email route
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  const mailOptions = {
  from: process.env.EMAIL,
  to: email, // send to the user, not yourself
  subject: `Thanks for contacting us, ${name}`,
  html: `
    <div style="font-family: sans-serif; padding: 10px;">
      <h2>Hello ${name},</h2>
      <p>Thanks for reaching out! We've received your message:</p>
      <blockquote>${message}</blockquote>
      <p>We'll get back to you soon.</p>
      <br>
      <p>Best regards,<br>RTJ Pvt. Ltd.</p>
    </div>
  `,
  replyTo: email, // optional but good
};

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', email);
    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('❌ Email error:', error);
    res.status(500).json({ success: false, message: 'Email sending failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
