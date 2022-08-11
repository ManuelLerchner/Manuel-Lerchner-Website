const winston = require("winston");

winston.add(
    new winston.transports.File({
        filename: "./logs/logfile.txt",
        format: winston.format.combine(
            winston.format.timestamp({
                format: "YYYY-MM-DD hh:mm:ss"
            }),
            winston.format.printf(i => `${i.timestamp} | ${i.level} | ${i.message}`)
        )
    })
);

winston.add(
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({
                format: "YYYY-MM-DD hh:mm:ss"
            }),
            winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
        )
    })
)

console.error = winston.error;
console.log = winston.info;
console.info = winston.info;
console.debug = winston.debug;
console.warn = winston.warn;
