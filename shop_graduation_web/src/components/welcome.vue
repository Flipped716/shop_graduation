<template>
  <div class="welcome_container">
    <h1>{{this.returnLoginUsername()}},欢迎登录服饰商城管理系统</h1>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // username: this.returnLoginUsername()
    };
  },
  methods: {
    returnLoginUsername () {
      return window.sessionStorage.getItem('loginUsername');
    }
  }
};
</script>

<style lang="less" scoped>
.welcome_container {
  h1{
    font-size: 20px;
  }
}
</style>
