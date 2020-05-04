import React, { FC } from "react";

import { Card, CardHeader } from "@material-ui/core";

import Container from "../../atoms/Container";
import Shimmer from "../../atoms/Shimmer";

interface PostDetailLoadingProps {}

const PostDetailLoading: FC<PostDetailLoadingProps> = (props) => {
  const {} = props;

  return (
    <Container>
      <Card css={``} elevation={0}>
        <CardHeader
          avatar={<Shimmer width={40} height={40} />}
          title={<Shimmer width={200} />}
        />
        <Shimmer />
      </Card>
    </Container>
  );
};

export default PostDetailLoading;
