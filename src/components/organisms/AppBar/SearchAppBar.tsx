import React, { FC } from "react";
import { useRouter } from "next/router";

import {
  Toolbar,
  InputBase,
  AppBar as MuiAppBar,
  Theme,
  fade,
} from "@material-ui/core";
import { Search as SearchIcon } from "@material-ui/icons";
import styled, { css, ThemeProps } from "styled-components";

import { FixedAppBarMargin } from "./TopAppBar";
import { primaryBackground } from "../../helper/styles";

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

const StyledMuiAppBar = styled(MuiAppBar)`
  ${primaryBackground};
`;

export interface SearchAppbar {}

export const SearchAppBar: FC<SearchAppbar> = (props) => {
  const {} = props;

  useRouter();

  return (
    <>
      <StyledMuiAppBar position="fixed">
        <Toolbar>
          <SearchTextBox />
        </Toolbar>
      </StyledMuiAppBar>
      <FixedAppBarMargin />
    </>
  );
};
