import { FC, useEffect } from "react";
import { AppProps } from "next/app";
import Head from "next/head";

import { Provider } from "react-redux";

import {
  ThemeProvider as MuiThemeProvider,
  StylesProvider,
} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider as SCThemeProvider } from "styled-components";

import { FirebaseContextProvider } from "../components/hooks/useFirebase";
import theme from "../theme";
import config from "../config";
import { store } from "../modules/store";

import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

import "react-virtualized/styles.css";

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
      <Provider store={store}>
        <SCThemeProvider theme={theme}>
          <MuiThemeProvider theme={theme}>
            {/* https://material-ui.com/guides/interoperability/#controlling-priority-%EF%B8%8F-3 */}
            <StylesProvider injectFirst={true}>
              {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
              <CssBaseline />

              <FirebaseContextProvider
                initParams={{ options: config.firebaseConfigs }}
              >
                <Component {...pageProps} />
              </FirebaseContextProvider>
            </StylesProvider>
          </MuiThemeProvider>
        </SCThemeProvider>
      </Provider>
    </>
  );
};

export default MyApp;
