import React, { FC, useMemo, useState } from "react";

import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  Typography,
} from "@material-ui/core";
import { red } from "@material-ui/core/colors";

import { dateFormat } from "../../../helper/format";
import InstagramSvgIcon from "../../atoms/svg/InstagramSvgIcon";
import TwitterSvgIcon from "../../atoms/svg/TwitterSvgIcon";
import { Provider } from "../../../share/models/types";

interface PostDetailProps {
  authorName: string;
  authorProfileImageUrl?: string;
  timestamp: Date;
  mediaUrls: string[];
  text: string;
  provider: Provider;
}

const PostDetail: FC<PostDetailProps> = (props) => {
  const {
    authorName,
    authorProfileImageUrl,
    timestamp,
    mediaUrls,
    provider,
    text,
  } = props;

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

  const linkableText = useMemo(() => {
    // https://stackoverflow.com/questions/24083983/detecting-hashtags-and-in-string
    // https://github.com/textlint-ja/textlint-rule-preset-JTF-style/issues/1#issuecomment-145887697
    const hashtagPattern = /#([A-Za-z0-9\-\.\_]|[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]|[\uD840-\uD87F][\uDC00-\uDFFF]|[ぁ-んァ-ヶー])+/g;
    const hashtags = text.match(hashtagPattern);

    // https://stackoverflow.com/questions/24083983/detecting-hashtags-and-in-string
    const urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const urls = text.match(urlPattern);

    let replaced = text;
    if (hashtags) {
      hashtags.forEach((hashtag) => {
        const patten = new RegExp(`${hashtag}(\\s|$)`);
        const url = `https://www.instagram.com/explore/tags/${hashtag.replace(
          "#",
          ""
        )}/`;
        replaced = replaced.replace(
          patten,
          `<a href="${url}" target="_blank">${hashtag}</a>`
        );
      });
    }
    if (urls) {
      urls.forEach((url) => {
        replaced = replaced.replace(
          url,
          `<a href="${url}" target="_blank">${url}</a>`
        );
      });
    }

    return replaced;
  }, [text]);

  return (
    <Card css={``} elevation={0}>
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

            & > a {
              text-decoration: none;
              margin: 0 2px;
            }
          `}
          dangerouslySetInnerHTML={{ __html: linkableText }}
        />
      </CardContent>
    </Card>
  );
};

export default PostDetail;
