import { credential, initializeApp, AppOptions } from "firebase-admin";

const firebaseAppOptions: AppOptions = process.env.FUNCTIONS_EMULATOR
  ? {
      credential: credential.applicationDefault(),
      databaseURL: "https://numazu-at-home-dev.firebaseio.com",
    }
  : {};

initializeApp(firebaseAppOptions);

import { https, firestore } from "firebase-functions";

import next from "next";
import express from "express";
import morgan from "morgan";

import commandRouter from "./functions/api/command";
import ogpRouter from "./functions/api/ogp";
import _onCreateCommend from "./functions/firestore/onCreateCommend";

// https://blog.katsubemakito.net/firebase/functions-environmentvariable
const isUnderFirebaseFunction =
  process.env.PWD && process.env.PWD.startsWith("/srv");

const nextServer = next({
  dir:
    isUnderFirebaseFunction || process.env.FUNCTIONS_EMULATOR
      ? // default value
        "."
      : // firebase deployのときにlocalでfunctionを実行する(確認: "firebase-tools": "^7.14.0")が、nextの実装を読み込むルートパスがproject rootなのでエラーが発生する。
        // local実行時のみ、ビルド済みnext dirの相対パスを教える。
        // Error: Could not find a valid build in the '/Users/fx30328/workspace/projects/sokontokoro/apps/dl-code_web_app/next' directory! Try building your app with 'next build' before starting the server.
        "dist/functions",

  conf: { distDir: "next" },
});

const handle = nextServer.getRequestHandler();

export const nextApp = https.onRequest((req, res) => {
  const { ip, method, path } = req;
  console.log(
    `${ip} [${new Date()}] "${method} ${path}" "${req.get("User-Agent")}"`
  );
  // @ts-ignore
  return nextServer.prepare().then(() => handle(req, res));
});

const expressApp = express();
expressApp.use(morgan("combined"));
expressApp.use("/api/command", commandRouter);
expressApp.use("/api/ogp", ogpRouter);
expressApp.use(
  (
    err: Error,
    _: express.Request,
    res: express.Response,
    __: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json(err);
  }
);

export const api = https.onRequest(expressApp);

export const onCreateCommend = firestore
  .document("commands/{commandId}/data/{dataId}")
  .onCreate(_onCreateCommend);
