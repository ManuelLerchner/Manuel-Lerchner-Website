try {
    const Gpio = require("onoff").Gpio;

    const LED = new Gpio(process.env.RELAY_PIN, "out");
    LED.writeSync(1); // Initially OFF

    module.exports = class RelayGPIO {
        constructor() {
            LED.writeSync(1); // Initially OFF
        }

        activateRelay(time) {
            this.on();

            setTimeout(
                function () {
                    this.off();
                }.bind(this),
                time
            );
        }

        on() {
            if (process.env.NODE_ENV == "developement") {
                console.log("Suppressed turning Relay ON");
            } else {
                LED.writeSync(0);
                console.log("Turn Relay ON");
            }
        }

        off() {
            if (process.env.NODE_ENV == "developement") {
                console.log("Suppressed turning Relay OFF");
            } else {
                LED.writeSync(1);
                console.log("Turn Relay OFF");
            }
        }
    };
} catch (err) {
    module.exports = class RelayGPIO_PC {
        activateRelay(time) {
            this.on();

            setTimeout(
                function () {
                    this.off();
                }.bind(this),
                time
            );
        }

        on() {
            if (process.env.NODE_ENV == "developement") {
                console.log("Suppressed turning Relay ON");
            } else {
                console.log("Turning Relay ON on PC");
            }
        }
        off() {
            if (process.env.NODE_ENV == "developement") {
                console.log("Suppressed turning Relay OFF");
            } else {
                console.log("Turning Relay OFF on PC");
            }
        }
    };
}
