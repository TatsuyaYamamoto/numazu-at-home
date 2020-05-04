const env = {
  nodeEnv: process.env.NODE_ENV,
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
  distDir: "../dist/functions/next",
};
