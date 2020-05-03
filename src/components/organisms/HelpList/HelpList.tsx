import React, { FC } from "react";

import styled from "styled-components";
import { Theme } from "@material-ui/core";

import HelpListItem from "./HelpListItem";

import helps from "../../../assets/helps";

const Root = styled.div<{ theme: Theme }>``;

const HelpList: FC = (props) => {
  const { ...others } = props;

  return (
    <Root {...others}>
      {helps.map((help, index) => (
        <HelpListItem key={index} title={help.title} body={help.body} />
      ))}
    </Root>
  );
};

export default HelpList;
