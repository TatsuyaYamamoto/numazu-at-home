import React from "react";
import { NextPage } from "next";

import MobileBottomNavigation from "../components/organisms/MobileBottomNavigation";
import { SearchAppBar } from "../components/organisms/AppBar";

const SearchPage: NextPage = () => {
  return (
    <>
      <SearchAppBar />
      <MobileBottomNavigation />
    </>
  );
};

export default SearchPage;
