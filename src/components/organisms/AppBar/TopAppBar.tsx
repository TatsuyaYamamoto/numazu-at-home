import React, { FC } from "react";
import { useRouter } from "next/router";

import styled from "styled-components";

import { AppBar as MuiAppBar, Toolbar } from "@material-ui/core";

import HelpButton from "../../molecules/HelpButton";
import FlexSpace from "../../atoms/FlexSpace";
import Logo from "../../atoms/Logo";
import { primaryBackground } from "../../helper/styles";

const StyledAppBar = styled(MuiAppBar)`
  ${primaryBackground};
  cursor: pointer;
`;

export const FixedAppBarMargin = styled.div`
  margin-top: 64px;
`;

export const TopAppBar: FC = () => {
  const router = useRouter();

  const onClickHelp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    router.push(`/help`);
  };

  const onClickAppBar = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <StyledAppBar position="fixed">
        <Toolbar onClick={onClickAppBar}>
          <Logo fontSize={25} />
          <FlexSpace />
          <HelpButton onClick={onClickHelp} />
        </Toolbar>
      </StyledAppBar>
      <FixedAppBarMargin />
    </>
  );
};
