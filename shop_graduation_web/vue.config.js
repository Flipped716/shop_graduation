// 此操作需要在 src 目录下新建两个文件 main-prod.js 和 main-dev.js 这两个文件中的代码和 main.js 一样
// externals 打包资源大小的改变
// plugin 是改变开发和生产时不同时期的网站的标题显示的文本（提示是否为开发模式）
// module.exports = {
//   chainWebpack: config => {
//     // 发布模式
//     config.when(process.env.NODE_ENV === 'production', config => {
//       config
//         .entry('app')
//         .clear()
//         .add('./src/main-prod.js');

//       config.set('externals', {
//         vue: 'Vue',
//         'vue-router': 'VueRouter',
//         axios: 'axios',
//         lodash: '_',
//         echarts: 'echarts',
//         nprogress: 'NProgress',
//         'vue-quill-editor': 'VueQuillEditor'
//       });

//       config.plugin('html').tap(args => {
//         args[0].isProd = true;
//         return args;
//       });
//     });

//     // 开发模式
//     config.when(process.env.NODE_ENV === 'development', config => {
//       config
//         .entry('app')
//         .clear()
//         .add('./src/main-dev.js');

//       config.plugin('html').tap(args => {
//         args[0].isProd = false;
//         return args;
//       });
//     });
//   }
// };
