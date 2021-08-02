try {
    const Gpio = require("onoff").Gpio;
    const dotenv = require("dotenv");

    dotenv.config({ path: "./config/config.env" });

    const LED = new Gpio(process.env.RELAY_PIN, "out");
    LED.writeSync(1); // Initially OFF

    class RelayGPIO {
        constructor() {
            LED.writeSync(1); // Initially OFF
        }

        on() {
            LED.writeSync(0);
            console.log("Turn Relay ON");
        }

        off() {
            LED.writeSync(1);
            console.log("Turn Relay OFF");
        }
    }

    module.exports = RelayGPIO;
} catch (err) {
    module.exports = class None {
        on() {
            console.log("trying to turn relay ON on PC");
        }
        off() {
            console.log("trying to turn relay OFF on PC");
        }
    };
}
