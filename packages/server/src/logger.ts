import winston from "winston";

const LOGGING_FORMAT = process.env.LOGGING_FORMAT;

const { combine, timestamp, printf, colorize, json } = winston.format;

const logFormat =
  LOGGING_FORMAT === "pretty"
    ? combine(
        winston.format((info) => {
          info.level = info.level.toUpperCase();
          return info;
        })(),
        colorize({ colors: { info: "cyan" } }),
        timestamp({
          format: "HH:mm:ss",
        }),
        printf((info) => `[${info.level}]\t(${info.timestamp}) ${info.message}`)
      )
    : LOGGING_FORMAT === "json"
    ? combine(timestamp(), json())
    : combine(
        winston.format((info) => {
          info.level = info.level.toUpperCase();
          return info;
        })(),
        timestamp(),
        printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
      );

/**
 * Default logger
 */
export default winston.createLogger({
  level: "info",
  format: logFormat,
  defaultMeta: { service: "Greenhouse" },
  transports: [new winston.transports.Console()],
});

/**
 * Express request logger
 */
export const expressLogger = winston.createLogger({
  level: "http",
  format: logFormat,
  transports: [new winston.transports.Console()],
});
