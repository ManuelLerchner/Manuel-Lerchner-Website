const Requests = require("../database/Request");
const MIN_DELTA = 5 * 1000;
const TIMEOUT = 10 * 60 * 1000;

const Email = require("./HandleEMail.js");

class SessionEvents {
    async checkIfTooManyRequests(ip) {
        try {
            let RequestInDB = await Requests.findOne({ ip: ip });

            let date = new Date();

            if (RequestInDB === null) {
                let newRequests = new Requests();
                newRequests.ip = ip;
                newRequests.date = date;
                await newRequests.save();

                return [true, "OK"];
            }

            let difference = date - RequestInDB.date;
            if (difference < MIN_DELTA) {
                return [false, "Too fast requests"];
            }

            if (RequestInDB.triesLeft <= 0) {

                if (!RequestInDB.notifiedAdmin) {
                    Email.sendMail(
                        "Login Warning",
                        "Too many requests from: " + ip + "\n" +
                        "Disabling IP for: " + TIMEOUT / 1000 + " seconds",
                    );
                    await Requests.updateOne(
                        { ip: ip },
                        { $set: { notifiedAdmin: true } }
                    );
                }

                if (difference < TIMEOUT) {
                    return [
                        false,
                        "Try again in " +
                        Math.floor(((TIMEOUT - difference) / 1000 / 60) * 100) / 100 +
                        " minutes",
                    ];
                }

                await Requests.updateOne({ ip: ip }, { $inc: { triesLeft: 1 } });
                return [false, "Try again in 0.00 minute"];
            }

            await Requests.updateOne(
                { $and: [{ triesLeft: { $gt: 0 } }, { ip: ip }] },
                { $inc: { triesLeft: -1 }, date: date }
            );

            RequestInDB = await Requests.findOne({ ip: ip });

            return [true, "OK"];
        } catch (e) {
            console.log(e);
            return [false, "Error"];
        }
    }

    async deleteOldRequest() {
        try {
            let date = new Date();
            let difference = date - MIN_DELTA;

            await Requests.deleteMany({ date: { $lte: difference } });
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = SessionEvents;
