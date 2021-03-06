export const isProduction = process.env.nodeEnv === "production";

const origin = isProduction
  ? `https://numazu-at-home.web.app`
  : `https://numazu-at-home-dev.web.app`;

const defaultOgpImageUrl = `${origin}/assets/images/default.jpg`;

const config = {
  production: isProduction,
  origin,
  defaultOgpImageUrl,
  firebaseConfigs: isProduction
    ? {
        apiKey: "AIzaSyDKBiY-8QfnlFUq36qc9CrSorYyXPN6Jz4",
        authDomain: "numazu-at-home.firebaseapp.com",
        databaseURL: "https://numazu-at-home.firebaseio.com",
        projectId: "numazu-at-home",
        storageBucket: "numazu-at-home.appspot.com",
        messagingSenderId: "717558044057",
        appId: "1:717558044057:web:73030439626a1a8ddaaf08",
        measurementId: "G-F72NXRMYH6",
      }
    : {
        apiKey: "AIzaSyDJbhkgR8E-AifQdhDHD0PY42g9hNU1rmI",
        authDomain: "numazu-at-home-dev.firebaseapp.com",
        databaseURL: "https://numazu-at-home-dev.firebaseio.com",
        projectId: "numazu-at-home-dev",
        storageBucket: "numazu-at-home-dev.appspot.com",
        messagingSenderId: "312539538020",
        appId: "1:312539538020:web:c2b4c2438ad7f88e947571",
        measurementId: "G-N2GCS2Z39X",
      },
  algolia: isProduction
    ? {
        appId: "H47NSWHKI8",
        apiKey: "625eba0c203b69eecd3bad154008ebc3",
        indexName: "numazu-at-home",
      }
    : {
        appId: "H47NSWHKI8",
        apiKey: "625eba0c203b69eecd3bad154008ebc3",
        indexName: "numazu-at-home-dev",
      },
};

export default config;
