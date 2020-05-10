import { credential, initializeApp, AppOptions } from "firebase-admin";

const firebaseAppOptions: AppOptions = process.env.FUNCTIONS_EMULATOR
  ? {
      credential: credential.applicationDefault(),
      databaseURL: "https://numazu-at-home-dev.firebaseio.com",
    }
  : {};

initializeApp(firebaseAppOptions);

import { https, firestore, pubsub } from "firebase-functions";

import express from "express";
import morgan from "morgan";

import commandRouter from "./functions/api/command";
import ogpRouter from "./functions/api/ogp";
import _onCreateCommend from "./functions/firestore/onCreateCommend";
import _onFetchMediaByScheduler from "./functions/pubsub/onFetchMediaByScheduler";

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

export const onFetchMediaByScheduler_daytime = pubsub
  // 10分おきに
  .schedule("*/10 9-23 * * *")
  .timeZone("Asia/Tokyo")
  .onRun(_onFetchMediaByScheduler);

export const onFetchMediaByScheduler_night = pubsub
  // 1時間おき
  .schedule("0 0-8 * * *")
  .timeZone("Asia/Tokyo")
  .onRun(_onFetchMediaByScheduler);
