import React, { FC } from "react";
import styled from "styled-components";

const StyledText = styled.span<{ fontSize: number }>`
  font-family: "Acme", sans-serif;
  font-size: ${({ fontSize }) => fontSize}px;
  color: white;
`;

interface LogoProps {
  fontSize?: number;
}

const Logo: FC<LogoProps> = (props) => {
  const { fontSize = 14 } = props;

  return <StyledText fontSize={fontSize}>{`Numazu@Home`}</StyledText>;
};

export default Logo;
