const express = require("express");
const exphbs = require("express-handlebars");
const dotenv = require("dotenv");
const path = require("path");
const socket = require("socket.io");
const http = require("http");
const https = require("https");
const fs = require("fs");

//Config
dotenv.config({ path: "./config/config.env" });

//Log to File
if (process.env.NODE_ENV == "production") {
    require("./ServerFunctions/Logger.js");
}

const HandleIO = require("./ServerFunctions/HandleIO.js");

//Connect DB
require("./database/db");

//Create Express App
const app = express();

//Static
app.use(express.static(path.join(__dirname, "public")));

//bodyParser
app.use(express.urlencoded({ extended: false }));

//Handlebar
app.set("view engine", "hbs");
app.engine(
    "hbs",
    exphbs({
        defaultLayout: "main",
        extname: "hbs",
    })
);

//Routes
app.use("/", require("./routes/home"));
app.use("/controller", require("./routes/controller"));
app.use("/contact", require("./routes/contact"));
app.use("/about", require("./routes/about"));
app.use("/register", require("./routes/register"));
app.use("/projects", require("./routes/projects"));
app.use("/api", require("./routes/api"));

//Default
app.get("/*", function (req, res) {
    res.render("error/pageNotFound", { layout: "error" });
});

//Load HTTPS Certificates
const httpsOptions = {
    key: fs.readFileSync("./config/key.pem"),
    cert: fs.readFileSync("./config/cert.pem")
};

//Create Servers
const serverHTTP = http.createServer(app);
const serverHTTPS = https.createServer(httpsOptions, app);
const ioHTTP = socket(serverHTTP);
const ioHTTPS = socket(serverHTTPS);

//Start IO
const IOHTTP = new HandleIO(ioHTTP);
const IOHTTPS = new HandleIO(ioHTTPS);
IOHTTP.handleEvents();
IOHTTPS.handleEvents();

//Ports
var [HTTP_PORT, HTTPS_PORT] =
    process.env.NODE_ENV == "developement"
        ? [process.env.HTTP_DEV_PORT, process.env.HTTPS_DEV_PORT]
        : [process.env.HTTP_PORT, process.env.HTTPS_PORT];

//Run Servers
serverHTTP.listen(
    HTTP_PORT,
    console.log(
        `HTTP_Server running in ${process.env.NODE_ENV} mode on http://localhost:${HTTP_PORT}`
    )
);

serverHTTPS.listen(
    HTTPS_PORT,
    console.log(
        `HTTPS_Server running in ${process.env.NODE_ENV} mode on https://localhost:${HTTPS_PORT}`
    )
);
