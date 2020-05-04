import styled, { keyframes } from "styled-components";
import { FC } from "react";

const animation = keyframes`
  0% {
    background-position: -468px 0;
}

  100% {
    background-position: 468px 0;
}
`;

const Internal = styled.div`
  background: #d3e6fa;
  background-image: linear-gradient(
    to right,
    #d3e6fa 0%,
    #c3d0f8 20%,
    #d3e6fa 40%,
    #d3e6fa 100%
  );
  background-repeat: no-repeat;
  background-size: 800px 800px;
  display: inline-block;
  position: relative;

  animation: ${animation} 1.5s linear infinite;
`;

interface ShimmerProps {
  width?: number | string;
  height?: number | string;
}
const Shimmer: FC<ShimmerProps> = (props) => {
  const { width = "100%", height = 16 } = props;

  return (
    <Internal
      css={`
        width: ${typeof width === "number" ? `${width}px` : width};
        height: ${typeof height === "number" ? `${height}px` : height};
      `}
    />
  );
};

export default Shimmer;
