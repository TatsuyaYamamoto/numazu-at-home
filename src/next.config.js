const path = require("path");

const env = {
  nodeEnv: process.env.NODE_ENV,
  gaTrackingId: "UA-127664761-8",
};

const webpack = (config) => {
  config.module.rules.push({
    test: /\.svg$/,
    issuer: {
      test: /\.(js|ts)x?$/,
    },
    use: ["@svgr/webpack"],
  });

  return config;
};

module.exports = {
  env,
  webpack,
  // このparamsが効かないので、next export -o public で指定する。
  // outDir: path.resolve(__dirname, "..", "public"),
};
