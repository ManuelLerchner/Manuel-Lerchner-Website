const express = require("express");
const exphbs = require("express-handlebars");
const dotenv = require("dotenv");
const path = require("path");
const socket = require("socket.io");
const http = require("http");

const HandleIO = require("./ServerFunctions/HandleIO.js");

//Config
dotenv.config({ path: "./config/config.env" });

//Connect DB
require("./config/db");

//Create Servers
const app = express();
const server = http.createServer(app);
const io = socket(server);

//Start IO
const IO = new HandleIO(io);
IO.handleEvents();

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
        extname: "hbs"
    })
);

//Routes
app.use("/", require("./routes/home"));
app.use("/controller", require("./routes/controller"));
app.use("/contact", require("./routes/contact"));
app.use("/about", require("./routes/about"));
app.use("/register", require("./routes/register"));
app.use("/api", require("./routes/api"));

var PORT =
    process.env.NODE_ENV == "developement"
        ? process.env.DEV_PORT
        : process.env.PORT;

//Run App
server.listen(
    PORT,
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`
    )
);
