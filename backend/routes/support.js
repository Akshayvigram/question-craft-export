// routes/support.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const axios = require('axios');
const db = require('../awsdb');

require('dotenv').config();

module.exports = function(transporter, config) {
// 🔹 Email + Slack handler
router.post('/support', async (req, res) => {
  const { fullName, email, subject, message } = req.body;

  if (!fullName || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    await transporter.sendMail({
      from: `"Support Enquiry" <${config.EMAIL_USER}>`,
      to: config.EMAIL_USER, // Owner's email address
      subject: `New Support Message - ${subject}`,
      html: `
        <h2>Support Message from ${fullName}</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });

    res.json({ message: 'Support message sent successfully' });
  } catch (err) {
    console.error('Support message error:', err);
    res.status(500).json({ message: 'Failed to send support message' });
  }
});

return router;
};
