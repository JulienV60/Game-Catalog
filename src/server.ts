import express, { Request, Response } from "express";
import * as core from "express-serve-static-core";
import { Db } from "mongodb";
import nunjucks from "nunjucks";
import fetch from "node-fetch";
import cookie from "cookie";
import jose from "jose";

export function makeApp(db: Db): core.Express {
  const app = express();
  app.use(express.static("Public"));
  nunjucks.configure("views", {
    autoescape: true,
    express: app,
  });
  const formParser = express.urlencoded({ extended: true });
  app.set("view engine", "njk");

  ///Départ serveur vers home
  app.get("/", (request: Request, response: Response) => {
    response.redirect("/home");
  });

  /// Home vers index
  app.get("/home", async (request: Request, response: Response) => {
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

  app.post("/callback", async (request: Request, response: Response) => {
    const queryCode = request.query.code;
    const url = `${process.env.AUTH0_TOKEN}?grant_type=authorization_code&client_id=${process.env.AUTH0_CLIENT_ID}&client_secret=${process.env.AUTH0_CLIENT_SECRET}&code=${queryCode}&redirect_uri=http://localhost:3000/home`;

    response.setHeader(
      "Set-Cookie",
      cookie.serialize("token", ``, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 60 * 60,
        sameSite: "strict",
        path: "/",
      })
    );
  });

  /// Login
  app.get("/login", (request, response) => {
    const url = `${process.env.AUTH0_DOMAIN}/authorize?client_id=${process.env.AUTH0_CLIENT_ID}&response_type=code&redirect_uri=${process.env.AUTH0_REDIRECTURI}`;
    response.redirect(url);
  });

  app.get(`/account`, async (request: Request, response: Response) => {
    const routeParameters = request.params;
    console.log(routeParameters);
  });

  /// Logout
  app.get("/logout", (request, response) => {
    const url = `${process.env.AUTH0_DOMAIN}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=http://localhost:3000`;
    response.redirect(url);
  });

  app.get("/:id", (request: Request, response: Response) => {
    db.collection("games")
      .find()
      .toArray()
      .then((data) => {
        const id = request.params.id;
        const myPlatform = data.filter((element) => {
          return element.platform.name === id.replace("%20", " ");
        });

        response.render("gamesbyplatforms", { myPlatform });
      });
  });

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
