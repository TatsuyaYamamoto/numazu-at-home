import React from "react";

import A from "../components/helper/A";

const t28TwitterUrl = `https://twitter.com/T28_tatsuya`;
const contactUrl = `https://docs.google.com/forms/d/e/1FAIpQLSe5bSPvJ5XQM0IACqZ9NKoHuRUAcC_V1an16JGwHh6HeGd-oQ/viewform?usp=pp_url&entry.326070868=Numazu@Home`;
const takeoutUrl = `https://numazukanko.jp/feature/cheer-for-numazu/top`;

const helps = [
  {
    title: "このWebサイトはなんですか？",
    body: (
      <>
        &emsp;沼津市が立ち上げた
        <A href={takeoutUrl} target="_blank">
          "テイクアウト de ステイホーム"
        </A>
        がより盛り上がることを願って
        <A href={t28TwitterUrl} target="_blank">
          有志
        </A>
        が作成した、<b>非公式アプリ</b>です。
        "#おうちでぬまづ"ハッシュタグがついたTwitter,
        Instagramの投稿を引用し、新着順に見ることが出来ます。
        <br />
        &emsp;以下のことが行えるように、順次機能追加する予定です。ご希望の機能がありましたらお問い合わせください。
        <ul style={{ paddingInlineStart: 20, lineHeight: 1 }}>
          <li>
            その他のハッシュタグ(#お届けぬまづ、#ぬまづ応援隊)に対応する。
          </li>
          <li>お店への注文をサポートする(Googleフォーム、LINE通知の活用)。</li>
        </ul>
      </>
    ),
  },
  {
    title: `"テイクアウト de ステイホーム"とはなんですか？`,
    body: (
      <>
        &emsp;沼津市が立ち上げた、「テイクアウトなど民間団体の取り組みの情報の集約や、お取り寄せサイトなど事業者と消費者をつなげる」
        <b>応援サイト、およびその活動のこと</b>
        です。テイクアウトや、SNSを通じた買い物によって沼津のお店や産業を応援するための、各種施策が紹介されています。
        <br />
        <br />
        <A
          href="https://numazukanko.jp/feature/cheer-for-numazu/top"
          target="_blank"
        >
          テイクアウト de ステイホーム 公式ホームページ
        </A>
      </>
    ),
  },
  {
    title: "沼津のお店(事業者)の人は、どのように使うのですか？",
    body: (
      <>
        &emsp;"テイクアウト de ステイホーム"に則って、
        <b>ハッシュタグを付けてTwitter, Instagramに投稿</b>してください。
        <br />
        &emsp;Numazu@Homeは、引用可能な投稿を順次表示することで、
        <b>投稿がより広く閲覧されること</b>を応援します。
      </>
    ),
  },
  {
    title: "お店の利用者は、どのように使うのですか？",
    body: (
      <>
        &emsp;新しい投稿（お店・商品）を見つけて、買って、シェアして、沼津を応援しましょう！
        <br />
        &emsp;Numazu@Homeは、投稿を見つける機能を提供することで、
        <b>応援したいお店を見つけること</b>を応援します。
      </>
    ),
  },
  {
    title: "料金等は、どのようになっていますか？",
    body: (
      <>
        &emsp;このWebサイトはどのような機能に対しても、<b>無料で使用できます</b>
        。また<b>広告の設置も行いません</b>。
      </>
    ),
  },
  {
    title: "投稿コンテンツの扱いは、どのようになっていますか？",
    body: (
      <>
        &emsp;Numazu@Homeは、ハッシュタグがついた投稿を
        <b>引用・表示するWebサイト</b>です。 Twitter, Instagramに投稿された
        <b>コンテンツの所有者は投稿者にあります</b>
        。Twitter,
        Instagramの規約を尊重し、所有者から削除を求められたユーザーコンテンツまたはその他の情報を削除します。
      </>
    ),
  },
  {
    title: "Numazu@Homeに関する問い合わせは、どのように行うのですか？",
    body: (
      <>
        開発者(
        <A href={t28TwitterUrl} target="_blank">
          @T28_tatsuya
        </A>
        )までDM、または
        <A href={contactUrl} target="_blank">
          問い合わせフォーム
        </A>
        からご連絡ください。
      </>
    ),
  },
];

export default helps;
