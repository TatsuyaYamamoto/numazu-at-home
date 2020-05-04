import React, { FC, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import { firestore } from "firebase";

import {
  InfiniteLoader,
  WindowScroller,
  List,
  ListRowRenderer,
  CellMeasurer,
  CellMeasurerCache,
  Index,
  IndexRange,
} from "react-virtualized";

import useFirebase from "../../hooks/useFirebase";
import Container from "../../atoms/Container";
import PostListItem from "./PostListItem";

import { RootState } from "../../../modules/store";
import { importPostDocs } from "../../../modules/entities";
import displaySlice from "../../../modules/display";

import { User } from "../../../share/models/User";
import { PostDocument, Post } from "../../../share/models/Post";
import LoadingPostListItem from "./LoadingPostListItem";

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
  const router = useRouter();
  const dispatch = useDispatch();
  const recentPosts = useSelector(postListSelector);
  const { hasMoreItem, lastPostDocId } = useSelector(
    ({ display }: RootState) => display.recentPost
  );

  const onClickPost = (postId: string) => () => {
    router.push({
      pathname: "/post",
      query: { id: postId },
    });
  };

  const rowRenderer: ListRowRenderer = ({ key, index, style, parent }) => {
    const post = recentPosts[index];

    return (
      <CellMeasurer
        key={key}
        cache={cellMeasurerCache}
        parent={parent}
        rowIndex={index}
      >
        {({ registerChild, measure }) => (
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
              <PostListItem
                key={post.id}
                onClick={onClickPost(post.id)}
                authorName={post.author.displayName || post.author.userName}
                authorProfileImageUrl={post.author.profileImageUrl}
                timestamp={post.timestamp}
                mediaUrls={post.mediaUrls}
                text={post.text}
                onMount={measure}
              />
            )}
          </div>
        )}
      </CellMeasurer>
    );
  };

  const cellMeasurerCache = useMemo(
    () =>
      new CellMeasurerCache({
        defaultHeight: 50,
        fixedWidth: true,
      }),
    []
  );

  const rowCount = useMemo(
    () =>
      hasMoreItem && firebaseApp ? recentPosts.length + 5 : recentPosts.length,
    [hasMoreItem, recentPosts, firebaseApp]
  );

  const isRowLoaded = ({ index }: Index): boolean => {
    return !!recentPosts[index];
  };

  const loadMoreRows = useCallback(
    async ({ startIndex, stopIndex }: IndexRange): Promise<any> => {
      console.log("loadMoreRows", startIndex, stopIndex, lastPostDocId);

      if (!firebaseApp) {
        console.warn("FirebaseApp is not initialized.");
        return;
      }

      const limit = stopIndex - startIndex + 1;
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

  return (
    <div {...others}>
      <Container>
        <InfiniteLoader
          isRowLoaded={isRowLoaded}
          loadMoreRows={loadMoreRows}
          rowCount={rowCount}
        >
          {({ onRowsRendered }) => (
            <WindowScroller>
              {({ height, width, scrollTop, isScrolling }) => (
                <List
                  height={height}
                  autoHeight={true}
                  width={width}
                  autoWidth={true}
                  isScrolling={isScrolling}
                  // onScroll={onChildScroll}
                  onRowsRendered={onRowsRendered}
                  scrollTop={scrollTop}
                  rowCount={rowCount}
                  rowHeight={cellMeasurerCache.rowHeight}
                  rowRenderer={rowRenderer}
                />
              )}
            </WindowScroller>
          )}
        </InfiniteLoader>
      </Container>
    </div>
  );
};

export default PostList;
