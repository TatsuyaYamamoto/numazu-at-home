import React, { FC } from "react";

import styled from "styled-components";
import { Theme } from "@material-ui/core";

import HelpListItem from "./HelpListItem";

import helps from "../../../assets/helps";
import Container from "../../atoms/Container";

const Root = styled.div<{ theme: Theme }>``;

const HelpList: FC = (props) => {
  const { ...others } = props;

  return (
    <Root {...others}>
      <Container>
        {helps.map((help, index) => (
          <HelpListItem key={index} title={help.title} body={help.body} />
        ))}
      </Container>
    </Root>
  );
};

export default HelpList;
