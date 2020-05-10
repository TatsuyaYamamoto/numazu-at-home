import { firestore } from "firebase-admin";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";

import { UserDocument } from "../../share/models/User";
import { PostDocument } from "../../share/models/Post";
import {
  IGHashtagRecentMedia,
  IGPaging,
  IGSharedData,
} from "../../share/models/IG";
import config from "../../config.functions";

type UserColRef = firestore.CollectionReference<UserDocument>;
type PostColRef = firestore.CollectionReference<PostDocument>;

const postCol = firestore().collection(`posts`) as PostColRef;
const userCol = firestore().collection(`users`) as UserColRef;

export const createNewDocData = async (
  igMedia: IGHashtagRecentMedia
): Promise<
  | {
      post: PostDocument;
      user: UserDocument;
    }
  | undefined
> => {
  const provider = "instagram";
  const originalPostId = igMedia.id;
  const postId = `${provider}|${originalPostId}`;

  const postDocRef = postCol.doc(postId);
  const postDoc = await postDocRef.get();

  if (postDoc.exists) {
    console.log(
      `IGMedia with ID '${igMedia.id}' is already existing. end function.`
    );
    return;
  }

  const igSharedData = await parsePermalink(igMedia.permalink);
  console.log(
    `SharedData of IGMedia with ID '${igMedia.id}' is parsed. permalink: ${igMedia.permalink}`
  );

  const igShortcodeMedia =
    igSharedData.entry_data.PostPage[0].graphql.shortcode_media;
  const {
    id: authorId,
    full_name,
    profile_pic_url,
    username,
  } = igShortcodeMedia.owner;
  const timestamp = new Date(igShortcodeMedia.taken_at_timestamp * 1000);

  const originalUserId = authorId;
  const userId = `${provider}|${originalUserId}`;

  const userDocRef = userCol.doc(userId);

  const newUserDoc: UserDocument = {
    id: userId,
    originalId: originalUserId,
    provider,
    displayName: full_name,
    userName: username,
    profileImageUrl: profile_pic_url,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  const newPostDoc: PostDocument = {
    id: postId,
    originalId: originalPostId,
    provider,
    author: userDocRef,
    text: igMedia.caption,
    timestamp: firestore.Timestamp.fromDate(timestamp),
    mediaType: igMedia.media_type === "VIDEO" ? "video" : "image",
    mediaUrls: igMedia.children
      ? igMedia.children.data.map(({ id }) => id)
      : [],
    sourceUrl: igMedia.permalink,
    deleted: false,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };
  newPostDoc.mediaUrls[0] = `${igMedia.permalink}media`;

  console.log(
    `saving target doc of post and user are created. postId: ${newPostDoc.id}, userId: ${newUserDoc.id}`
  );

  return {
    post: newPostDoc,
    user: newUserDoc,
  };
};

export const parsePermalink = async (
  permalink: string
): Promise<IGSharedData> => {
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

export const searchMediasByHashtag = async (): Promise<
  IGHashtagRecentMedia[]
> => {
  const instagramBusinessAccountId = "17841412231763694";
  const hashTagId = `17870480920696380`;
  const accessToken = config.instagram_graph_api.access_token;
  const fields: string = [
    "id",
    "caption",
    "children",
    "comments_count",
    "like_count",
    "media_type",
    "media_url",
    "permalink",
  ].join(",");

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
