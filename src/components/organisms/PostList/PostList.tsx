import React, { FC, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";

import { firestore } from "firebase";

import { Index, IndexRange } from "react-virtualized";

import useFirebase from "../../hooks/useFirebase";
import Container from "../../atoms/Container";
import PostListItem from "./PostListItem";

import { RootState } from "../../../modules/store";
import { importPostDocs } from "../../../modules/entities";
import displaySlice from "../../../modules/display";

import { User } from "../../../share/models/User";
import { PostDocument, Post } from "../../../share/models/Post";
import LoadingPostListItem from "./LoadingPostListItem";
import InfiniteList, { RowRendererProps } from "./InfiniteList";

type RecentPost = Post & {
  author: User;
};

const postListSelector = (state: RootState): RecentPost[] => {
  const { entities, display } = state;
  const recentPosts: RecentPost[] = [];

  for (const postId of display.recentPost.ids) {
    const post = entities.posts[postId];
    if (!post) {
      continue;
    }
    const { authorId } = post;

    const author = entities.users[authorId];
    if (!author) {
      continue;
    }

    recentPosts.push({
      ...post,
      author,
    });
  }
  return recentPosts;
};

const PostList: FC = (props) => {
  const { ...others } = props;
  const { app: firebaseApp } = useFirebase();
  const dispatch = useDispatch();
  const recentPosts = useSelector(postListSelector);
  const { hasMoreItem, lastPostDocId } = useSelector(
    ({ display }: RootState) => display.recentPost
  );

  const rowCount = useMemo(
    () =>
      hasMoreItem && firebaseApp ? recentPosts.length + 1 : recentPosts.length,
    [hasMoreItem, recentPosts, firebaseApp]
  );

  const isRowLoaded = ({ index }: Index): boolean => {
    return !!recentPosts[index];
  };

  const loadMoreRows = useCallback(
    async ({}: IndexRange): Promise<any> => {
      console.log("loadMoreRows", lastPostDocId);

      if (!firebaseApp) {
        console.warn("FirebaseApp is not initialized.");
        return;
      }

      const limit = 5;
      type PostColRef = firestore.CollectionReference<PostDocument>;
      const postColRef = firebaseApp
        .firestore()
        .collection(`posts`) as PostColRef;

      let query = postColRef.orderBy("timestamp", "desc").limit(limit);

      if (lastPostDocId) {
        const lastPostDocSnap = await postColRef.doc(lastPostDocId).get();
        query = query.startAfter(lastPostDocSnap);
      }

      const postQuerySnap = await query.get();

      if (postQuerySnap.empty) {
        dispatch(displaySlice.actions.notifyNoMoreRecentPost({}));
        return;
      }

      const recentPostIds: string[] = [];
      const recentPostDocs: PostDocument[] = [];

      postQuerySnap.forEach((doc) => {
        const docData = doc.data();
        recentPostIds.push(docData.id);
        recentPostDocs.push(docData);
      });

      dispatch(importPostDocs(recentPostDocs));
      dispatch(displaySlice.actions.pushRecentPosts({ ids: recentPostIds }));
    },
    [firebaseApp, lastPostDocId, lastPostDocId, dispatch]
  );

  const renderRow = (props: RowRendererProps) => {
    const { index, style, measure, registerChild } = props;
    const post = recentPosts[index];

    return (
      <div
        // @ts-ignore
        ref={registerChild}
        style={{
          ...style,
          padding: "10px 3px",
        }}
      >
        {!post ? (
          <LoadingPostListItem key={index} />
        ) : (
          <Link
            href={{
              pathname: "/post",
              query: { id: post.id },
            }}
          >
            <PostListItem
              key={post.id}
              authorName={post.author.displayName || post.author.userName}
              authorProfileImageUrl={post.author.profileImageUrl}
              timestamp={post.timestamp}
              mediaUrls={post.mediaUrls}
              text={post.text}
              provider={post.provider}
              onMount={measure}
            />
          </Link>
        )}
      </div>
    );
  };

  return (
    <div {...others}>
      <Container>
        <InfiniteList
          isRowLoaded={isRowLoaded}
          onLoadRows={loadMoreRows}
          rowCount={rowCount}
          threshold={1}
        >
          {renderRow}
        </InfiniteList>
      </Container>
    </div>
  );
};

export default PostList;
