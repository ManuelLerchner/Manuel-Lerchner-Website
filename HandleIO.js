const ping = require("ping");
const dotenv = require("dotenv");
const fs = require("fs");

const RelayGPIO = require("./HandleGPIO.js");
const PCRemote = require("./HandlePCRemote.js");

dotenv.config({ path: "./config/config.env" });

//Interaction Objects
const Relay = new RelayGPIO();
const PC = new PCRemote();

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
                var { username, password } = data;

                console.log(username, password);

                this.activateRelay(process.env.RELAY_ON_TIME);
            });

            //PC Authentification
            socket.on("pc authentification", (data) => {
                var { username, password } = data;

                console.log(username, password);

                this.togglePCState();
            });

            //User GeoLocation
            socket.on("userInfo", (data) => {
                let dateTime = new Date()
                    .toISOString()
                    .replace(/T/, " ")
                    .replace(/\..+/, "");

                var { ip, city, region, country, long, lat } = data;

                var str = `date=${dateTime}, ip=${ip}, city=${city}, region=${region}, country=${country}, long=${long}, lat=${lat}\n`;

                fs.appendFile("acesslog.txt", str, function (err) {
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
