const ping = require("ping");
const fs = require("fs");
const dotenv = require("dotenv");

const GPIO = require("./HandleGPIO.js");
const PCRemote = require("./HandlePCRemote.js");
const Authentification = require("./HandleAuthentification.js");
const EmailService = require("./HandleEMail.js");
const SessionService = require("./HandleSession.js");

//Config
dotenv.config({ path: "./config/config.env" });

const Relay = new GPIO();
const PC = new PCRemote();
const Auth = new Authentification();
const Email = new EmailService();
const Session = new SessionService();

Session.deleteOldRequest();

setInterval(() => {
    Session.deleteOldRequest();
}, 1000 * 60 * 60);

//Initial States
var relayState = false;
var pcState = false;

class HandleIO {
    constructor(io) {
        this.io = io;
    }

    handleEvents() {
        this.io.on("connection", (socket) => {
            //Start PC Check Intervall
            var UpdateInterval = setInterval(
                function () {
                    this.updatePCState(process.env.PC_IP);
                }.bind(this),
                process.env.PC_STATE_UPDATE_TIME
            );

            //Relay Authentification
            socket.on("relay authentification", async (data) => {
                let [sucess, msg] = await this.handleSessions(socket);

                if (!sucess) {
                    socket.emit(
                        "relay-event-response",
                        `<span style='color: "red";'>${msg}</span>`
                    );
                    return;
                }

                Auth.login(data).then(([success, response]) => {
                    var htmlResponse = `<span style='color: ${
                        success ? "green" : "red"
                    };'>${response}</span>`;

                    socket.emit("relay-event-response", htmlResponse);

                    if (success) {
                        this.activateRelay(process.env.RELAY_ON_TIME);
                        Email.sendMail(
                            "RaspberryPi Door-Service",
                            `${data.username} just opened Door!`,
                            true
                        );
                    }
                });
            });

            //PC Authentification
            socket.on("pc authentification", async (data) => {
                let [sucess, msg] = await this.handleSessions(socket);

                if (!sucess) {
                    socket.emit(
                        "pc-event-response",
                        `<span style='color: "red";'>${msg}</span>`
                    );
                    return;
                }
                Auth.login(data).then(([success, response]) => {
                    var htmlResponse = `<span style='color: ${
                        success ? "green" : "red"
                    };'>${response}</span>`;

                    socket.emit("pc-event-response", htmlResponse);

                    if (success) {
                        this.togglePCState();
                    }
                });
            });

            //Contact Form
            socket.on("contact form", (data) => {
                var { username, email, message } = data;
                socket.emit("form-event-response");
                Email.sendMail(
                    "RaspberryPi Messenger-Service",
                    `${username} / ${email} just send a Message! \n\n${message}`
                );
            });

            //Register Form
            socket.on("register form", (data) => {
                Auth.register(data).then(([success, response]) => {
                    var htmlResponse = `<span style='color: ${
                        success ? "green" : "red"
                    };'>${response}</span>`;

                    socket.emit("registration-event-response", htmlResponse);
                });
            });

            //User GeoLocation
            socket.on("userInfo", (data) => {
                let dateTime = new Date()
                    .toISOString()
                    .replace(/T/, " ")
                    .replace(/\..+/, "");

                var str = dateTime + " " + JSON.stringify(data) + "\n";
                fs.appendFile("./logs/accesslog.txt", str, function (err) {
                    if (err) return console.log(err);
                });
            });

            //Stop PC Check Intervall
            socket.on("disconnect", () => {
                clearInterval(UpdateInterval);
            });

            //Emit States
            this.io.emit("relay_state-update", relayState);
            this.io.emit("pc_state-update", pcState);
        });
    }

    async handleSessions(socket) {
        var clientIp = socket.request.connection.remoteAddress;

        var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
        // let [succ, msg] = await Sessions.checkIfTooManyRequests(ip);

        return await Session.checkIfTooManyRequests(ip);
    }

    activateRelay(time) {
        relayState = true;
        Relay.on();
        this.io.emit("relay_state-update", relayState);

        setTimeout(
            function () {
                relayState = false;
                Relay.off();
                this.io.emit("relay_state-update", relayState);
            }.bind(this),
            time
        );
    }

    togglePCState() {
        if (pcState == true) {
            PC.off();
        } else {
            PC.on();
        }
    }

    updatePCState(IP) {
        return ping.sys.probe(IP, (isAlive) => {
            pcState = isAlive;
            this.io.emit("pc_state-update", pcState);
        });
    }
}

module.exports = HandleIO;
