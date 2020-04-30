import express from "express";
import fetch from "node-fetch";
import { firestore } from "firebase-admin";
import { JSDOM } from "jsdom";

import config from "../config.functions";
import {
  IGHashtagRecentMedia,
  IGPaging,
  IGSharedData,
} from "../share/models/IG";
import PostDocument from "../share/models/Post";
import UserDocument from "../share/models/User";

type UserColRef = firestore.CollectionReference<UserDocument>;
type PostColRef = firestore.CollectionReference<PostDocument>;

const router = express.Router();

const searchMediasByHashtag = async (): Promise<IGHashtagRecentMedia[]> => {
  const instagramBusinessAccountId = "17841412231763694";
  const hashTagId = `17870480920696380`;
  const accessToken = config.instagram_graph_api.access_token;
  const fields: string = ["id", "caption", "permalink"].join(",");

  const recentMediaUrl = `https://graph.facebook.com/v6.0/${hashTagId}/recent_media?fields=${fields}&user_id=${instagramBusinessAccountId}&access_token=${accessToken}`;
  const medias: IGHashtagRecentMedia[] = [];

  const callApi = async (url: string) => {
    const res = await fetch(url);

    if (res.ok) {
      const json: {
        data: IGHashtagRecentMedia[];
        paging?: IGPaging;
      } = await res.json();
      medias.push(...json.data);

      const nextUrl = json?.paging?.next;
      if (nextUrl) {
        await callApi(nextUrl);
      }
    } else {
      const json = await res.json();
      throw new Error(JSON.stringify(json));
    }
  };

  await callApi(recentMediaUrl);

  return medias;
};

const parsePermalink = async (permalink: string): Promise<IGSharedData> => {
  const res = await fetch(permalink, { redirect: "follow" });

  if (!res.ok) {
    throw new Error("");
  }

  const body = await res.text();
  const dom = new JSDOM(body);
  const matches = dom.window.document.querySelectorAll("script");

  const sharedDataScript = Array.from(matches).find((match) => {
    return match.text.trim().startsWith("window._sharedData");
  });

  if (!sharedDataScript) {
    throw new Error("script tag including 'window._sharedData' was not found.");
  }

  const openingBraceIndex = sharedDataScript.text.indexOf("{");
  const closingBraceIndex = sharedDataScript.text.lastIndexOf("}");
  const sharedDataJsonText = sharedDataScript.text.substring(
    openingBraceIndex,
    closingBraceIndex + 1
  );

  try {
    return JSON.parse(sharedDataJsonText) as IGSharedData;
  } catch (e) {
    console.error(
      "json parse error. parse target text => ",
      sharedDataJsonText
    );
    throw e;
  }
};

router.post("/instagram", (_, res, next) => {
  (async () => {
    const igHashtagRecentMedias = await searchMediasByHashtag();
    const igHashtagRecentMediasSize = igHashtagRecentMedias.length;

    console.log(`igHashtagRecentMedias size: ${igHashtagRecentMediasSize}`);

    const postCol = firestore().collection(`posts`) as PostColRef;
    const userCol = firestore().collection(`users`) as UserColRef;
    const batch = firestore().batch();

    for (const igMedia of igHashtagRecentMedias) {
      const provider = "instagram";
      const originalPostId = igMedia.id;
      const postId = `${provider}|${originalPostId}`;

      const postDocRef = postCol.doc(`instagram|${igMedia.id}`);
      const postDoc = await postDocRef.get();

      if (postDoc.exists) {
        console.log(`IGMedia with ID '${igMedia.id}' is found.`);
        continue;
      }

      console.log(`IGMedia with ID '${igMedia.id}' does not exist`);
      const igSharedData = await parsePermalink(igMedia.permalink);
      const igShortcodeMedia =
        igSharedData.entry_data.PostPage[0].graphql.shortcode_media;
      console.log(
        `IGMedia's sharedData is parsed. permalink: ${igMedia.permalink}`
      );

      const {
        id: authorId,
        full_name,
        profile_pic_url,
        username,
      } = igShortcodeMedia.owner;
      const timestamp = new Date(igShortcodeMedia.taken_at_timestamp);
      const originalUserId = authorId;
      const userId = `${provider}|${originalUserId}`;

      const userDocRef = userCol.doc(userId);
      const userDoc = await postDocRef.get();

      if (!userDoc.exists) {
        const newUserDoc: UserDocument = {
          id: userId,
          originalId: originalUserId,
          provider: "instagram",
          displayName: full_name,
          useName: username,
          profileImageUrl: profile_pic_url,
          createdAt: firestore.FieldValue.serverTimestamp(),
        };
        batch.set(userDocRef, newUserDoc, {});
      }

      const newPostDoc: PostDocument = {
        id: postId,
        originalId: originalPostId,
        provider,
        author: userDocRef,
        text: igMedia.caption,
        timestamp: firestore.Timestamp.fromDate(timestamp),
        mediaType: igMedia.media_type === "VIDEO" ? "video" : "image",
        mediaUrls: igMedia.children
          ? igMedia.children.map(({ permalink }) => `${permalink}media`)
          : [`${igMedia.permalink}media`],
        deleted: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      batch.set(postDocRef, newPostDoc, {});
    }
    await batch.commit();

    res.json({
      ok: true,
      igHashtagRecentMediasSize,
    });
  })().catch(next);
});

export default router;
