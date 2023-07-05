import winston from "winston";
import { format } from "logform";

const logFormat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.align(),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

export default winston.createLogger({
  level: "info",
  format: logFormat,
  defaultMeta: { service: "Greenhouse" },
  transports: [new winston.transports.Console()],
});
