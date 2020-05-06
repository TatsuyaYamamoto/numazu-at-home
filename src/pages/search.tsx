import React from "react";
import { NextPage } from "next";

import MobileBottomNavigation from "../components/organisms/MobileBottomNavigation";
import { SearchAppBar } from "../components/organisms/AppBar";
import SearchResultList from "../components/organisms/PostList/SearchResultList";

const SearchPage: NextPage = () => {
  return (
    <>
      <SearchAppBar />
      <SearchResultList />
      <MobileBottomNavigation />
    </>
  );
};

export default SearchPage;
