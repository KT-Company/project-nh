const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const webpack = require('webpack')
let cesiumSource = "./node_modules/cesium/Source";
let cesiumWorkers = "Cesium/Workers";
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");
const {
    getPort
} = require('portfinder-sync')
const port = getPort(8000);
// 本地运行vue-cli-service serve --mode dev 的时候 ServerSign = 'dev ';
const ServerSign = process.argv[4] || 'dev';
// 打包时候 运行vue-cli-service build    BuildSign = 'dev';
// 打印process.argv可以看到,node运行的命令所带的参数.
const BuildSign = process.argv[3] || 'dev';
// 根据入口来设置pages 
function setPage() {
  const utilObj = {
    template: './public/index.html',
    filename: "index.html",
    title: "南京航空航天大学",
  }
  const pages = new Map([
    ['dev',{
      dev: {
        entry: "./src/main.ts",
        ...utilObj
      }
    }],
    ['2d', {
      "2d": {
        entry: "./src/2d/main.ts",
        ...utilObj
      }
    }],
    ['3d', {
      "3d": {
        entry: "./src/3d/main.ts",
        ...utilObj
      }
    }]
  ])
 
  let page = {
  }; // 如果是PC首页则是index:{...},如果是h5首页,则是h5:{...}
  if (process.env.NODE_ENV == 'development') {
    // 开发环境下,运行不同的命令,打开不同的项目首页
    page = pages.get(ServerSign) || pages.get('dev');
  } else {
    // 生产环境下
    page = pages.get(BuildSign) || pages.get('dev');
  }
  return page;
}

module.exports = {
    parallel: false,
    lintOnSave: false,
    publicPath: "./",
    outputDir:`dist/` ,
    pages: setPage(),
    filenameHashing: true,
    configureWebpack: { // 配置自动导入插件
      plugins: [
        AutoImport({
          resolvers: [ElementPlusResolver()],
        }),
        Components({
          resolvers: [ElementPlusResolver()],
        }),
        new CopyWebpackPlugin([{
          from: path.join(cesiumSource, cesiumWorkers),
          to: "Workers"
        }, ]),
        new CopyWebpackPlugin([{
          from: path.join(cesiumSource, "Assets"),
          to: "Assets"
        }, ]),
        new CopyWebpackPlugin([{
          from: path.join(cesiumSource, "Widgets"),
          to: "Widgets"
        }, ]),
        new CopyWebpackPlugin([{
          from: path.join(cesiumSource, "ThirdParty/Workers"),
          to: "ThirdParty/Workers",
        }, ]),
        new webpack.DefinePlugin({
          CESIUM_BASE_URL: JSON.stringify("./"),
        }),
      ],
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        fallback: {
          "path": require.resolve("path-browserify"),
          "url": require.resolve("url/"),
          "zlib": require.resolve("browserify-zlib"),
          "https": require.resolve("https-browserify"),
          "http": require.resolve("stream-http"),
          "assert": require.resolve("assert/"),
          "util": require.resolve("util/"),
          "stream": require.resolve("stream-browserify")
        }
      },
      module: {
        unknownContextCritical: false,
        unknownContextRegExp: /\/cesium\/cesium\/Source\/Core\/buildModuleUrl\.js/,
        rules: [{
          test: /\.ts$/,
          loader: 'ts-loader'
        }]
      }
    },
    pluginOptions: {
      'style-resources-loader': {
        preProcessor: 'less',
        patterns: [__dirname,'src/2d/assets/css/global.less']
      },
    },
    devServer: {
        static: {
            directory: './public',
        },
        //host: 'local-ip',
        host:'localhost',
        port,
        allowedHosts:'all',
        hot: true,
        open: true,
        proxy:{
          '/ArcGIS': {
              target: 'http://services.arcgisonline.com',
              changeOrigin: true,
          },
          '/nh': {
              target: 'http://127.0.0.1:7009',
              changeOrigin: true,
          },
        },
        historyApiFallback: true
    },
};