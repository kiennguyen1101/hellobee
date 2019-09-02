const Webpack = require("webpack");
const Glob = require("glob");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const CleanObsoleteChunks = require('webpack-clean-obsolete-chunks');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const LiveReloadPlugin = require('webpack-livereload-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const outputPath = `${__dirname}/static/`;

const env = process.env.NODE_ENV || "development";

const configurator = {
  entries: function () {
    var entries = {
      application: [
        './assets/css/application.scss',
      ],
    }

    Glob.sync("./assets/*/*.*").forEach((entry) => {
      if (entry === './assets/css/application.scss') {
        return
      }

      let key = entry.replace(/(\.\/assets\/(src|js|jsx|css|go)\/)|\.(ts|js|s[ac]ss|go)/g, '')
      if (key.startsWith("_") || (/(ts|js|jsx|s[ac]ss|go)$/i).test(entry) == false) {
        return
      }

      if (entries[key] == null) {
        entries[key] = [entry]
        return
      }

      entries[key].push(entry)
    })
    return entries
  },

  // resolve: {
  // extensions: [".js", ".scss"], // extensions that are used
  // modules: [path.join(process.cwd(), "src"), "node_modules"], // directories where to look for modules
  // alias: {
  // '@': resolve(''),
  // 'Components': resolve('../src/components'),
  // 'Models': resolve('../src/models'),
  // 'Service': resolve('../src/services'),
  // 'Utils': resolve('../src/utils')
  // }
  // },

  plugins() {
    var plugins = [
      new Webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("production")
        }
      }),
      new CleanObsoleteChunks(),
      // new Webpack.ProvidePlugin({$: "jquery",jQuery: "jquery"}),
      new MiniCssExtractPlugin({ filename: "[name].[hash:8].css" }),
      new CopyWebpackPlugin(
        ["./assets/css/bulma_grid.css", { from: "./assets", to: "" },],
        { copyUnmodified: true, ignore: ["css/**", "js/**", "src/**"] }),
      new Webpack.LoaderOptionsPlugin({ minimize: true, debug: false }),
      new ManifestPlugin({ fileName: "manifest.json" })
    ];


    plugins.push(new CleanWebpackPlugin(["static"], {
      root: process.cwd()
    }))
    return plugins
  },

  moduleOptions: function () {
    return {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: "babel-loader"
          }
        },      
        {
          test: /\.s[ac]ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: "css-loader", options: { sourceMap: process.env === 'development' ? true : false } },
            { loader: "sass-loader", options: { sourceMap: process.env === 'development' ? true : false } }
          ]
        },
        { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },
        { test: /\.jsx?$/, loader: "babel-loader", exclude: /node_modules/ },
        { test: /\.(woff|woff2|ttf|svg)(\?v=\d+\.\d+\.\d+)?$/, use: "url-loader" },
        { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: "file-loader" },
        // { test: require.resolve("jquery"),use: "expose-loader?jQuery!expose-loader?$"},
        // { test: /\.go$/, use: "gopherjs-loader"}
      ]
    }
  },

  buildConfig: function () {

    var config = {
      mode: env,
      entry: configurator.entries(),
      output: { filename: "[name].[hash:8].js", path: outputPath },
      plugins: configurator.plugins(),
      module: configurator.moduleOptions(),
      resolve: {
        extensions: ['.ts', '.js', '.json']
      },
      optimization: {
        splitChunks: {
          cacheGroups: {
            vendor: {
              test: /node_modules/,
              chunks: "initial",
              name: "vendor",
              priority: 10,
              enforce: true
            },
            commons: {
              name: "commons",
              chunks: "initial",
              minChunks: 2,
              minSize: 10240  //10k bytes
            },
          }
        }
      }
    }

    if (env === "development") {
      config.plugins.push(new LiveReloadPlugin({ appendScriptTag: true }))
      return config
    }

    if (env === 'production') {
      const uglifier = new UglifyJsPlugin({
        uglifyOptions: {
          beautify: false,
          mangle: { keep_fnames: true },
          output: { comments: false },
          compress: {}
        }
      });

      config.optimization = {
        ...config.optimization,
        minimizer: [uglifier,],
      }
    }

    return config
  }
}

module.exports = configurator.buildConfig()