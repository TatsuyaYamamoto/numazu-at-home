import React, { ChangeEvent, FC } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Toolbar,
  InputBase,
  AppBar as MuiAppBar,
  Theme,
  fade,
  IconButton,
} from "@material-ui/core";
import { Search as SearchIcon, Clear as ClearIcon } from "@material-ui/icons";
import styled, { css, ThemeProps } from "styled-components";

import { FixedAppBarMargin } from "./TopAppBar";
import { primaryBackground } from "../../helper/styles";

import { search } from "../../../modules/search";
import { RootState } from "../../../modules/store";

interface SearchTextBoxProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const SearchTextBox: FC<SearchTextBoxProps> = (props) => {
  const { value, onChange, onClear } = props;

  return (
    <div
      css={`
        ${({ theme }: ThemeProps<Theme>) => css`
          position: relative;
          width: 100%;
          margin: 0 16px;
          border-radius: ${theme.shape.borderRadius}px;
          background-color: ${fade(theme.palette.common.white, 0.15)};

          display: flex;

          &:hover {
            background-color: ${fade(theme.palette.common.white, 0.25)};
          }
        `}
      `}
    >
      <IconButton disabled={true}>
        <SearchIcon
          css={`
            color: white;
          `}
        />
      </IconButton>
      <InputBase
        placeholder="Search…"
        value={value}
        onChange={onChange}
        fullWidth={true}
        css={`
          color: inherit;
        `}
      />
      <IconButton onClick={onClear}>
        <ClearIcon
          css={`
            color: white;
          `}
        />
      </IconButton>
    </div>
  );
};

const StyledMuiAppBar = styled(MuiAppBar)`
  ${primaryBackground};
`;

const querySelector = (state: RootState) => {
  return state.search.query;
};

export interface SearchAppbar {}

export const SearchAppBar: FC<SearchAppbar> = (props) => {
  const {} = props;
  const dispatch = useDispatch();
  const query = useSelector(querySelector);

  const onTextBoxValueChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatch(search(value));
  };

  const onTextBoxValueClear = () => {
    dispatch(search(""));
  };

  return (
    <>
      <StyledMuiAppBar position="fixed">
        <Toolbar>
          <SearchTextBox
            value={query || ""}
            onChange={onTextBoxValueChanged}
            onClear={onTextBoxValueClear}
          />
        </Toolbar>
      </StyledMuiAppBar>
      <FixedAppBarMargin />
    </>
  );
};
