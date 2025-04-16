import Vue from 'vue';

// 使用格式化时间插件date-fns
import format from 'date-fns/format';
Vue.filter('dateFormat', function (value, pattern = 'yyyy-MM-dd HH:mm:ss') { // YYYY-MM-DD HH:mm:ss
  return format(value * 1000, pattern);
});

export default {};
