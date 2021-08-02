const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

function mail(subject, text) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_RECEIVER,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log(subject, "sent an Email");
        }
    });
}

module.exports = mail;
