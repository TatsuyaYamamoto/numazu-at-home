import React, { FC } from "react";

import { IconButton } from "@material-ui/core";
import { HelpOutline as HelpIcon } from "@material-ui/icons";

export interface HelpButtonProps {
  onClick: () => void;
}

export const HelpButton: FC<HelpButtonProps> = (props) => {
  const { onClick } = props;

  return (
    <IconButton
      edge="start"
      color={"inherit"}
      // className={classes.menuButton}
      onClick={onClick}
    >
      <HelpIcon />
    </IconButton>
  );
};

export default HelpButton;
