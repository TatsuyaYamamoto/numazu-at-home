import React, { FC } from "react";
import styled from "styled-components";

import { version } from "../../../package.json";

const StyledText = styled.span<{ fontSize: number }>`
  font-family: "Acme", sans-serif;
  font-size: ${({ fontSize }) => fontSize}px;
  color: white;
`;

interface AppVersionProps {
  fontSize?: number;
}

const AppVersion: FC<AppVersionProps> = (props) => {
  const { fontSize = 16 } = props;

  return <StyledText fontSize={fontSize}>{`v${version}`}</StyledText>;
};

export default AppVersion;
