import React, { FC } from "react";
import styled, { css, ThemeProps } from "styled-components";

import { default as MuiAppBar } from "@material-ui/core/AppBar";
import { Toolbar, InputBase, Theme } from "@material-ui/core";
import { fade } from "@material-ui/core/styles";

import SearchIcon from "@material-ui/icons/Search";

export const FixedAppBarMargin = styled.div`
  margin-top: 64px;
`;

const Logo = () => {
  return <div>{`Numazu@Home`}</div>;
};

const SearchTextBox: FC = () => {
  return (
    <div
      css={`
        ${({ theme }: ThemeProps<Theme>) => css`
          position: relative;
          width: 100%;
          margin-left: 0;
          margin-right: ${theme.spacing(2)}px;
          border-radius: ${theme.shape.borderRadius}px;
          background-color: ${fade(theme.palette.common.white, 0.15)};

          &:hover {
            background-color: ${fade(theme.palette.common.white, 0.25)};
          }
        `}
      `}
    >
      <div
        css={`
          ${({ theme }: ThemeProps<Theme>) => css`
            padding: ${theme.spacing(0, 2)}px;
            height: 100%;
            position: absolute;
            pointer-events: none;
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        `}
      >
        <SearchIcon />
      </div>
      <InputBase
        placeholder="Search…"
        inputProps={{ "aria-label": "search" }}
        css={`
          & > root {
            color: inherit;
          }

          & > input {
            ${({ theme }: ThemeProps<Theme>) => css`
              width: 100%;
              padding: ${theme.spacing(1, 1, 1, 0)}px;
              padding-left: calc(1em + ${theme.spacing(4)}px);
              transition: ${theme.transitions.create("width")};
            `}
          }
        `}
      />
    </div>
  );
};

const AppBar = () => {
  return (
    <>
      <MuiAppBar position="fixed">
        <Toolbar>
          <Logo />
          <SearchTextBox />
        </Toolbar>
      </MuiAppBar>
      <FixedAppBarMargin />
    </>
  );
};

export default AppBar;
