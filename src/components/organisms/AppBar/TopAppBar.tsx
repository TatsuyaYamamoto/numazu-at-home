import React, { FC } from "react";
import { useRouter } from "next/router";

import styled from "styled-components";

import { AppBar as MuiAppBar, Toolbar } from "@material-ui/core";

import HelpButton from "../../molecules/HelpButton";
import FlexSpace from "../../atoms/FlexSpace";
import Logo from "../../atoms/Logo";

export const FixedAppBarMargin = styled.div`
  margin-top: 64px;
`;

export const TopAppBar: FC = () => {
  const router = useRouter();

  const onClickHelp = () => {
    router.push(`/help`);
  };

  const showHelpButton = !router.asPath.startsWith("/help");

  return (
    <>
      <MuiAppBar position="fixed">
        <Toolbar>
          <Logo />
          <FlexSpace />
          {showHelpButton && <HelpButton onClick={onClickHelp} />}
        </Toolbar>
      </MuiAppBar>
      <FixedAppBarMargin />
    </>
  );
};
