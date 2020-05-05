import express from "express";
import { firestore } from "firebase-admin";
import fetch from "node-fetch";

import { PostDocument } from "../../share/models/Post";
import config from "../../config";

export type PostColRef = firestore.CollectionReference<PostDocument>;

const router = express.Router();

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  const postColRef = firestore().collection("posts") as PostColRef;

  (async () => {
    const docSnap = await postColRef.doc(id).get();
    const doc = docSnap.data();

    if (doc) {
      const imageUrl = doc.mediaUrls[0];

      const fetchRes = await fetch(imageUrl, { redirect: "follow" });
      const arrayBuffer = await fetchRes.arrayBuffer();

      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end(toBuffer(arrayBuffer));
      return;
    } else {
      res.redirect(301, config.defaultOgpImageUrl);
      return;
    }
  })().catch(next);
});

// https://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
function toBuffer(ab: ArrayBuffer) {
  var buf = Buffer.alloc(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

export default router;
