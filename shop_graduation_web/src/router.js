import Vue from 'vue';
import Router from 'vue-router';

// 登录
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ './components/login.vue');
// 主页
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ './components/home.vue');
// 欢迎页面
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ './components/welcome.vue');

// 用户列表
const Users = () => import(/* webpackChunkName: "users" */ './components/user/users.vue');

// 角色列表
const Roles = () => import(/* webpackChunkName: "roles_rights" */ './components/power/roles.vue');
// 权限列表
const Rights = () => import(/* webpackChunkName: "roles_rights" */ './components/power/rights.vue');

// 商品列表
const Goods = () => import(/* webpackChunkName: "goods_add_cate_orders" */ './components/good/goods.vue');
// 商品添加列表
const Add = () => import(/* webpackChunkName: "goods_add_cate_orders" */ './components/good/add.vue');
// 分类参数
const Params = () => import(/* webpackChunkName: "goods_add_cate_orders" */ './components/good/params.vue');
// 商品分类
const Categories = () => import(/* webpackChunkName: "goods_add_cate_orders" */ './components/good/cate.vue');

// 订单列表
const Orders = () => import(/* webpackChunkName: "orders" */ './components/order/orders.vue');

// 数据报表
const Reports = () => import(/* webpackChunkName: "reports" */ './components/report/reports.vue');

// import Login from './components/login.vue'; // 登录
// import Home from './components/home.vue'; // 主页

// import Welcome from './components/welcome.vue'; // 欢迎页面

// import Users from './components/user/users.vue'; // 用户列表
// import Roles from './components/power/roles.vue'; // 角色列表
// import Rights from './components/power/rights.vue'; // 权限列表
// import Goods from './components/good/goods.vue'; // 商品列表
// import Add from './components/good/add.vue'; // 商品添加列表
// import Params from './components/good/params.vue'; // 分类参数
// import Categories from './components/good/cate.vue'; // 商品分类
// import Orders from './components/order/orders.vue'; // 订单列表
// import Reports from './components/report/reports.vue'; // 数据报表

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/login' // redirect重定向
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          component: Welcome
        },
        {
          path: '/users',
          component: Users
        },
        {
          path: '/roles',
          component: Roles
        },
        {
          path: '/rights',
          component: Rights
        },
        {
          path: '/goods',
          component: Goods
        },
        {
          path: '/goods/add',
          component: Add
        },
        {
          path: '/params',
          component: Params
        },
        {
          path: '/categories',
          component: Categories
        },
        {
          path: '/orders',
          component: Orders
        },
        {
          path: '/reports',
          component: Reports
        }
      ]
    }

  ]
});

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要跳转的路径；from 从哪个路径过来；next事一个函数，表示放行 next()放行，next('/login')强制跳转到login页面
  if (to.path === '/login') { return next(); }
  // 先获取token
  const tokenStr = window.sessionStorage.getItem('loginToken');
  if (!tokenStr) { return next('/login'); }
  next();
});

export default router;
