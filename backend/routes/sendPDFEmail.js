const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");

const upload = multer();
const router = express.Router();

module.exports = function sendPDFEmail(config) {
  router.post("/send-email", upload.single("file"), async (req, res) => {
    const { receiverEmail, senderEmail, title, userName } = req.body;
    const file = req.file;


    if (!receiverEmail || !senderEmail || !file || !userName) {
      return res.status(400).json({ message: "Missing required fields" });
    }


    try {
      const transporter = nodemailer.createTransport({
        service: "gmail", // you can switch to SMTP/SES later
        auth: {
          user: config.EMAIL_USER, // Gmail/SMTP username
          pass: config.EMAIL_PASS, // Gmail App Password
        },
      });

      await transporter.sendMail({
        from: `"Vinathaal" <${senderEmail}>`,
        to: receiverEmail,
        subject: `Shared Question Paper: ${title}`,
        text: `Hi,\n\n${userName} has shared a question paper with you.\n\nRegards,\n${title}`,
        attachments: [
          {
            filename: file.originalname || "question-paper.pdf",
            content: file.buffer, // PDF in memory
            contentType: file.mimetype, // ✅ force PDF type
          },
        ],
      });

      res.json({ message: "Email sent successfully" });
    } catch (err) {
      console.error("Email send error:", err);
      res.status(500).json({ message: "Failed to send email" });
    }
  });


  console.log("✅ Mail Share Option Ready");


  return router;
};
