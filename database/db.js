var mongoose = require("mongoose");

// Only connect to MongoDB if MONGO_URI is provided
if (process.env.MONGO_URI) {
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
} else {
    console.log("MongoDB not configured - database functionality will be disabled");
}
