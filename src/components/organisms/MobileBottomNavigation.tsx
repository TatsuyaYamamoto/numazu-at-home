import React, { FC, useState } from "react";
import { NextRouter, useRouter } from "next/router";

import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@material-ui/core";
import { Home as HomeIcon, Search as SearchIcon } from "@material-ui/icons";
import styled from "styled-components";

type NavValue = "home" | "search";

const toNavValue = (router: NextRouter): NavValue => {
  const { asPath } = router;
  if (asPath.startsWith("/search")) {
    return "search";
  }

  return "home";
};

const toPath = (navValue: NavValue): string => {
  if (navValue === "search") {
    return "/search";
  }
  return "/";
};

const StaticBottomNavigationAction = styled(BottomNavigationAction)`
  padding: 16px 12px;

  &.Mui-selected {
    padding-top: 16px;
  }

  & .MuiBottomNavigationAction-label {
    display: none;
  }
`;

const MobileBottomNavigation: FC = () => {
  const router = useRouter();
  const [nav, setNav] = useState<NavValue>(toNavValue(router));

  const onNavChanged = (_: React.ChangeEvent<{}>, value: NavValue) => {
    router.push(toPath(value)).then(() => {
      setNav(value);
    });
  };

  return (
    <Paper
      elevation={2}
      css={`
        color: unset;
        position: fixed;
        bottom: 0;
        width: 100%;
      `}
    >
      <BottomNavigation
        value={nav}
        onChange={onNavChanged}
        showLabels={false}
        css={`
          width: 100%;
        `}
      >
        <StaticBottomNavigationAction
          value="home"
          label="Home"
          icon={<HomeIcon />}
          showLabel={false}
        />
        <StaticBottomNavigationAction
          value="search"
          label="Search"
          icon={<SearchIcon />}
          showLabel={false}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNavigation;
