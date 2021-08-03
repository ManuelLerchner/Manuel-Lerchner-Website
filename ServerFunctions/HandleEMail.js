const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

//Config
dotenv.config({ path: "./config/config.env" });

class EMail {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    sendMail(subject, text) {
        if (process.env.NODE_ENV == "developement") {
            console.log("Suppressed sending Email");
        } else {
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
    }
}

module.exports = EMail;
