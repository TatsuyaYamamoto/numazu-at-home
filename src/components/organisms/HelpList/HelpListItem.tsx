import React, { FC } from "react";
import styled from "styled-components";

const Root = styled.div`
  margin: 40px 0;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: bold;
`;

const Body = styled.div`
  margin-top: 1em;
  white-space: pre-wrap;
`;

interface HelpListItemProps {
  title: string;
  body: React.ReactElement;
}
const HelpListItem: FC<HelpListItemProps> = (props) => {
  const { title, body } = props;

  return (
    <Root>
      <Title>{title}</Title>
      <Body>{body}</Body>
    </Root>
  );
};

export default HelpListItem;
