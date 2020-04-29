import React, { FC, useEffect, useState } from "react";

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

interface PostListItemProps {
  authorName: string;
  authorProfileImageUrl?: string;
  timestamp: Date;
  mediaImageUrls: string[];
  text: string;
}
const PostListItem: FC<PostListItemProps> = (props) => {
  const {
    authorName,
    authorProfileImageUrl,
    timestamp,
    mediaImageUrls,
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
        image={mediaImageUrls[0]}
        title="Paella dish"
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {text}
        </Typography>
      </CardContent>
    </Card>
  );
};

const PostList: FC = () => {
  const { app: firebaseApp } = useFirebase();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!firebaseApp) {
      return;
    }

    (async () => {
      const query = await firebaseApp.firestore().collection(`posts`).get();
      const loadedPosts = query.docs.map((doc) => {
        console.log(doc.data());
        return {
          ...doc.data(),
          id: doc.id,
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
          authorName={post.authorName}
          authorProfileImageUrl={undefined}
          timestamp={post.timestamp}
          mediaImageUrls={post.mediaImageUrls}
          text={post.text}
        />
      ))}
    </div>
  );
};

export default PostList;
