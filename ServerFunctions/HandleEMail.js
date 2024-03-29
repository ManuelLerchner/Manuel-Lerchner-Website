const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

//Config
dotenv.config({ path: "./config/config.env" });

class EMailService {
    constructor() {
        const myOAuth2Client = new OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.EMAIL_REDIRECT_URI
        )

        myOAuth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
        });

        const myAccessToken = myOAuth2Client.getAccessToken()

        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.EMAIL_USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: myAccessToken
            },
        });

        this.sendMail("Website ready!", "The Website just launched, and is now ready to use!")
    }

    getInstance() {
        return new EMailService();
    }

    sendMail(subject, text, sendToEveryone = false) {
        let receivers = process.env.EMAIL_RECEIVERS.split(";");

        if (!sendToEveryone) {
            receivers = [receivers[0]];
        }

        receivers.forEach((receiver) => {
            if (process.env.NODE_ENV == "developement") {
                console.log(`Surpressed Sending email '${subject}' - '${text.replace(/\n/g, " ")}' to '${receiver}'`);
            } else {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: receiver,
                    subject: subject,
                    text: text,
                };

                this.transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log(`Sending email '${subject}' - '${text.replace(/\n/g, " ")}' to '${receiver}'`);
                    }
                });
            }
        });
    }
}

const EmailSingelton = new EMailService();

Object.freeze(EmailSingelton);

module.exports = EmailSingelton;
