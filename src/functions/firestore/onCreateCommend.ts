import { firestore } from "firebase-admin";
import { EventContext } from "firebase-functions";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";

import UserDocument from "../../share/models/User";
import PostDocument from "../../share/models/Post";
import { IGHashtagRecentMedia, IGSharedData } from "../../share/models/IG";
import { CommandDocument } from "../../share/models/Command";

type UserColRef = firestore.CollectionReference<UserDocument>;
type PostColRef = firestore.CollectionReference<PostDocument>;

const onCreateCommend = async (
  snapshot: firestore.DocumentSnapshot,
  _: EventContext
): Promise<any> => {
  const newCommand = (await snapshot.ref.parent.parent?.get())?.data() as
    | CommandDocument
    | undefined;

  if (newCommand?.type === "LOAD_IG_HASHTAG_RECENT_MEDIA") {
    const data = snapshot.data() as IGHashtagRecentMedia;

    return onLoadIgHashtagRecentMedia(data);
  }
};

const onLoadIgHashtagRecentMedia = async (igMedia: IGHashtagRecentMedia) => {
  const postCol = firestore().collection(`posts`) as PostColRef;
  const userCol = firestore().collection(`users`) as UserColRef;
  const batch = firestore().batch();

  const provider = "instagram";
  const originalPostId = igMedia.id;
  const postId = `${provider}|${originalPostId}`;

  const postDocRef = postCol.doc(postId);
  const postDoc = await postDocRef.get();

  const log = ((id: string) => (message: any): void => {
    // tslint:disable-next-line
    console.log(`[onLoadIgHashtagRecentMedia] ${id} - ${message}`);
  })(originalPostId);

  log(`IGMedia with ID '${igMedia.id}' is already existing. end function.`);

  if (postDoc.exists) {
    log(`IGMedia with ID '${igMedia.id}' is already existing. end function.`);
    return;
  }

  const igSharedData = await parsePermalink(igMedia.permalink);
  log(`IGMedia's sharedData is parsed. permalink: ${igMedia.permalink}`);

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
  const userDoc = await postDocRef.get();

  if (!userDoc.exists) {
    log(`author with ID '${authorId}' is not existing on firestore as user.`);

    const newUserDoc: UserDocument = {
      id: userId,
      originalId: originalUserId,
      provider: "instagram",
      displayName: full_name,
      useName: username,
      profileImageUrl: profile_pic_url,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };
    batch.set(userDocRef, newUserDoc, { merge: true });
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
  batch.set(postDocRef, newPostDoc, { merge: true });

  await batch.commit();
  log(`commit of batch is succeed.`);
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

export default onCreateCommend;
