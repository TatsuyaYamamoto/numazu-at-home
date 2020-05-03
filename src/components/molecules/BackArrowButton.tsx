import React, { FC } from "react";

import { IconButton } from "@material-ui/core";
import { ArrowBack as ArrowBackIcon } from "@material-ui/icons";

export interface BackArrowProps {
  onClick: () => void;
}

export const BackArrowButton: FC<BackArrowProps> = (props) => {
  const { onClick } = props;

  return (
    <IconButton
      edge="start"
      color={"inherit"}
      // className={classes.menuButton}
      onClick={onClick}
    >
      <ArrowBackIcon />
    </IconButton>
  );
};

export default BackArrowButton;
