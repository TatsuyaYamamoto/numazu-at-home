import { FC, useEffect } from "react";
import { AppProps } from "next/app";
import Head from "next/head";

import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider as SCThemeProvider } from "styled-components";

import { FirebaseContextProvider } from "../components/hooks/useFirebase";
import theme from "../theme";
import config from "../config";

import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const MyApp: FC<AppProps> = (props) => {
  const { Component, pageProps } = props;

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    jssStyles?.parentElement?.removeChild(jssStyles);
  }, []);

  return (
    <>
      <Head>
        <title>My page</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <SCThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />

          <FirebaseContextProvider
            initParams={{ options: config.firebaseConfigs }}
          >
            <Component {...pageProps} />
          </FirebaseContextProvider>
        </MuiThemeProvider>
      </SCThemeProvider>
    </>
  );
};

export default MyApp;
