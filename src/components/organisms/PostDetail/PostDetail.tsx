import React, { FC, Fragment, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";

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

import A from "../../helper/A";
import { dateFormat } from "../../../helper/format";
import InstagramSvgIcon from "../../atoms/svg/InstagramSvgIcon";
import TwitterSvgIcon from "../../atoms/svg/TwitterSvgIcon";
import { Provider } from "../../../share/models/types";
import { search } from "../../../modules/search";

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

  const dispatch = useDispatch();
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

  const onHashtagLinkClicked = (hashtag: string) => () => {
    dispatch(search(hashtag));
  };

  const linkableText = useMemo(() => {
    // // https://stackoverflow.com/questions/24083983/detecting-hashtags-and-in-string
    // // https://github.com/textlint-ja/textlint-rule-preset-JTF-style/issues/1#issuecomment-145887697
    const hashtagPattern = /#([A-Za-z0-9\-\.\_]|[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]|[\uD840-\uD87F][\uDC00-\uDFFF]|[ぁ-んァ-ヶー])+/g;

    // // https://stackoverflow.com/questions/24083983/detecting-hashtags-and-in-string
    const urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

    return text.split(/\n/).map((line, i) => {
      let inner = [<br />];

      if (line) {
        inner = line.split(/( |　)/).map((word, i) => {
          if (word.match(hashtagPattern)) {
            return (
              <span key={i} onClick={onHashtagLinkClicked(word)}>
                <Link href={`/search`}>
                  <A>{word}</A>
                </Link>
              </span>
            );
          }

          if (word.match(urlPattern)) {
            return (
              <A key={i} href={word}>
                {word}
              </A>
            );
          }

          return <Fragment key={i}>{word}</Fragment>;
        });
      }

      return <div key={i}>{inner}</div>;
    });
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
        <Typography variant="body2" color="textSecondary" component="div">
          {linkableText}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PostDetail;
