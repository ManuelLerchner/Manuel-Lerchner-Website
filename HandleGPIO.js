const gpio = require("gpio");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

class RelayGPIO {
    constructor() {
        this.relayGPIO = gpio.export(process.env.RELAY_PIN, {
            direction: gpio.DIRECTION.OUT
        });
    }

    on() {
        this.relayGPIO.set();
        console.log("turn Relay ON");
    }

    off() {
        this.relayGPIO.set(0);
        console.log("turn Relay OFF");
    }
}

module.exports = RelayGPIO;
