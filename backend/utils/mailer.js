const nodemailer = require('nodemailer');
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


const sendVerificationEmail = async (email, token) => {
    const verificationLink = `http://localhost:3000/verify?token=${token}`;

    const mailOptions = {
        from: '"Mathlete" <your-email@gmail.com>',
        to: email,
        subject: 'Verify your Mathlete account',
        html: `<p>Click the link to verify your email:</p><a href="${verificationLink}">${verificationLink}</a>`
    };

    return transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
