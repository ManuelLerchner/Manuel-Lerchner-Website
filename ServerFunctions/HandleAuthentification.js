const User = require("../database/User");

const Email = require("./HandleEMail.js");
const mongoose = require('mongoose');

class Authentification {
    async login(data) {
        let { username, password } = data;

        if (mongoose.connection.readyState != 1) {
            console.log(`Login of ${username} failed: Mongoose Connection Error`)
            return [false, "Internal Server Error"];
        }

        let UserInDB = await User.findOne({ username: username.toString() });

        if (UserInDB === null) {
            console.log(`Login attempt for ${username} failed: User not found`)
            return [false, "Wrong Username or Password"];
        }

        let validPassword = await UserInDB.validPassword(password);

        if (!validPassword) {
            console.log(`Login attempt for ${username} failed: Wrong Password`)
            return [false, "Wrong Username or Password"];
        }

        if (!UserInDB.activated == true) {
            return [false, "User not accepted yet"];
        }

        //Login succesfull
        console.log(`User: ${username} succesfully logged in`);
        return [true, "Succesfully authenticated"];
    }

    async register(data) {
        let { username, email, password1, password2 } = data;

        if (mongoose.connection.readyState != 1) {
            console.log(`Registration of ${username} failed: Mongoose Connection Error`)
            return [false, "Internal Server Error"];
        }

        let inputIsValid =
            username != "" && email != "" && password1 != "" && password2 != "";

        let passwordsEqual = password1 === password2;

        if (!inputIsValid) {
            return [false, "Error"];
        }

        if (!passwordsEqual) {
            return [false, "Passwords don't match"];
        }

        if (await User.findOne({ email: email.toString() })) {
            return [false, "Email already registered"];
        }

        if (await User.findOne({ username: username.toString() })) {
            return [false, "Username already registered"];
        }

        //Create new User
        let newUser = new User();
        newUser.username = username;
        newUser.email = email;
        newUser.setPassword(password1);

        await newUser.save();
        Email.sendMail(
            "RaspberryPi Authentification-Service",
            `${username} / ${email} just registered`
        );
        console.log(`User: ${username} / ${email} succesfully registered`);
        return [true, "Account registered"];
    }
}

module.exports = Authentification;
