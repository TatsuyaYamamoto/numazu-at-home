import React, { FC, useEffect, useState, useMemo, useCallback } from "react";
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
import PostDocument, { MediaType } from "../../share/models/Post";
import { Provider } from "../../share/models/types";

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

interface Post {
  id: string;
  originalId: string;
  provider: Provider;
  author: string;
  text: string;
  timestamp: Date;
  mediaType: MediaType;
  mediaUrls: string[];
  deleted: boolean;
  createdAt: firestore.FieldValue;
}

const PostList: FC = (props) => {
  const { ...others } = props;
  const { app: firebaseApp } = useFirebase();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [lastPostDocSnap, setLastPostDocSnap] = useState<
    firestore.QueryDocumentSnapshot | undefined
  >();
  const [hasMoreItem, setHasMoreItem] = useState(true);

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
    const post = posts[index];

    return (
      <CellMeasurer
        key={key}
        cache={cellMeasurerCache}
        parent={parent}
        rowIndex={index}
      >
        {({ registerChild, measure }) => (
          // @ts-ignore
          <div ref={registerChild} style={style}>
            {!post ? (
              <div key={index}>loading...</div>
            ) : (
              <PostListItem
                key={post.id}
                onClick={onClickPost(post.id)}
                authorName={post.author}
                authorProfileImageUrl={undefined}
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
    () => (hasMoreItem && firebaseApp ? posts.length + 5 : posts.length),
    [hasMoreItem, posts, firebaseApp]
  );

  const isRowLoaded = ({ index }: Index): boolean => {
    return !!posts[index];
  };

  const loadMoreRows = useCallback(
    async ({ startIndex, stopIndex }: IndexRange): Promise<any> => {
      console.log("loadMoreRows", startIndex, stopIndex);

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

      if (lastPostDocSnap) {
        query = query.startAfter(lastPostDocSnap);
      }

      const postQuerySnap = await query.get();

      if (postQuerySnap.empty) {
        setHasMoreItem(false);
        return;
      }

      const loadedPosts = postQuerySnap.docs.map((doc) => {
        return {
          ...doc.data(),
          id: doc.id,
          author: "TODO",
          timestamp: doc.data().timestamp.toDate(),
        };
      });

      setLastPostDocSnap(postQuerySnap.docs[postQuerySnap.size - 1]);

      setPosts((prev) => [...prev, ...loadedPosts]);
    },
    [firebaseApp, lastPostDocSnap, hasMoreItem]
  );

  return (
    <div {...others}>
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
    </div>
  );
};

export default PostList;
