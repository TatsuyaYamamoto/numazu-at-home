import React from "react";

import { TopAppBar } from "../components/organisms/AppBar";
import PostList from "../components/organisms/PostList/PostList";

const IndexPage = () => {
  return (
    <>
      <TopAppBar />
      <PostList />
    </>
  );
};

export default IndexPage;
