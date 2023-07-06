import express, { Response, Request } from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import logger, { expressLogger } from "./logger";
import { eventRoutes } from "./routes/event";
import { userRoutes } from "./routes/user";
import { version } from "../package.json";

const PORT = process.env.PORT ?? 6433;
const app = express();

// Request logging
app.use(
  morgan("tiny", {
    stream: {
      write: (message) => expressLogger.http(message.trim()),
    },
  })
);

// Enable cors
const corsMiddleware = cors({ origin: true, credentials: true });
app.use(corsMiddleware);
app.options("*", corsMiddleware);

// JSON body middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: "*/*" }));
app.use(bodyParser.text());

// Default route
app.get("/", (req: Request, res: Response) => {
  res.status(200).send(`Greenhouse Server: ${version}`);
});

// Routes
eventRoutes(app);
userRoutes(app);

// Start server
try {
  app.listen(PORT, (): void => {
    logger.info(`🚀 Greenhouse ingestion server running on port ${PORT}`);
  });
} catch (error: any) {
  logger.error(error.message);
}
