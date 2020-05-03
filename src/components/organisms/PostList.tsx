import React, { FC, useEffect, useMemo, useCallback } from "react";
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
import {
  Avatar,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Typography,
} from "@material-ui/core";
import { red } from "@material-ui/core/colors";

import useFirebase from "../hooks/useFirebase";
import { User } from "../../share/models/User";
import { PostDocument, Post } from "../../share/models/Post";
import { RootState } from "../../modules/store";
import { importPostDocs } from "../../modules/entities";
import displaySlice from "../../modules/display";
import Container from "../atoms/Container";

interface PostListItemProps {
  authorName: string;
  authorProfileImageUrl?: string;
  timestamp: Date;
  mediaUrls: string[];
  text: string;
  onClick: () => void;
  onMount: () => void;
}

const PostListItem: FC<PostListItemProps> = (props) => {
  const {
    authorName,
    authorProfileImageUrl,
    timestamp,
    mediaUrls,
    text,
    onMount,
    onClick,
  } = props;

  useEffect(() => {
    onMount();
  }, []);

  return (
    <Card
      css={`
        max-width: 500px;
        margin: 0 auto;
      `}
      onClick={onClick}
    >
      <CardHeader
        avatar={
          <Avatar
            css={`
              background-color: ${red[500]};
            `}
            src={authorProfileImageUrl}
          >
            {!authorProfileImageUrl && authorName[0]}
          </Avatar>
        }
        title={authorName}
        subheader={timestamp.toISOString()}
      />
      <CardMedia
        css={`
          height: 0;
          //padding-top: 56.25%; // 16:9
          padding-top: 100%;
        `}
        // TODO support multiple media
        image={mediaUrls[0]}
        title="Paella dish"
      />
      <CardContent>
        <Typography
          variant="body2"
          color="textSecondary"
          component="p"
          css={`
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
            overflow: hidden;
          `}
        >
          {text}
        </Typography>
      </CardContent>
    </Card>
  );
};

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

  useEffect(() => {
    if (!firebaseApp) {
      return;
    }
  }, [firebaseApp]);

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
              <div key={index}>loading...</div>
            ) : (
              <PostListItem
                key={post.id}
                onClick={onClickPost(post.id)}
                authorName={post.author.displayName}
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
