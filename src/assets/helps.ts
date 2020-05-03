const t28TwitterUrl = `https://twitter.com/T28_tatsuya`;
const contactUrl = ``;
const takeoutUrl = `https://numazukanko.jp/feature/cheer-for-numazu/top`;

const helps = [
  {
    title: "このアプリはなんですか？",
    body: `
&emsp;沼津市が立ち上げた"<a href="${takeoutUrl}" target="_blank">テイクアウト de ステイホーム</a>"がより盛り上がることを願って<a href="${t28TwitterUrl}" target="_blank">有志</a>が作成した、<b>非公式アプリ</b>です。
"#おうちでぬまづ"ハッシュタグがついたInstagramの投稿を引用し、新着順に見ることが出来ます。

&emsp;以下のことが行えるように、順次機能追加する予定です。ご希望の機能がありましたらお問い合わせください。
<ul style="padding-inline-start: 20px; line-height: 1">
  <li>Twitterの投稿の引用に対応する。</li>
  <li>その他のハッシュタグ(#お届けぬまづ、#ぬまづ応援隊)に対応する。</li>
  <li>お店への注文をサポートする(Googleフォーム、LINE通知の活用)。</li>
</ul>
`.trim(),
  },
  {
    title: `"テイクアウト de ステイホーム"とはなんですか？`,
    body: `
&emsp;沼津市が立ち上げた、「テイクアウトなど民間団体の取り組みの情報の集約や、お取り寄せサイトなど事業者と消費者をつなげる」<b>応援サイト、およびその活動のこと</b>です。テイクアウトや、SNSを通じた買い物によって沼津のお店や産業を応援するための、各種施策が紹介されています。

<a href="https://numazukanko.jp/feature/cheer-for-numazu/top" target="_blank">テイクアウト de ステイホーム 公式ホームページ</a>
`.trim(),
  },
  {
    title: "沼津のお店(事業者)の人は、どのように使うのですか？",
    body: `
&emsp;"テイクアウト de ステイホーム"に則って、<b>ハッシュタグを付けてInstagramに投稿</b>してください。

&emsp;Numazu@Homeは、引用可能な投稿を順次表示することで、<b>投稿がより広く閲覧されること</b>を応援します。

`.trim(),
  },
  {
    title: "お店の利用者(沼津を支える人)は、どのように使うのですか？",
    body: `
&emsp;新しい投稿（お店・商品）を見つけて、買って、シェアして、沼津を応援しましょう！

&emsp;Numazu@Homeは、投稿を見つける機能を提供することで、<b>応援したいお店を見つけること</b>を応援します。
`.trim(),
  },
  {
    title: "料金等は、どのようになっていますか？",
    body: `
&emsp;このアプリ今後も含めたどのような機能に対しても<b>無料で使用できます</b>。また<b>広告の設置も行いません</b>。
`,
  },
  {
    title: "投稿コンテンツの扱いは、どのようになっていますか？",
    body: `
&emsp;Numazu@Homeは、ハッシュタグがついた投稿を<b>引用・表示するアプリ</b>です。
Instagramに投稿された<b>コンテンツの所有者は投稿者にあります</b>。Instagramの規約を尊重し、所有者から削除を求められたユーザーコンテンツまたはその他の情報を削除します。
`,
  },
  {
    title: "アプリに関する問い合わせは、どのように行うのですか？",
    body: `
アプリ開発者(<a href="${t28TwitterUrl}" target="_blank">@T28_tatsuya</a>)までDM、または<a href="${contactUrl}" target="_blank">問い合わせフォーム</a>からご連絡ください。
`.trim(),
  },
];

export default helps;
