import React, { useEffect } from "react";
import { NextPage } from "next";

import HelpList from "../components/organisms/HelpList/HelpList";
import HelpHero from "../components/organisms/HelpHero";

const HelpPage: NextPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <>
      <HelpHero />
      <HelpList />
    </>
  );
};

export default HelpPage;
