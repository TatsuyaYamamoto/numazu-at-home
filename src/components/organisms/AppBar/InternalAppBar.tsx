import React, { FC } from "react";
import { useRouter } from "next/router";

import { Toolbar, AppBar as MuiAppBar, Typography } from "@material-ui/core";
import styled from "styled-components";

import { FixedAppBarMargin } from "./TopAppBar";

import BackArrowButton from "../../molecules/BackArrowButton";
import HelpButton from "../../molecules/HelpButton";
import FlexSpace from "../../atoms/FlexSpace";
import { primaryBackground } from "../../helper/styles";

const StyledMuiAppBar = styled(MuiAppBar)`
  ${primaryBackground};
`;

export interface InternalAppBarProps {
  title?: string;
  showBackArrow?: boolean;
}

export const InternalAppBar: FC<InternalAppBarProps> = (props) => {
  const { title, showBackArrow = false } = props;
  const router = useRouter();

  const onClickBack = () => {
    // TODO prevent to go to external page.
    router.back();
  };

  const onClickHelp = () => {
    router.push(`/help`);
  };

  const showHelpButton = !router.asPath.startsWith("/help");

  return (
    <>
      <StyledMuiAppBar position="fixed">
        <Toolbar>
          {showBackArrow && <BackArrowButton onClick={onClickBack} />}
          <Typography>{title}</Typography>
          <FlexSpace />
          {showHelpButton && <HelpButton onClick={onClickHelp} />}
        </Toolbar>
      </StyledMuiAppBar>
      <FixedAppBarMargin />
    </>
  );
};
