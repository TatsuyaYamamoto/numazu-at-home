import { firestore } from "firebase-admin";
import { EventContext } from "firebase-functions";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import algoliasearch from "algoliasearch";
import { SaveObjectResponse } from "@algolia/client-search";

import { UserDocument } from "../../share/models/User";
import { PostDocument } from "../../share/models/Post";
import { IGHashtagRecentMedia, IGSharedData } from "../../share/models/IG";
import { CommandDocument } from "../../share/models/Command";
import config from "../../config.functions";
import { AlgoliaObject } from "../../share/models/Algolia";

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
    const igMedia = snapshot.data() as IGHashtagRecentMedia;

    const data = await createNewDocData(igMedia);

    if (data) {
      const firestoreResult = await saveFirestore(data);
      console.log(`firestore commit is succeed.`, firestoreResult);

      const algoliaResult = await saveAlgoliaObject(data);
      console.log(`algolia object saving is succeed.`, algoliaResult);
    }
  }
};

const createNewDocData = async (
  igMedia: IGHashtagRecentMedia
): Promise<
  | {
      post: PostDocument;
      user: UserDocument;
    }
  | undefined
> => {
  const postCol = firestore().collection(`posts`) as PostColRef;
  const userCol = firestore().collection(`users`) as UserColRef;

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
    provider: "instagram",
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
      ? igMedia.children.map(({ permalink }) => `${permalink}media`)
      : [`${igMedia.permalink}media`],
    sourceUrl: igMedia.permalink,
    deleted: false,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  console.log(
    `saving target doc of post and user are created.`,
    newPostDoc,
    newUserDoc
  );

  return {
    post: newPostDoc,
    user: newUserDoc,
  };
};

const saveFirestore = async (params: {
  post: PostDocument;
  user: UserDocument;
}) => {
  const { post, user } = params;

  const postCol = firestore().collection(`posts`) as PostColRef;
  const postDocRef = postCol.doc(post.id);

  const userCol = firestore().collection(`users`) as UserColRef;
  const userDocRef = userCol.doc(user.id);

  const batch = firestore().batch();

  batch.set(userDocRef, user, { merge: true });
  batch.set(postDocRef, post, { merge: true });

  return batch.commit();
};

const saveAlgoliaObject = async (params: {
  post: PostDocument;
  user: UserDocument;
}): Promise<SaveObjectResponse> => {
  const { post, user } = params;

  const algolia = algoliasearch(config.algolia.app_id, config.algolia.api_key);
  const index = algolia.initIndex(config.algolia.index_name);

  const newObject: AlgoliaObject = {
    objectID: post.id,
    text: post.text,
    authorName: user.displayName || user.userName,
    authorProfileImageUrl: user.profileImageUrl,
    timestamp: post.timestamp.toMillis(),
    mediaUrl: post.me[0],
  };

  return index.saveObject(newObject);
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
