import React, { FC } from "react";

import { Card, CardHeader, CardContent, Typography } from "@material-ui/core";

import Shimmer from "../../atoms/Shimmer";

interface LoadingPostListItemProps {}

const LoadingPostListItem: FC<LoadingPostListItemProps> = (props) => {
  const {} = props;

  return (
    <Card
      css={`
        max-width: 500px;
        margin: 0 auto;
      `}
    >
      <CardHeader
        avatar={<Shimmer width={40} height={40} />}
        title={"..."}
        subheader={"..."}
      />
      <Shimmer height={100} />
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
          {`...`}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default LoadingPostListItem;
