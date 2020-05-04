import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NextPage } from "next";
import { useRouter } from "next/router";

import { firestore } from "firebase";

import { InternalAppBar } from "../components/organisms/AppBar";
import PostDetail from "../components/organisms/PostDetail";
import useFirebase from "../components/hooks/useFirebase";

import { Post, PostDocument } from "../share/models/Post";
import { User } from "../share/models/User";
import { RootState } from "../modules/store";

import { importPostDocs } from "../modules/entities";

const detailSelector = (id: string | null) => (
  state: RootState
): { post: Post; user: User } | undefined => {
  if (!id) {
    return;
  }

  const post = state.entities.posts[id];

  if (!post) {
    return;
  }

  const user = state.entities.users[post.authorId];

  return user ? { post, user } : undefined;
};

const PostPage: NextPage = () => {
  const router = useRouter();
  const [postId] = useState(() => {
    const { searchParams } = new URL(`http://dummy.com${router.asPath}`);
    return searchParams.get("id");
  });
  const detail = useSelector(detailSelector(postId));
  const { app: firebaseApp } = useFirebase();
  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    if (!firebaseApp) {
      console.warn("FirebaseApp is not initialized.");
      return;
    }

    if (!postId) {
      console.warn("postId is null.");
      return;
    }

    (async () => {
      type PostColRef = firestore.CollectionReference<PostDocument>;
      const postColRef = firebaseApp
        .firestore()
        .collection(`posts`) as PostColRef;

      const postDocSnap = await postColRef.doc(postId).get();
      const postDoc = postDocSnap.data();

      if (postDoc) {
        dispatch(importPostDocs([postDoc]));
      } else {
        console.warn(`could not get post with ID'${postId}' from firestore.`);
      }
    })();
  }, [postId, firebaseApp]);

  if (!detail) {
    return (
      <>
        <InternalAppBar showBackArrow={true} title={`投稿`} />
        <div>Not found.</div>
      </>
    );
  }

  const { user, post } = detail;

  return (
    <>
      <InternalAppBar showBackArrow={true} title={`投稿`} />
      <PostDetail
        authorName={user.displayName || user.userName}
        authorProfileImageUrl={user.profileImageUrl}
        timestamp={post.timestamp}
        mediaUrls={post.mediaUrls}
        text={post.text}
        sourceUrl={post.sourceUrl}
      />
    </>
  );
};

export default PostPage;
