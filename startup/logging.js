const winston = require("winston");
const { atlasUri } = require("../startup/config").dbConfig();
require("winston-mongodb");
require("express-async-errors");

module.exports = function () {
  // catch an uncaughtException in a file and a database
  winston.exceptions.handle(
    new winston.transports.MongoDB({
      db: atlasUri,
      level: "info",
      options: { useUnifiedTopology: true },
      collection: "logs",
    }),
    new winston.transports.File({ filename: "uncaughtExceptions.log" }),
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );

  // catch an unhandled rejection
  process.on("unhandledRejection", (ex) => {
    throw ex;
  });

  // use a log file and a database to log errors.
  winston.add(new winston.transports.File({ filename: "logfile.log" }));
  winston.add(
    new winston.transports.MongoDB({
      db: atlasUri,
      level: "info",
      options: { useUnifiedTopology: true },
      collection: "logs",
    })
  );
  //  Use Console logging in development mode only
  if (process.env.NODE_ENV == "development") {
    winston.add(
      new winston.transports.Console({
        level: "info",
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      })
    );
  }
};
