import React, { FC } from "react";

import { default as MuiAppBar } from "@material-ui/core/AppBar";
import { Toolbar, InputBase } from "@material-ui/core";
import { fade } from "@material-ui/core/styles";

import SearchIcon from "@material-ui/icons/Search";

const Logo = () => {
  return <div>{`Numazu@Home`}</div>;
};

const SearchTextBox: FC = () => {
  return (
    <div
      css={`
        position: relative;
        border-radius: ${(props) => props.theme.shape.borderRadius}px;
        background-color: ${(props) =>
          fade(props.theme.palette.common.white, 0.15)};
        &:hover {
          background-color: ${(props) =>
            fade(props.theme.palette.common.white, 0.25)};
        }
        margin-right: ${(props) => props.theme.spacing(2)}px;
        margin-left: 0;
        width: 100%;
        //[theme.breakpoints.up('sm')]: {
        //  marginLeft: theme.spacing(3);
        //  width: 'auto';
        //};
      `}
    >
      <div
        css={`
          padding: ${(props) => props.theme.spacing(0, 2)}px;
          height: 100%;
          position: absolute;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
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
            padding: ${(props) => props.theme.spacing(1, 1, 1, 0)}px;
            padding-left: calc(1em + ${(props) => props.theme.spacing(4)}px);
            transition: ${(props) => props.theme.transitions.create("width")};
            width: 100%;
          }
        `}
      />
    </div>
  );
};

const AppBar = () => {
  return (
    <MuiAppBar position="static">
      <Toolbar>
        <Logo />
        <SearchTextBox />
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
