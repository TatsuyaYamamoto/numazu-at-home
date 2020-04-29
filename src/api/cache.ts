import express from "express";
import fetch from "node-fetch";
import { firestore } from "firebase-admin";
import { JSDOM } from "jsdom";

import config from "../config.functions";

const router = express.Router();

/**
 * https://developers.facebook.com/docs/instagram-api/reference/hashtag/recent-media
 */
interface IGHashtagRecentMedia {
  caption: string; //
  children: string; // (only returned for Album IG Media)
  comments_count: string; //
  id: string; //
  like_count: string; //
  media_type: string; //
  media_url: string; // (not returned for Album IG Media)
  permalink: string; //
}

interface IGPaging {
  cursors?: {
    after?: string;
  };
  next?: string;
}

interface IGSharedData {
  id: string;
  shortcode: string;
  display_url: string;
  is_video: boolean;
  taken_at_timestamp: string;
  location: {
    id: string;
    name: string;
  };
  owner: {
    id: string;
    profile_pic_url: string;
    username: string;
    full_name: string;
  };
}

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

    const cachedPostsCol = firestore().collection(`cached_posts`);
    const batch = firestore().batch();

    for (const igMedia of igHashtagRecentMedias) {
      const docRef = cachedPostsCol.doc(`instagram|${igMedia.id}`);
      const doc = await docRef.get();

      if (!doc.exists) {
        console.log(`IGMedia with ID '${igMedia.id}' does not exist`);
        const igSharedData = await parsePermalink(igMedia.permalink);
        console.log(
          `IGMedia's sharedData is parsed. permalink: ${igMedia.permalink}`
        );

        batch.set(
          docRef,
          {
            id: igMedia.id,
            source: "instagram",
            deleted: false,
            row_data: {
              ...igMedia,
              ...igSharedData,
            },
          },
          {}
        );
      } else {
        console.log(`IGMedia with ID '${igMedia.id}' is found.`);
      }
    }
    await batch.commit();

    res.json({
      ok: true,
      igHashtagRecentMediasSize,
    });
  })().catch(next);
});

export default router;
