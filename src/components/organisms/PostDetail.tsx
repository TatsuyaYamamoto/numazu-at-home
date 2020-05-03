import React, { FC } from "react";

import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Typography,
} from "@material-ui/core";
import { red } from "@material-ui/core/colors";
import Container from "../atoms/Container";

interface PostDetailProps {
  authorName: string;
  authorProfileImageUrl?: string;
  timestamp: Date;
  mediaUrls: string[];
  text: string;
}

const PostDetail: FC<PostDetailProps> = (props) => {
  const {
    authorName,
    authorProfileImageUrl,
    timestamp,
    mediaUrls,
    text,
  } = props;

  return (
    <Container>
      <Card
        css={`
          //max-width: 345px;
        `}
        elevation={0}
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
            width: 100%;
            //height: 0;
            padding-top: 100%; // 16:9
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
              white-space: pre-wrap;
            `}
          >
            {text}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PostDetail;
