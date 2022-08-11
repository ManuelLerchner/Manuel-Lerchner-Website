var mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
    console.log("Connection to MongoDB established");
});

mongoose.connection.on("error", (err) => {
    console.error(err);
});
