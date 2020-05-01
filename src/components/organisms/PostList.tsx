import React, { FC, useEffect, useState, useMemo } from "react";
import { firestore } from "firebase";

import {
  WindowScroller,
  List,
  ListRowRenderer,
  CellMeasurer,
  CellMeasurerCache,
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
  } = props;

  useEffect(() => {
    onMount();
  }, []);

  return (
    <Card
      css={`
        max-width: 345px;
      `}
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
          padding-top: 56.25%; // 16:9
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
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!firebaseApp) {
      return;
    }

    (async () => {
      type PostColRef = firestore.CollectionReference<PostDocument>;
      const postColRef = firebaseApp
        .firestore()
        .collection(`posts`) as PostColRef;
      const query = await postColRef.get();
      const loadedPosts = query.docs.map((doc) => {
        return {
          ...doc.data(),
          id: doc.id,
          author: "TODO",
          timestamp: doc.data().timestamp.toDate(),
        };
      });

      setPosts(loadedPosts);
    })();
  }, [firebaseApp]);

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

  const rowCount = useMemo(() => Math.max(posts.length, 10), [posts]);

  const cellMeasurerCache = useMemo(
    () =>
      new CellMeasurerCache({
        defaultHeight: 50,
        fixedWidth: true,
      }),
    []
  );

  return (
    <div {...others}>
      <WindowScroller>
        {({ height, width, scrollTop, isScrolling }) => (
          <List
            height={height}
            autoHeight={true}
            width={width}
            autoWidth={true}
            isScrolling={isScrolling}
            // onScroll={onChildScroll}
            scrollTop={scrollTop}
            rowCount={rowCount}
            rowHeight={cellMeasurerCache.rowHeight}
            rowRenderer={rowRenderer}
          />
        )}
      </WindowScroller>
    </div>
  );
};

export default PostList;
