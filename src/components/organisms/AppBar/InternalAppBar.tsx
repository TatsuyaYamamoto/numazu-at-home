import React, { FC } from "react";
import { useRouter } from "next/router";

import {
  Toolbar,
  IconButton,
  AppBar as MuiAppBar,
  Typography,
} from "@material-ui/core";
import { ArrowBack as ArrowBackIcon } from "@material-ui/icons";

import { FixedAppBarMargin } from "./TopAppBar";

export interface BackArrowProps {
  onClick: () => void;
}

export const BackArrow: FC<BackArrowProps> = (props) => {
  const { onClick } = props;

  return (
    <IconButton
      edge="start"
      // className={classes.menuButton}
      color="inherit"
      aria-label="open drawer"
      onClick={onClick}
    >
      <ArrowBackIcon />
    </IconButton>
  );
};

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

  return (
    <>
      <MuiAppBar position="fixed">
        <Toolbar>
          {showBackArrow && <BackArrow onClick={onClickBack} />}
          <Typography>{title}</Typography>
        </Toolbar>
      </MuiAppBar>
      <FixedAppBarMargin />
    </>
  );
};
