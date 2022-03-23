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
        ///
        res.status(402); //payment required
        res.send(
            "<br><br>Fin moment geats no, obbo wennas zukünftig weita aso ins Haus kemm welt, weartas la a Geld zohl missn.<br><br>LG Manuel"
        );
        ///
        //res.sendStatus(200); //ok
        Email.sendMail(
            "RaspberryPi Door-Service",
            `${username} just opened the Door!`,
            true
        );
    } else if (response != null) {
        res.sendStatus(401); //auth error
    } else {
        res.sendStatus(500); //server Error
    }
});

module.exports = router;
