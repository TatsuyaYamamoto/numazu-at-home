import React, { FC } from "react";
import Head from "next/head";

import config from "../../config";

export const Title: FC = (props) => (
  <Head>
    <title>{`${config.production ? `` : `[DEV]`}${props.children}`}</title>
  </Head>
);

interface OgpProps {
  title?: string;
  url: string;
  type?: "website" | "article";
  postId?: string;
}

export const Ogp: FC<OgpProps> = (props) => {
  const siteName = "Numazu@Home";
  const { title = siteName, postId, url, type = "website" } = props;
  const imageUrl = postId
    ? `${config.origin}/api/ogp/${postId}`
    : config.defaultOgpImageUrl;

  return (
    <Head>
      <meta property="og:title" content={`${title}`} />
      <meta property="og:type" content={`${type}`} />
      <meta property="og:url" content={`${url}`} />
      <meta property="og:image" content={`${imageUrl}`} />
      <meta property="og:site_name" content={`${siteName}`} />
      <meta
        property="og:description"
        content="Numazu@Homeは、「沼津」と「沼津のお店」と「沼津のお店を利用する皆さん」をサポートするアプリです。"
      />

      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
};
