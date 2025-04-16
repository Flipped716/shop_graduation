import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import filter from "./filter.js"; // 引入过滤器（时间 date-fns）
import "./plugins/element.js";
import "./assets/fonts/iconfont.css"; // 导入字体图标
import "./assets/css/global.css"; // 导入全局样式表
import ZkTable from "vue-table-with-tree-grid"; // 导入vue-table-with-tree-grid插件
import VueQuillEditor from "vue-quill-editor"; // 导入vue-quill-editor富文本编辑器
// 导入富文本编辑器的全局样式
import "quill/dist/quill.core.css"; // import styles
import "quill/dist/quill.snow.css"; // for snow theme
import "quill/dist/quill.bubble.css";

import axios from "axios";
import VueLazyload from "vue-lazyload";
import loading from "./assets/loading.gif"; // 图片懒加载

// 导入nprogress
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor /* { default global options } */); // 引入图片
Vue.use(VueLazyload, {
  // 将图片懒加载注册为全局可用的组件
  loading,
});

// 定义时间过滤器
// Vue.filter('dateFormat', function (originVal) {
//   const dt = new Date(originVal * 1000);

//   const y = dt.getFullYear();
//   const m = (dt.getMonth() + 1 + '').padStart(2, '0');
//   const d = (dt.getDate() + '').padStart(2, '0');

//   const hh = (dt.getHours() + '').padStart(2, '0');
//   const mm = (dt.getMinutes() + '').padStart(2, '0');
//   const ss = (dt.getSeconds() + '').padStart(2, '0');

//   return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
// });

axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"; // 配置请求根路径
// 在 request 拦截器中展示进度条 Nprogress.start()
axios.interceptors.request.use((config) => {
  NProgress.start();
  console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem("loginToken");
  // 最后必须return config
  return config;
});
// 在 response 拦截器中展示进度条 Nprogress.done()
axios.interceptors.response.use((config) => {
  NProgress.done();
  return config;
});
Vue.prototype.$http = axios;

Vue.config.productionTip = false;

Vue.component("tree-table", ZkTable); // for bubble theme

new Vue({
  filter,
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
