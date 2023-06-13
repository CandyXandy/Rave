const nodemailer = require("nodemailer");

// #region Transport

const transport = nodemailer.createTransport(
  {
    host: process.env.RAVE_SMTP_HOST,
    port: process.env.RAVE_SMTP_PORT,
    secure: process.env.RAVE_SMTP_SECURE,
    auth: {
      user: process.env.RAVE_SMTP_USERNAME,
      pass: process.env.RAVE_SMTP_PASSWORD,
    },
  },
  {
    from: process.env.RAVE_MAIL_FROM,
  }
);

module.exports = transport;

// #endregion
