const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs');
const prefixer = require('autoprefixer');

// Look for .html files
const htmlFiles = [];
const directories = ['src'];
while (directories.length > 0) {
  const directory = directories.pop();
  const dirContents = fs.readdirSync(directory).map((file) => path.join(directory, file));

  htmlFiles.push(...dirContents.filter((file) => file.endsWith('.html')));
  directories.push(...dirContents.filter((file) => fs.statSync(file).isDirectory()));
}

module.exports = {
  mode: 'production',
  entry: './src/js/main.js',
  output: {
    filename: '[name][chunkhash].js',
    path: path.resolve(__dirname, './docs'),
    clean: true,
  },
  devtool: 'source-map',
  plugins: [
    ...htmlFiles.map(
      (htmlFile) =>
        new HtmlWebpackPlugin({
          template: htmlFile,
          filename: htmlFile.replace(path.normalize('src/'), ''),
          inject: true,
        }),
    ),
  ],
  module: {
    rules: [
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.html$/i,
        use: 'html-loader',
      },
      {
        test: /\.(png|jpg|ico)$/i,
        type: 'asset',
        use: [
          {
            loader: 'image-webpack-loader',
            options: {
              pngquant: {
                quality: [0.9, 0.95],
              },
            },
          },
        ],
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 10kb
          },
        },
        generator: {
          filename: 'assets/images/[name]-[hash][ext]',
        },
      },
      {
        test: /\.(webmanifest)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/i,
        type: 'asset/resource',
        generator: {
          // filename: 'fonts/[name]-[hash][ext][query]'
          filename: 'fonts/[name][ext][query]',
        },
      },
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: () => [prefixer],
              },
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.(xml)$/,
        type: 'asset/resource',
        generator: {
          filename: 'sitemap.xml',
        },
      },
      {
        test: /\.(txt)$/,
        type: 'asset/resource',
        generator: {
          filename: 'robots.txt',
        },
      },
    ],
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
      chunks: 'all',
      maxSize: 244000,
      minSize: 2000,
      minRemainingSize: 0,
      minChunks: 1,
    },
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
          compress: {
            drop_console: true, // Remove any console.log statements from minified files
          },
        },
      }),
    ],
    usedExports: true,
  },
};
