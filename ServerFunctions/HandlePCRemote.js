const { exec } = require("child_process");
const dotenv = require("dotenv");

//Config
dotenv.config({ path: "./config/config.env" });

//Secrets
var username = process.env.UN_MIC_PC;
var password = process.env.PW_MIC_PC;
var ip = process.env.PC_IP;
var mac = process.env.PC_MAC;

class PCRemote {
    constructor() {
        this.shutdownCommand = `net rpc shutdown -t 30 -U ${username}%${password} -I ${ip}`;
        this.wakeupCommand = `wakeonlan ${mac}`;
    }

    execCommand(command) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    }

    on() {
        if (process.env.NODE_ENV == "developement") {
            console.log("Suppressed turning PC ON");
        } else {
            console.log("Turn PC ON");
            this.execCommand(this.wakeupCommand);
        }
    }

    off() {
        if (process.env.NODE_ENV == "developement") {
            console.log("Suppressed turning PC OFF");
        } else {
            console.log("Turn PC OFF");
            this.execCommand(this.shutdownCommand);
        }
    }
}

module.exports = PCRemote;
