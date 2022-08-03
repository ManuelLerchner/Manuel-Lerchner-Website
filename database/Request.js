const mongoose = require("mongoose");

const RequestSchema = mongoose.Schema({
    ip: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    triesLeft: {
        type: Number,
        default: 3 - 1,
    },
    notifiedAdmin: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("requests", RequestSchema);
