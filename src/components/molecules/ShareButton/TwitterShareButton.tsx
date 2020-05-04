import React, { FC } from "react";
import { Fab, SvgIcon } from "@material-ui/core";

// @ts-ignore
import TwitterBrands from "../../atoms/svg/twitter-brands.svg";

interface TwitterShareButtonProps {
  text: string;
  url: string;
}

const TwitterShareButton: FC<TwitterShareButtonProps> = (props) => {
  const { url } = props;

  const onClick = () => {
    const baseUrl = "https://twitter.com/intent/tweet";
    const encodedUrl = encodeURIComponent(url);
    const hashtags = encodeURIComponent(
      ["沼津", "おうちでぬまづ", "そこんところ工房", "numazu_at_home"].join(",")
    );

    window.open(`${baseUrl}?url=${encodedUrl}&hashtags=${hashtags}`);
  };

  return (
    <Fab
      onClick={onClick}
      css={`
        // https://www.schemecolor.com/twitter-blue-color.php
        background-color: #1da1f2;
        color: white;

        &:hover {
          background-color: #1784c7;
        }
      `}
    >
      <SvgIcon>
        <TwitterBrands />
      </SvgIcon>
    </Fab>
  );
};

export default TwitterShareButton;
