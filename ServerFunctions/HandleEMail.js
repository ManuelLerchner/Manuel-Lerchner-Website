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
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    sendMail(subject, text, sendToEveryone = false) {
        let receivers = process.env.EMAIL_RECEIVERS.split(";");

        if (!sendToEveryone) {
            receivers = [receivers[0]];
        }

        receivers.forEach((receiver) => {
            if (process.env.NODE_ENV == "developement") {
                console.log("Suppressed sending Email to " + receiver);
            } else {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: receiver,
                    subject: subject,
                    text: text,
                };

                this.transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(subject, "sent an Email");
                    }
                });
            }
        });
    }
}

module.exports = EMail;
