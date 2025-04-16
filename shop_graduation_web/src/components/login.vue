<template>
  <div class="login_container">
    <div class="login_title">
      <h1>服饰商城管理系统</h1>
    </div>
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="login_avatar_box">
        <!-- ./../assets/logo.png -->
        <img :src="loginImg ? loginImg : default_img" alt="用户头像" />
      </div>
      <!-- 登陆表单区域 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        label-width="70px"
        class="lofin_form_box"
        :label-position="labelPosition"
        :rules="loginFormRules"
      >
        <!-- 用户名 -->
        <el-form-item label="用户名:" prop="username">
          <el-input
            type="text"
            prefix-icon="iconfont icon-icon"
            v-model="loginForm.username"
            placeholder="请输入用户名"
            @keyup.native="imgDisplay"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <!-- @keyup.enter.native="login" -->
        <el-form-item label="密码:" prop="password">
          <el-input
            type="password"
            prefix-icon="iconfont icon-mima"
            v-model="loginForm.password"
            placeholder="请输入密码"
            @keyup.enter.native="login"
          ></el-input>
        </el-form-item>
        <!-- 登录按钮 -->
        <el-form-item class="login_btns_box">
          <el-button type="primary" :plain="true" @click="login"
            >登录</el-button
          >
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      labelPosition: "left",
      loginForm: {
        username: "",
        password: "",
      },
      // 表单的验证规则对象
      loginFormRules: {
        // 验证用户名
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
        ],
        // 验证密码
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 18,
            message: "密码长度在 6 到 18 个字符",
            trigger: "blur",
          },
        ],
      },
      loginImg: "", // 用户头像
      default_img: require("./../assets/logo.png"), // 默认头像,为什么要引入本地的静态图片，而不直接使用路径。是因为webpack底层会将图片转换成base64格式的图片，直接在img标签上写本地图片路径，会找不到此图片
    };
  },
  created() {},
  methods: {
    // 登录预验证
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("login", this.loginForm);
        if (res.meta.status !== 200) {
          this.$message({
            showClose: true,
            message: "登陆失败，用户名或者密码错误",
            type: "error",
            duration: 1000,
          });
          this.loginForm.password = "";
          return;
        } else {
          this.$message({
            showClose: true,
            message: "登录成功",
            type: "success",
            duration: 1000,
          });
          // console.log(res);
          // 将登陆成功之后的 token 保存在客户端的 sessionStorage 中
          //   项目中出现登陆之外的其他 API 接口必须登陆后才可以访问
          //   token 只应在当前网站打开期间生效，所以 token 保存在 essionStorage 中
          window.sessionStorage.setItem("loginToken", res.data.token);
          JSON.stringify(
            window.sessionStorage.setItem("loginUsername", res.data.username)
          );
          // 通过编程式导航跳转到主页 /home
          this.$router.push("/home");
        }
      });
    },

    // 重置按钮
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    },
    imgDisplay() {
      let loginInImgDisplay =
        // eslint-disable-next-line eqeqeq
        this.loginForm.username == "admin" ||
        // eslint-disable-next-line eqeqeq
        this.loginForm.username == "boos" ||
        // eslint-disable-next-line eqeqeq
        this.loginForm.username == "director" ||
        // eslint-disable-next-line eqeqeq
        this.loginForm.username == "manager" ||
        // eslint-disable-next-line eqeqeq
        this.loginForm.username == "plan";
      if (loginInImgDisplay) {
        this.loginImg = require("./../assets/loginin.png");
      } else {
        this.loginImg = "";
      }
    },
    // loginImg
  },
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
  margin: 0;
  padding: 0;
  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .login_avatar_box {
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #eee;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    .lofin_form_box {
      position: absolute;
      bottom: 0;
      width: 80%;
      margin-left: 40px;
      .login_btns_box {
        display: flex;
        justify-content: flex-end;
        margin-right: 20px;
      }
    }
  }
}
.login_title {
  position: absolute;
  left: 10px;
  top: -20px;
  color: #faebd7;
}
</style>
