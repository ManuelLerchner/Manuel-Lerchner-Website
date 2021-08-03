const ping = require("ping");
const fs = require("fs");

const GPIO = require("./HandleGPIO.js");
const PCRemote = require("./HandlePCRemote.js");
const Authentification = require("./HandleAuthentification.js");
const EmailService = require("./HandleEMail.js");

const Relay = new GPIO();
const PC = new PCRemote();
const Auth = new Authentification();
const Email = new EmailService();

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
            socket.on("relay authentification", (data) => {
                Auth.login(data).then(([success, response]) => {
                    var htmlResponse = `<span style='color: ${
                        success ? "green" : "red"
                    };'>${response}</span>`;

                    socket.emit("relay-event-response", htmlResponse);

                    if (success) {
                        this.activateRelay(process.env.RELAY_ON_TIME);
                        Email.sendMail(
                            "RaspberryPi Door-Service",
                            `${data.username} just opened Door!`
                        );
                    }
                });
            });

            //PC Authentification
            socket.on("pc authentification", (data) => {
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