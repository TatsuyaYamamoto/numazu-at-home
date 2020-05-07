import Twit from "twit";

import config from "../../config.functions";
import moment from "moment";
import { PostDocument } from "../../share/models/Post";
import { UserDocument } from "../../share/models/User";
import { firestore } from "firebase-admin";

const twitter = new Twit(config.twitter);

type UserColRef = firestore.CollectionReference<UserDocument>;

const userCol = firestore().collection(`users`) as UserColRef;

export const searchTweets = async (
  params: Twit.Params
): Promise<Twit.Twitter.SearchResults> => {
  return new Promise((resolve, reject) => {
    twitter.get("search/tweets", params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data as any);
      }
    });
  });
};

export const rangeSearchTweets = async (
  params: Twit.Params,
  since: Date
): Promise<Twit.Twitter.Status[]> => {
  const rangeStatuses: Twit.Twitter.Status[] = [];

  const loopSearch = async (maxId?: string) => {
    const { statuses } = await searchTweets({
      ...params,
      count: 100,
      result_type: "recent",
      max_id: maxId,
    });
    console.log(
      `internal loop search. result_type: recent, status count: ${statuses.length}, maxId: ${maxId}`
    );

    let isWithinRange = true;

    for (const status of statuses) {
      const createdAt = moment(new Date(status.created_at));
      const formattedCreatedAt = createdAt.format("YYYY-MM-DD HH:mm");
      const diffFromSince = createdAt.diff(since, "days", true);
      if (0 < diffFromSince) {
        console.log(
          `tweet in range.     ID: ${status.id_str}, date: ${formattedCreatedAt}, diff from since: ${diffFromSince}`
        );
        rangeStatuses.push(status);
      } else {
        console.log(
          `tweet out of range. ID: ${status.id_str}, date: ${formattedCreatedAt}, diff from since: ${diffFromSince}`
        );

        isWithinRange = false;
        break;
      }
    }

    if (isWithinRange) {
      const lastStatusId = statuses[statuses.length - 1].id_str;
      await loopSearch(lastStatusId);
    }
  };

  await loopSearch();

  return rangeStatuses;
};

export const createNewDocData = (
  status: Twit.Twitter.Status
):
  | {
      post: PostDocument;
      user: UserDocument;
    }
  | undefined => {
  const provider = "twitter";
  const originalPostId = status.id_str;
  const postId = `${provider}|${originalPostId}`;

  const originalUserId = status.user.id_str;
  const screenName = status.user.screen_name;
  const userId = `${provider}|${originalUserId}`;

  const sourceUrl = `https://twitter.com/${screenName}/status/${originalPostId}`;

  const newUserDocRef = userCol.doc(userId);
  const newUserDoc: UserDocument = {
    id: userId,
    originalId: originalUserId,
    provider,
    displayName: status.user.name,
    userName: status.user.screen_name,
    profileImageUrl: status.user.profile_image_url_https,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  if (!status.entities.media || status.entities.media.length === 0) {
    console.log(`tweet with ID '${originalPostId}' has no media. ignore this.`);
    return;
  }

  if (status.retweeted_status) {
    console.log(`tweet with ID '${originalPostId}' is retweet. ignore this.`);
    return;
  }

  if (status.in_reply_to_status_id) {
    console.log(`tweet with ID '${originalPostId}' is reply. ignore this.`);
    return;
  }

  const fullText = status.full_text as string; // use tweet_mode: "extended"
  const [inclusiveStart, exclusiveEnd] = status.display_text_range as number[]; // use tweet_mode: "extended"
  const displayFullText = fullText.slice(inclusiveStart, exclusiveEnd + 1);

  const mediaUrls = status.entities.media.map((entity) => {
    return entity.media_url_https;
  });

  const newPostDoc: PostDocument = {
    id: postId,
    originalId: originalPostId,
    provider,
    author: newUserDocRef,
    text: displayFullText,
    timestamp: firestore.Timestamp.fromDate(new Date(status.created_at)),
    mediaType: status.entities.media[0].type === "video" ? "video" : "image",
    mediaUrls,
    sourceUrl,
    deleted: false,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  console.log(
    `saving target doc of post and user are created. postId: ${newPostDoc.id}, userId: ${newUserDoc.id}`
  );

  return {
    user: newUserDoc,
    post: newPostDoc,
  };
};
