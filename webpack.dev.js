const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 8080,
    hot: 'only',
    liveReload: false,
    historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      logging: 'warn',
      progress: false,
      reconnect: true,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    compress: true,
    open: false,
    watchFiles: {
      paths: ['src/**/*'],
      options: {
        usePolling: false,
        interval: 1000,
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: "manifest.json", to: "" },
        { from: "icon-192.png", to: "" },
        { from: "icon-512.png", to: "" },
        { from: "favicon.ico", to: "" },
        { from: "service-worker.js", to: "" },
      ],
    }),
    new Dotenv(),
  ],
}; 