var winston = require("winston");

winston.add(
    new winston.transports.File({
        filename: "./logs/logfile.txt",
        format: winston.format.combine(
            winston.format.timestamp({
                format: "YYYY-MM-DD hh:mm:ss"
            }),
            winston.format.json()
        )
    })
);

console.error = winston.error;
console.log = winston.info;
console.info = winston.info;
console.debug = winston.debug;
console.warn = winston.warn;
