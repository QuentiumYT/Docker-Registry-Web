const webpack = require('webpack');
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const extractSass = new MiniCssExtractPlugin({
  filename: 'css/[name].css',
});

const jsonFiles = new CopyWebpackPlugin({
  patterns: [{
    from: '*.html',
    to: '[name][ext]',
    context: 'app',
    globOptions: {
      ignore: [
        '**/index.html',
      ],
    },
  }, {
    from: 'favicon.ico',
    to: '[name][ext]',
    context: 'app',
  }, {
    from: '*.json',
    to: 'app/[name][ext]',
    context: 'app',
  }],
});

const indexHTML = new HtmlWebpackPlugin({
  filename: 'index.html',
  template: 'app/index.html',
  hash: true,
});

module.exports = {
  mode: process.argv[process.argv.indexOf('--mode') + 1],
  module: {
    rules: [{
      test: /\.html$/,
      use: {
        loader: 'html-loader',
        options: {
          minimize: true,
        },
      },
    }, {
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          sourceMap: true,
        },
      },
    }, {
      test: /\.css$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
      },
      {
        loader: 'css-loader',
        options: {
          sourceMap: true,
        },
      }],
    }, {
      test: /\.(ttf|eot|svg|woff|woff2)$/,
      type: 'asset/resource',
      generator: {
        filename: './fonts/[name][ext]',
      },
    }, {
      test: /\.png$/,
      type: 'asset/resource',
      generator: {
        filename: './img/[name][ext]',
      },
    }, {
      test: /svg\/.+\.svg$/,
      type: 'asset/resource',
      generator: {
        filename: './img/[name][ext]',
      },
    }],
  },
  plugins: [
    extractSass,
    jsonFiles,
    indexHTML,
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
  ],
  entry: {
    app: {
      import: './app/app.js',
      dependOn: ['angular', 'angular_web', 'angular_ui', 'angular_moment'],
    },
    angular: {
      import: 'angular',
      runtime: 'runtime',
    },
    angular_web: {
      import: [
        'angular-route',
        'angular-resource',
        'angular-sanitize',
      ],
      runtime: 'runtime',
    },
    angular_ui: {
      import: [
        'angular-filter',
        'angular-ui-bootstrap',
      ],
      runtime: 'runtime',
    },
    angular_moment: {
      import: 'angular-moment',
      dependOn: 'angular',
    },
  },
  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        terserOptions: {
          compress: true,
          keep_fnames: false,
          keep_classnames: false,
          mangle: false,
        },
      }),
    ],
    minimize: true,
    chunkIds: 'natural',
    splitChunks: {
      chunks: 'all',
    },
    usedExports: 'global',
  },
  devServer: {
    historyApiFallback: true,
    port: 9000,
    host: '0.0.0.0',
    static: [path.resolve(__dirname, 'app')],
    proxy: {
      '/v2': {
        secure: false,
        xforward: false,
        target: `http://${process.env.DOCKER_REGISTRY_HOST || 'localhost'}:${process.env.DOCKER_REGISTRY_PORT || 5005}`,
      },
    },
  },
};
