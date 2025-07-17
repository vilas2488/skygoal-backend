const nodemailer = require("nodemailer");

const sendOtp = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    to: email,
    subject: "Your OTP Code",
    html: `<h2>Your OTP is: ${otp}</h2>`,
  });
};

module.exports = sendOtp;
