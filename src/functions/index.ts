import {https} from 'firebase-functions';

import next from "next";

// https://blog.katsubemakito.net/firebase/functions-environmentvariable
const isUnderFirebaseFunction =
  process.env.PWD && process.env.PWD.startsWith("/srv");

const nextServer = next({
  dir: isUnderFirebaseFunction
    ? // default value
    "."
    : // firebase deployのときにlocalでfunctionを実行する(確認: "firebase-tools": "^7.14.0")が、nextの実装を読み込むルートパスがproject rootなのでエラーが発生する。
      // local実行時のみ、ビルド済みnext dirの相対パスを教える。
      // Error: Could not find a valid build in the '/Users/fx30328/workspace/projects/sokontokoro/apps/dl-code_web_app/next' directory! Try building your app with 'next build' before starting the server.
    "dist/functions",

  conf: { distDir: "next" }
});

const handle = nextServer.getRequestHandler();

export const nextApp = https.onRequest((req, res) => {
  // @ts-ignore
  return nextServer.prepare().then(() => handle(req, res));
});

export const api = https.onRequest((_, res) => {
  // TODO
  // @ts-ignore
  res.json({
    message: "api!"
  });
});
