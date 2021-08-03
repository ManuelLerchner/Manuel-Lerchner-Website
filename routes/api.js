const express = require("express");
const router = express.Router();

const Authentification = require("../ServerFunctions/HandleAuthentification.js");
const RelayGPIO = require("../ServerFunctions/HandleGPIO.js");
const EMailService = require("../ServerFunctions/HandleEMail.js");

const Auth = new Authentification();
const Relay = new RelayGPIO();
const Email = new EMailService();

//  Post /API/relay
router.post("/relay", async (req, res) => {
    try {
        username = req.body.username;
        password = req.body.password;
    } catch (err) {
        res.sendStatus(400); //Bad parameters;
    }

    var [success, response] = await Auth.login({ username, password });

    if (success) {
        Relay.activateRelay(process.env.RELAY_ON_TIME);
        res.sendStatus(200); //ok
        Email.sendMail(
            "RaspberryPi Door-Service",
            `${username} just opened Door!`
        );
    } else if (response != null) {
        res.sendStatus(401); //auth error
    } else {
        res.sendStatus(500); //server Error
    }
});

module.exports = router;
