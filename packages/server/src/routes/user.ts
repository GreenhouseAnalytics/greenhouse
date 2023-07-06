import { Express, Request, Response } from "express";
import logger from "../logger";
import { UserService } from "../services/UserService";

type AliasBody = {
  user: string;
  alias: string;
};

type SetUserProperties = {
  user: string;
  properties: Record<string, string | number | boolean>;
};

type IncrementProperty = {
  user: string;
  property: string;
};

export const userRoutes = (app: Express) => {
  app.post(
    "/users/alias",
    async (req: Request<object, AliasBody>, res: Response) => {
      try {
        const { user, alias } = req.body;
        await UserService.alias(user, alias);
        res.status(200).send();
      } catch (error) {
        logger.error(error);
        return res.status(500).send();
      }
    }
  );

  app.post(
    "/users/properties/set",
    async (req: Request<object, SetUserProperties>, res: Response) => {
      try {
        const { user, properties } = req.body;
        await UserService.setProperties(user, properties, "normal");
        res.status(200).send();
      } catch (error) {
        logger.error(error);
        return res.status(500).send();
      }
    }
  );

  app.post(
    "/users/properties/once",
    async (req: Request<object, SetUserProperties>, res: Response) => {
      try {
        const { user, properties } = req.body;
        await UserService.setProperties(user, properties, "once");
        res.status(200).send();
      } catch (error) {
        logger.error(error);
        return res.status(500).send();
      }
    }
  );

  app.post(
    "/users/properties/increment",
    async (req: Request<object, IncrementProperty>, res: Response) => {
      try {
        const { user, property } = req.body;
        await UserService.incrementProperty(user, property);
        res.status(200).send();
      } catch (error) {
        logger.error(error);
        return res.status(500).send();
      }
    }
  );
};
