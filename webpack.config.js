const path = require("path");

module.exports = {
  entry: { app: "./src/app.ts", settingsui: "./src/settingsui.ts" },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
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
