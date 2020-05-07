import React, { FC, forwardRef, useEffect, useMemo, useState } from "react";

import {
  Avatar,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
} from "@material-ui/core";
import { red } from "@material-ui/core/colors";

import { dateFormat } from "../../../helper/format";
import { Provider } from "../../../share/models/types";
import InstagramSvgIcon from "../../atoms/svg/InstagramSvgIcon";
import TwitterSvgIcon from "../../atoms/svg/TwitterSvgIcon";

interface PostListItemProps {
  authorName: string;
  authorProfileImageUrl?: string;
  timestamp: Date;
  mediaUrls: string[];
  text: string;
  provider: Provider;
  onMount?: () => void;
}

const PostListItem: FC<PostListItemProps> = forwardRef((props, ref) => {
  const {
    authorName,
    authorProfileImageUrl,
    timestamp,
    mediaUrls,
    text,
    provider,
    onMount,
    ...others
  } = props;

  useEffect(() => {
    if (onMount) {
      onMount();
    }
  }, [onMount]);

  const [now] = useState(new Date());
  const [formattedNow] = useState(dateFormat(now, timestamp));
  const rightIcon = useMemo(() => {
    if (provider === "instagram") {
      return (
        <IconButton>
          <InstagramSvgIcon />
        </IconButton>
      );
    }
    if (provider === "twitter") {
      return (
        <IconButton>
          <TwitterSvgIcon />
        </IconButton>
      );
    }

    return undefined;
  }, [provider]);

  return (
    <Card
      css={`
        max-width: 500px;
        margin: 0 auto;
      `}
      innerRef={ref}
      {...others}
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
        action={rightIcon}
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
});

export default PostListItem;
