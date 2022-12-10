const express = require("express");
const router = express.Router();

const Authentification = require("../ServerFunctions/HandleAuthentification.js");
const RelayGPIO = require("../ServerFunctions/HandleGPIO.js");
const HandleSession = require("../ServerFunctions/HandleSession.js");
const Email = require("../ServerFunctions/HandleEMail.js");

const Auth = new Authentification();
const Relay = new RelayGPIO();
const Sessions = new HandleSession();

//  Post /api/relay
router.post("/relay", async (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    let [succ, msg] = await Sessions.checkIfTooManyRequests(ip);

    if (!succ) {
        res.status(400).send(msg);
        return;
    }

    try {
        username = req.body.username;
        password = req.body.password;
    } catch (err) {
        res.sendStatus(400); //Bad parameters;
    }

    if (!username || !password) {
        res.sendStatus(400); //Bad parameters;
        return;
    }

    var [success, response] = await Auth.login({ username, password });

    if (success) {
        Relay.activateRelay(process.env.RELAY_ON_TIME);
        ///
        ///res.status(402); //payment required
        // res.send(
        //     "<br><br>Fin moment geats no, obbo wennas zukünftig weita aso ins Haus kemm welt, weartas la a Geld zohl missn.<br><br>LG Manuel"
        // );
        ///
        res.sendStatus(200); //ok
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

router.get("/relay", (req, res) => {
    res.send("Make a POST request to /api/relay");
});

router.post("/notify_admin", (req, res) => {
    try {
        username = req.body.username;
        message = req.body.message;
    } catch (err) {
        res.sendStatus(400); //Bad parameters;
    }

    if (!username || !message) {
        res.sendStatus(400); //Bad parameters;
        return;
    }


    Email.sendMail(
        username,
        message,
        false
    );

    res.sendStatus(200);
})

module.exports = router;
