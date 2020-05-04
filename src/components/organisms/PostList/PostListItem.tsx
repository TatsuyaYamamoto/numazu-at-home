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

import { dateFormat } from "../../../helper/format";

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

  const [now] = useState(new Date());
  const [formattedNow] = useState(dateFormat(now, timestamp));

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
        subheader={formattedNow}
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

export default PostListItem;
