const express = require("express");
const exphbs = require("express-handlebars");
const http = require("http");
const dotenv = require("dotenv");
const path = require("path");
const socket = require("socket.io");

const HandleIO = require("./HandleIO.js");

dotenv.config({ path: "./config/config.env" });

//Create Servers
const app = express();
const server = http.createServer(app);
const io = socket(server);

//Start IO
const IO = new HandleIO(io);
IO.handleEvents();

//Static
app.use(express.static(path.join(__dirname, "public")));

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

//Run App
PORT = process.env.PORT;
server.listen(
    PORT,
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`
    )
);
