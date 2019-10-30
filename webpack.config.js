const path = require("path");

module.exports = {
  entry: { app: "./src/app.js" },
  module: {},
  resolve: {
    extensions: [".js"]
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
  },
  externals: {
    phaser: "Phaser"
  },
  devServer: {
    publicPath: "/dist/",
    contentBase: path.resolve(__dirname, "."),
    watchContentBase: true,
    watchOptions: {
      ignored: /\.sw.$/
    },
    overlay: true,
    stats: {
      assets: false,
      hash: false,
      chunks: false,
      errors: true,
      errorDetails: true
    }
  },
  devtool: "eval-source-map"
};
