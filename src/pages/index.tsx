import React from "react";

import { TopAppBar } from "../components/organisms/AppBar";
import PostList from "../components/organisms/PostList/PostList";
import MobileBottomNavigation from "../components/organisms/MobileBottomNavigation";

const IndexPage = () => {
  return (
    <>
      <TopAppBar />
      <PostList />
      <MobileBottomNavigation />
    </>
  );
};

export default IndexPage;
