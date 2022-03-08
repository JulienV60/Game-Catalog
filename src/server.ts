import express, { Request, Response } from "express";
import * as core from "express-serve-static-core";
import { Db } from "mongodb";
import nunjucks from "nunjucks";
import cookie from "cookie";
import jose from "jose";

export function makeApp(db: Db): core.Express {
  const app = express();
  nunjucks.configure("views", {
    autoescape: true,
    express: app,
  });
  const formParser = express.urlencoded({ extended: true });
  app.set("view engine", "njk");
  app.get("/", (request: Request, response: Response) => {
    db.collection("games")
      .find()
      .toArray()
      .then((data) => {
        const nameGames = data.map((element) => element.name);
        const allPlatforms = data.map((element) => element.platform);
        const allPlatformsName = allPlatforms.map((element) => element.name);
        const allPlatformsNameUnique = allPlatformsName.filter(
          (value, index) => allPlatformsName.indexOf(value) === index
        );
        const urlPlatforms = data.map((element) => element.platform);
        const urlPlatformsdeux = urlPlatforms.map(
          (element) => element.platform_logo_url
        );
        const urlPlatformsUnique = urlPlatformsdeux.filter(
          (value, index) => urlPlatformsdeux.indexOf(value) === index
        );
        response.render("index", {
          allPlatformsNameUnique,
          nameGames,
          urlPlatformsUnique,
        });
      });
  });

  app.get("/gamedetails", (request: Request, response: Response) => {
    db.collection("games")
      .find()
      .toArray()
      .then((details) => {
        const game = details;
        const gameDetails = details.map((element) => element);
        response.render("gamedetails", { game, gameDetails });
      });
  });
  return app;
}
