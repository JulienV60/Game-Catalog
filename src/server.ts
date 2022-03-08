import express, { Request, Response } from "express";
import * as core from "express-serve-static-core";
import { Db } from "mongodb";
import nunjucks from "nunjucks";

export function makeApp(db: Db): core.Express {
  const app = express();
  nunjucks.configure("views", {
    autoescape: true,
    express: app,
  });
  app.set("view engine", "njk");
  app.get("/", (request: Request, response: Response) => {
    db.collection("games")
      .find()
      .toArray()
      .then((data) => {
        const nameGames = data.map((element) => element.name);
        console.log(data);
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
        console.log(allPlatformsNameUnique);
        response.render("index", {
          allPlatformsNameUnique,
          nameGames,
          urlPlatformsUnique,
        });
      });
  });

  app.get("/:id", (request: Request, response: Response) => {

    db.collection("games")
      .find()
      .toArray()
      .then((data) => {
        const id = request.params.id;
        const myPlatform = data.filter((element) => {
           return element.platform.name === id.replace('%20', ' ');
        });
        console.log(myPlatform)

        response.render("gamesbyplatforms",{myPlatform})

      })
    })


  app.get("/:id/:gamedetails", (request: Request, response: Response) => {
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

