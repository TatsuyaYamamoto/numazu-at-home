import React from "react";
import { css, ThemeProps } from "styled-components";

import AppBar from "../components/organisms/AppBar";
import PostList from "../components/organisms/PostList";
import { Theme } from "@material-ui/core";

const IndexPage = () => {
  return (
    <>
      <AppBar />
      <PostList
        css={`
          ${({}: ThemeProps<Theme>) => css`
            // TODO: use media query.
            margin-top: ${64}px;
          `}
        `}
      />
    </>
  );
};

export default IndexPage;
