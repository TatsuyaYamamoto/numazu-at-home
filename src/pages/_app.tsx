import React, { FC, useCallback, useEffect } from "react";
import { AppProps } from "next/app";
import Head from "next/head";

import { Provider } from "react-redux";

import {
  ThemeProvider as MuiThemeProvider,
  StylesProvider,
} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider as SCThemeProvider } from "styled-components";

import useGa from "../components/hooks/useGa";
import { FirebaseContextProvider } from "../components/hooks/useFirebase";
import theme from "../theme";
import config from "../config";
import { store } from "../modules/store";
import { Ogp, Title } from "../components/helper/meta";

import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

import "react-virtualized/styles.css";

const MyApp: FC<AppProps> = (props) => {
  const { Component, pageProps, router } = props;
  const { init: initGa, logPageView, logError } = useGa();

  useEffect(() => {
    // GA
    initGa();
    logPageView();
    router.events.on("routeChangeComplete", logPageView);

    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    jssStyles?.parentElement?.removeChild(jssStyles);

    // Fatal error handling
    window.onerror = (message, file, lineNo, colNo, error) => {
      const errorDetail = { message, file, lineNo, colNo, error };
      requestErrorDetailContact(errorDetail);
    };

    window.addEventListener("unhandledrejection", (e) => {
      requestErrorDetailContact(e.reason);
    });
  }, []);

  const requestErrorDetailContact = useCallback(
    (errorDetail: any) => {
      const { userAgent, language } = navigator;
      const { location } = window;

      const info = {
        error: errorDetail,
        userAgent,
        language,
        location,
      };

      logError(JSON.stringify(info), true);

      if (
        confirm(
          "予期せぬエラーが発生してしまいました。\n\n恐れ入りますが、問い合わせフォームを起動してエラーの詳細を送信して頂けませんでしょうか？(エラーの情報は自動で入力されます。)"
        )
      ) {
        const detail = `${btoa(
          unescape(encodeURIComponent(JSON.stringify(info)))
        )}`;
        const contactFormUrl = `https://docs.google.com/forms/d/e/1FAIpQLSe5bSPvJ5XQM0IACqZ9NKoHuRUAcC_V1an16JGwHh6HeGd-oQ/viewform?usp=pp_url&entry.1991364045=%E4%B8%8D%E5%85%B7%E5%90%88%E5%A0%B1%E5%91%8A...+/+Bug+Report&entry.326070868=DLCode&entry.1884055698=${detail}`;
        window.location.href = contactFormUrl;
      } else {
        // tslint:disable-next-line:no-console
        console.error(info);
      }
    },
    [logError]
  );

  return (
    <>
      <Title>Numazu@Home</Title>
      <Ogp url={config.origin} />
      <Head>
        {!config.production && (
          <meta name="robots" content="noindex , nofollow" />
        )}
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <meta
          name="description"
          content="Numazu@Homeは、「沼津」と「沼津のお店」と「沼津のお店を利用する皆さん」をサポートするアプリです。"
        />
        <meta
          name="keywords"
          content="沼津,沼津市,テイクアウト de ステイホーム,おうちでぬまづ,お届けぬまづ,ぬまづ応援隊,テイクアウト,デリバリー"
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
