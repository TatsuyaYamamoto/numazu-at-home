import React from "react";
import { NextPage } from "next";

import HelpList from "../components/organisms/HelpList/HelpList";
import HelpHero from "../components/organisms/HelpHero";

const HelpPage: NextPage = () => {
  return (
    <>
      <HelpHero />
      <HelpList />
    </>
  );
};

export default HelpPage;
