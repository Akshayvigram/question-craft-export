// utils/mailer.js

const nodemailer = require("nodemailer");

/**
 * Creates and configures a Nodemailer transporter.
 * @param {object} config - The application configuration object containing EMAIL_USER and EMAIL_PASS.
 * @returns {object} The configured Nodemailer transporter instance.
 */
module.exports = function createTransporter(config) {
  // Create the transporter using credentials from the config object
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Use with caution, often for development with self-signed certs
    },
  });

  // Verify the connection configuration on startup
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Mail transporter verification failed:", error);
    } else {
      console.log("✅ Mail transporter is ready to send emails.");
    }
  });

  return transporter;
};