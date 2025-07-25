// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER, // set in your .env file
//     pass: process.env.SMTP_PASS, // set in your .env file
//   },
// });

// async function sendApproverMail(to, subject, text) {
//   await transporter.sendMail({
//     from: process.env.SMTP_USER,
//     to,
//     subject,
//     text,
//   });
// }

// module.exports = { sendApproverMail };

const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendApproverMail = async (to, subject, username) => {
  const mailOptions = {
    from: `"Meeting System" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: `<p>New user <strong>${username}</strong> requires approval.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendApproverMail };
