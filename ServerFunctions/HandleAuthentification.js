const User = require("../database/User");

const Email = require("./HandleEMail.js");

class Authentification {
    async login(data) {
        let { username, password } = data;

        let UserInDB = await User.findOne({ username: username });

        if (UserInDB === null) {
            return [false, "Unknown Username"];
        }

        let validPassword = await UserInDB.validPassword(password);

        if (!validPassword) {
            return [false, "Wrong Username or Password"];
        }

        if (!UserInDB.activated == true) {
            return [false, "User not accepted yet"];
        }

        //Login succesfull
        return [true, "Succesfully authenticated"];
    }

    async register(data) {
        let { username, email, password1, password2 } = data;

        let inputIsValid =
            username != "" && email != "" && password1 != "" && password2 != "";

        let passwordsEqual = password1 === password2;

        if (!inputIsValid) {
            return [false, "Error"];
        }

        if (!passwordsEqual) {
            return [false, "Passwords don't match"];
        }

        if (await User.findOne({ email: email })) {
            return [false, "Email already registered"];
        }

        if (await User.findOne({ username: username })) {
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
        return [true, "Account registered"];
    }
}

module.exports = Authentification;
