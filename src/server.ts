import cookie from "cookie";
import express, { Request, Response } from "express";
import * as core from "express-serve-static-core";
import { cpSync } from "fs";
import { Db, ObjectId } from "mongodb";
import fetch from "node-fetch";
import nunjucks from "nunjucks";
import { platform } from "os";
import { isIfStatement } from "typescript";

const jwksUrl = new URL(`${process.env.AUTH0_JSON_WEB_KEY_SET}`);

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

        const myPlatform0 = data.filter((element) => {
          return (
            element.platform.name ===
            allPlatformsNameUnique[0].replace("%20", " ")
          );
        });

        const myPlatform1 = data
          .filter((element) => {
            return (
              element.platform.name ===
              allPlatformsNameUnique[1].replace("%20", " ")
            );
          })
          .slice(2);

        const myPlatform2 = data
          .filter((element) => {
            return (
              element.platform.name ===
              allPlatformsNameUnique[2].replace("%20", " ")
            );
          })
          .slice(4);

        const myPlatform3 = data
          .filter((element) => {
            return (
              element.platform.name ===
              allPlatformsNameUnique[3].replace("%20", " ")
            );
          })
          .slice(4);

        const myPlatform4 = data
          .filter((element) => {
            return (
              element.platform.name ===
              allPlatformsNameUnique[4].replace("%20", " ")
            );
          })
          .slice(4);

        const myPlatform5 = data
          .filter((element) => {
            return (
              element.platform.name ===
              allPlatformsNameUnique[5].replace("%20", " ")
            );
          })
          .slice(4);

        const myPlatform6 = data
          .filter((element) => {
            return (
              element.platform.name ===
              allPlatformsNameUnique[6].replace("%20", " ")
            );
          })
          .slice(4);

        const myPlatform7 = data
          .filter((element) => {
            return (
              element.platform.name ===
              allPlatformsNameUnique[7].replace("%20", " ")
            );
          })
          .slice(4);

        const myPlatform8 = data
          .filter((element) => {
            return (
              element.platform.name ===
              allPlatformsNameUnique[8].replace("%20", " ")
            );
          })
          .slice(4);

        const myPlatform9 = data
          .filter((element) => {
            return (
              element.platform.name ===
              allPlatformsNameUnique[9].replace("%20", " ")
            );
          })
          .slice(4);

        response.render("index", {
          myPlatform1,
          myPlatform0,
          myPlatform2,
          myPlatform3,
          myPlatform4,
          myPlatform5,
          myPlatform6,
          myPlatform7,
          myPlatform8,
          myPlatform9,
          allPlatformsNameUnique,
          nameGames,
          urlPlatformsUnique,
        });
      });
  });

  app.get("/callback", async (request: Request, response: Response) => {
    const queryCode = request.query.code;
    const dataToken = await fetch(`${process.env.AUTH0_TOKEN}`, {
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=authorization_code&client_id=${process.env.AUTH0_CLIENT_ID}&client_secret=${process.env.AUTH0_CLIENT_SECRET}&code=${queryCode}&redirect_uri=${process.env.AUTH0_HEROKU_HOST}`,
    })
      .then((data) => data.json())
      .then((token) => token);

    const access_token = dataToken.access_token;
    const id_token = dataToken.id_token;

    response.setHeader("Set-Cookie", [
      cookie.serialize("AccessToken", access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 60 * 60,
        sameSite: "strict",
        path: "/",
      }),
      cookie.serialize("IdToken", id_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 60 * 60,
        sameSite: "strict",
        path: "/",
      }),
    ]);

    response.redirect("/home");
  });
  /// Login
  app.get("/login", (request, response) => {
    const url = `${process.env.AUTH0_DOMAIN}/authorize?client_id=${process.env.AUTH0_CLIENT_ID}&response_type=code&redirect_uri=${process.env.AUTHO_HEROKU_REDIRECT}&audience=${process.env.AUTH0_AUDIENCE}&scope=${process.env.AUTH0_SCOPES}`;
    response.redirect(url);
  });
  /// Private(Control si il y a un bien une connexion/inscription et que le token/cookie est bien présent)
  app.get(`/private`, async (request: Request, response: Response) => {
    async function userSession(request: Request): Promise<boolean> {
      const token = cookie.parse(request.headers.cookie || "")[
        "AccessToken" || "IdToken"
      ];
      try {
        if (!token) {
          return false;
        }
        return true;
      } catch (error) {
        return false;
      }
    }
    const isLogged: boolean = await userSession(request);
    if (!isLogged) {
      response.redirect("/");
      return;
    }
    response.redirect("/account");
  });
  app.get(`/account`, async (request: Request, response: Response) => {
    const token = cookie.parse(request.headers.cookie || "");
    const TokenAccess = token.AccessToken;
    fetch(`${process.env.AUTH0_DOMAIN}/userinfo`, {
      method: "Post",
      headers: {
        Authorization: `Bearer ${TokenAccess}`,
      },
    })
      .then((datajson) => datajson.json())
      .then((data) => {
        const name = data.name;
        const nickname = data.nickname;
        const picture = data.picture;
        response.render("account", { name, nickname, picture });
      });
  });
  app.get(
    "/panier",
    formParser,
    async (request: Request, response: Response) => {
      const routeParameters = request.query;
      const idPanier = Object.keys(routeParameters).reverse();
      const idPanierIndex = idPanier[0];
      response.setHeader(
        "Set-Cookie",
        cookie.serialize("Panier", idPanierIndex, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== "development",
          maxAge: 60 * 60,
          sameSite: "strict",
          path: "/",
        })
      );
      type Game = {
        name: string;
        platform: string;
        cover: string;
        url: string;
      };
      const idObject = new ObjectId(idPanierIndex);
      const url = await db.collection<Game>("games").findOne({ _id: idObject });
      const name = url?.name;
      const platform = url?.platform;
      const cover = url?.cover;
      response.render("account", { name, platform, cover });
    }
  );

  /// Logout + Destruction du cookie
  app.get("/logout", (request, response) => {
    const url = `${process.env.AUTH0_DOMAIN}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${process.env.AUTH0_HEROKU_HOST}`;
    response.setHeader("Set-Cookie", [
      cookie.serialize("AccessToken", "deleted", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 0,
        path: "/",
      }),
      cookie.serialize("IdToken", "deleted", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 0,
        path: "/",
      }),
      cookie.serialize("Panier", "deleted", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 0,
        path: "/",
      }),
    ]);

    response.redirect(url);
  });
  app.post("/search", formParser, async (request, response) => {
    const routeParameters = request.body.Search;
    const gameDetails = [];
    const routeParametersFormated: string = routeParameters
      .split("!")
      .join("")
      .split(":")
      .join("")
      .split("&")
      .join("")
      .split(".")
      .join("")
      .split("'")
      .join("")
      .split("  ")
      .join(" ")
      .split(" ")
      .join("-");

    const dataBase = await db
      .collection("games")
      .findOne({ slug: routeParametersFormated.toLowerCase() });
    gameDetails.push(dataBase);

    response.render("gamedetails", { gameDetails });
  });

  /// games list by platform
  app.get("/:id", (request: Request, response: Response) => {
    db.collection("games")
      .find()
      .toArray()
      .then((data) => {
        const id = request.params.id;
        const myPlatform = data.filter((element) => {
          return element.platform.name === id.replace("%20", " ");
        });

        db.collection("games")
          .find()
          .toArray()
          .then((data) => {
            const nameGames = data.map((element) => element.name);
            const allPlatforms = data.map((element) => element.platform);
            const allPlatformsName = allPlatforms.map(
              (element) => element.name
            );
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

            const myPlatform0 = data.filter((element) => {
              return (
                element.platform.name ===
                allPlatformsNameUnique[0].replace("%20", " ")
              );
            });
            response.render("gamesbyplatforms", {
              myPlatform,
              urlPlatformsUnique,
              allPlatformsNameUnique,
            });
          });
      });
  });

  /// game details
  app.get("/:id/:slug", (request: Request, response: Response) => {
    const routeParameters = request.params.slug;

    db.collection("games")
      .find()
      .toArray()
      .then((details) => {
        const slugSelected = request.params.slug;
        const gameDetails = details.filter((element) => {
          return element.slug === slugSelected;
        });
        db.collection("games")
          .find()
          .toArray()
          .then((data) => {
            const nameGames = data.map((element) => element.name);
            const allPlatforms = data.map((element) => element.platform);
            const allPlatformsName = allPlatforms.map(
              (element) => element.name
            );
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
            response.render("gamedetails", {
              gameDetails,
              allPlatformsNameUnique,
              urlPlatformsUnique,
            });
          });
      });
  });

  return app;
}
