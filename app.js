const express = require("express");
const exphbs = require("express-handlebars");
const dotenv = require("dotenv");
const path = require("path");
const socket = require("socket.io");
const http = require("http");
const https = require("https");
const fs = require("fs");
const subdomain = require("express-subdomain");
const cors = require("cors");
const robots = require('robots.txt')

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

app.use(cors());

//Routes
app.use("/", require("./routes/home"));
app.use("/controller", require("./routes/controller"));
app.use("/contact", require("./routes/contact"));
app.use("/about", require("./routes/about"));
app.use("/register", require("./routes/register"));
app.use("/projects", require("./routes/projects"));
app.use("/api", require("./routes/api"));
app.use(subdomain("pathfinder", require("./routes/pathfinder")));
app.use(subdomain("monopoly", require("./routes/monopoly")));
app.use(subdomain("lambdaCalculus", require("./routes/lambdaCalculus")));

app.use(robots(__dirname + '/robots.txt'))

//Default
app.get("/*", function (req, res) {
    res.render("error/pageNotFound", { layout: "error" });
});

//Create Servers
const serverHTTP = http.createServer(app);
const ioHTTP = socket(serverHTTP);

//Start IO
const IOHTTP = new HandleIO(ioHTTP);
IOHTTP.handleEvents();

//Ports
var HTTP_PORT =
    process.env.NODE_ENV == "developement"
        ? process.env.HTTP_DEV_PORT
        : process.env.HTTP_PORT;

//Run Servers

serverHTTP.listen(
    HTTP_PORT,
    console.log(
        `HTTP_Server running in ${process.env.NODE_ENV} mode on http://localhost:${HTTP_PORT}`
    )
);
