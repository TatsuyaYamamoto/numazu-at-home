import React, { FC } from "react";

import styled, { css } from "styled-components";
import {
  AppBar as MuiAppBar,
  Theme,
  Toolbar,
  Typography,
} from "@material-ui/core";

import Logo from "../atoms/Logo";
import AppVersion from "../atoms/AppVersion";
import Container from "../atoms/Container";
import { primaryBackground } from "../helper/styles";

const textColor = css`
  color: ${({ theme }) =>
    theme.palette.getContrastText(theme.palette.primary.main)};
`;

const Root = styled.div<{ theme: Theme }>`
  ${primaryBackground}
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

const StyledAppBar = styled(MuiAppBar)`
  background-color: inherit;
`;

const HelpHero: FC = () => {
  return (
    <Root>
      <StyledAppBar elevation={0} position={"relative"}>
        <Toolbar />
      </StyledAppBar>
      <LogoArea>
        <Logo fontSize={40} />
        <br />
        <AppVersion />
      </LogoArea>

      <Container>
        <CatchCopy>
          <Typography>{`Support your "テイクアウト de ステイホーム"`}</Typography>
        </CatchCopy>
        <Description>
          <Typography>
            {`Numazu@Homeは、「沼津」と「沼津のお店」と「沼津のお店を利用する皆さん」をサポートするアプリです。`}
          </Typography>
        </Description>
      </Container>
    </Root>
  );
};

export default HelpHero;
