import React, { FC, useEffect, useState } from "react";
import { firestore } from "firebase";

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
}
const PostListItem: FC<PostListItemProps> = (props) => {
  const {
    authorName,
    authorProfileImageUrl,
    timestamp,
    mediaUrls,
    text,
  } = props;

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

const PostList: FC = () => {
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

  return (
    <div>
      {posts.map((post) => (
        <PostListItem
          key={post.id}
          authorName={post.author}
          authorProfileImageUrl={undefined}
          timestamp={post.timestamp}
          mediaUrls={post.mediaUrls}
          text={post.text}
        />
      ))}
    </div>
  );
};

export default PostList;
