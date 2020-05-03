import React, { FC } from "react";
import { useRouter } from "next/router";

import styled, { css } from "styled-components";
import {
  AppBar as MuiAppBar,
  Theme,
  Toolbar,
  Typography,
} from "@material-ui/core";

import Logo from "../atoms/Logo";
import BackArrowButton from "../molecules/BackArrowButton";
import AppVersion from "../atoms/AppVersion";

const backgroundColor = css`
  background-color: ${({ theme }) => theme.palette.primary.main};
`;

const textColor = css`
  color: ${({ theme }) =>
    theme.palette.getContrastText(theme.palette.primary.main)};
`;

const Root = styled.div<{ theme: Theme }>`
  ${backgroundColor}
  ${textColor}
  text-align: center;

  padding-bottom: 64px;
`;

const LogoArea = styled.div`
  margin: 30px 0;
`;

const CatchCopy = styled.div`
  font-size: 20px;
  font-weight: bold;

  margin-bottom: 10px;
`;

const Description = styled.div``;

const HelpHero: FC = () => {
  const router = useRouter();

  const onClickBack = () => {
    // TODO prevent to go to external page.
    router.back();
  };

  return (
    <Root>
      <MuiAppBar elevation={0} position={"relative"}>
        <Toolbar>
          <BackArrowButton onClick={onClickBack} />
        </Toolbar>
      </MuiAppBar>
      <LogoArea>
        <Logo fontSize={40} />
        <br />
        <AppVersion />
      </LogoArea>

      <CatchCopy>
        <Typography>{`Support your "テイクアウト de ステイホーム"`}</Typography>
      </CatchCopy>
      <Description>
        <Typography>
          {`Numazu@Homeは、「沼津」と「沼津のお店」と「沼津のお店を利用する皆さん」をサポートするアプリです。`}
        </Typography>
      </Description>
    </Root>
  );
};

export default HelpHero;
