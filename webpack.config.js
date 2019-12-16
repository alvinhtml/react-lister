//webpack

const path = require('path')
const webpack = require('webpack') //webpack 插件
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin') //抽离 css 文件，使用这个插件需要单独配置JS和CSS压缩
const UglifyJsPlugin = require('uglifyjs-webpack-plugin') //压缩JS
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin') //压缩CSS
// const FileManagerPlugin = require('filemanager-webpack-plugin'); //webpack copy move delete mkdir archive


module.exports = {

  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin()
    ]
  },

  mode: 'development',

  devtool: 'source-map',

  //入口
  entry: {
    index: './app/index.tsx'
  },

  //出口
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    library: 'react-lister',  // 类库名称
    libraryTarget: 'umd'  // 类库打包方式
  },

  resolve: {
    modules: [path.resolve('node_modules')],
    alias: {
      '~': path.resolve(__dirname, './app')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss', '.css'] //配置省略后缀名
  },

  // 不打包 react 和 react-dom
  externals: {
    react: 'react',
    'react-dom': 'react-dom'
  },


  //规则
  module: {
    rules: [{
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              includePaths: ['./node_modules/normalize-scss/sass']
            }
          }
        ]
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ['ts-loader']
      },
      {
        test: /\.(jpg|png|gif|jpeg|bmp|eot|svg|ttf|woff|woff2)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 20 * 1024,
            outputPath: './',
          }
        }
      }
    ]
  },

  //插件
  plugins: [
    // new HtmlWebpackPlugin({
    //     template: './app/index.html',
    //     filename: 'index.html',
    //     // minify: {
    //     //     removeComments: true,
    //     //     removeAttributeQuotes: true,
    //     //     collapseWhitespace: true
    //     // },
    //     hash: true,
    //     chunks: ['index']
    // }),
    new MiniCssExtractPlugin({
        filename: 'lister.css'
    })
  ],

  watch: true,
  watchOptions: {
      poll: 2000,
      aggregateTimeout: 2000,
      ignored: /node_modules|vendor|build|public|resources/
  },

  devServer: {
    port: 8080,
    progress: true,
    contentBase: './dist',
    open: true,
    historyApiFallback: true,
  }
}
