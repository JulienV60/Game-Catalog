import express, { Request, Response } from "express";
import * as core from "express-serve-static-core";
import { Db } from "mongodb";
import nunjucks from "nunjucks";
import fetch from "node-fetch";
export function makeApp(db: Db): core.Express {
  const app = express();
  app.use(express.static("Public"));
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
  app.post("/inscription", formParser, (request, response) => {
    const routeParameters = request.body;
    const info = routeParameters.username;
    response.render("inscription");
  });
  app.get("/login", (request, response) => {
    fetch(`https://${process.env.AUTH0_DOMAIN}/authorize`).then((data) =>
      data.json().then((text) => console.log(text))
    );
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
