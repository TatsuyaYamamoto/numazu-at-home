import { firestore } from "firebase-admin";

import { PostDocument } from "../../share/models/Post";
import { UserDocument } from "../../share/models/User";

type PostColRef = firestore.CollectionReference<PostDocument>;
type UserColRef = firestore.CollectionReference<UserDocument>;

const postColRef = firestore().collection("posts") as PostColRef;
const userColRef = firestore().collection("users") as UserColRef;

export const mergeFirestoreDocs = async (params: {
  users: { [id: string]: UserDocument };
  posts: { [id: string]: PostDocument };
}) => {
  const { users, posts } = params;

  const batch = firestore().batch();
  for (const userId of Object.keys(users)) {
    const userDocRef = userColRef.doc(userId);
    batch.set(userDocRef, users[userId], { merge: true });
  }
  for (const postId of Object.keys(posts)) {
    const postDocRef = postColRef.doc(postId);
    batch.set(postDocRef, posts[postId], { merge: true });
  }

  return batch.commit();
};
