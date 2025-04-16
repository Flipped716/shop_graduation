<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header class="home_header"
               height="59px">
      <div class="home_header_left"
           @click="returnWelcomePage">
        <img src="./../assets/logo.png"
             alt="服饰商城管理系统" />
        <span>服饰商城管理系统</span>
      </div>
      <!-- 顶部菜单栏区域 -->
      <el-menu :default-active="saveLinkPath"
               class="el-menu-demo home_aside_menu"
               mode="horizontal"
               text-color="#fff"
               background-color="#2b4b6b"
               active-text-color="#ffd04b"
               :unique-opened="true"
               :collapse-transition="false"
               :router="true">
        <!-- 一级菜单 -->
        <el-submenu :index="item.id + ''"
                    v-for="item in menuList"
                    :key="item.id"
                    :show-timeout=showTimeout>
          <template slot="title">
            <!-- 一级菜单图标 -->
            <i :class="[iconfont(), iconList[item.id]]"></i>
            <!-- 一级菜单文本 -->
            <span class="firstMenuText">{{ item.authName }}</span>
            <!-- 一级菜单模板 -->
          </template>
          <!-- 二级菜单 -->
          <el-menu-item :index="'/' + index.path"
                        v-for="index in item.children"
                        :key="index.id"
                        @click="saveLinkState('/' + index.path)"
                        class="secondMenu">
            <!-- 二级菜单模板 -->
            <template slot="title">
              <!-- 二级菜单图标 -->
              <i :class="[iconfont(), iconChildrenList[index.id]]"
                 class="secondMenuI"></i>
              <!-- 二级菜单文本 -->
              <span class="secondMenuText">{{ index.authName }}</span>
            </template>
          </el-menu-item>
        </el-submenu>
      </el-menu>
      <span class="displayUsername">{{saveUsername}}，您好！</span>
      <el-button type="danger"
                 plain
                 @click="loginExit">退出
      </el-button>
    </el-header>
    <!-- 主题区域 -->
    <el-container class="home_container">
      <!-- 内容主体 -->
      <el-main class="home_main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单
      menuList: [],
      iconList: {
        125: 'icon-yonghuguanli',
        103: 'icon-quanxianguanli',
        101: 'icon-shangpinguanli-jianying',
        102: 'icon-dingdanguanli',
        145: 'icon-shujutongjixuanzhong',
      },
      iconChildrenList: {
        110: 'icon-user-list',
        111: 'icon-role-list',
        112: 'icon-quanxianliebiao',
        104: 'icon-shangpinliebiao',
        115: 'icon-class',
        121: 'icon-01_shangpinfenlei',
        107: 'icon-dingdanliebiao',
        146: 'icon-shujubaobiao',
      },
      showTimeout: 0,
      saveLinkPath: '', // 高亮显示的二级菜单
      saveUsername: '',
    };
  },
  created() {
    this.getMenuList();
    this.saveLinkPath = window.sessionStorage.getItem('saveLinks');
    this.saveUsername = window.sessionStorage.getItem('loginUsername');
  },
  methods: {
    // 退出
    loginExit() {
      // // 询问用户是否退出
      // const confirmResult = this.$confirm(
      //   `是否确定退出？`,
      //   '提示',
      //   {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      //   }
      // ).catch(err => err);
      // // 如果用户确认删除，返回字符串 confirm
      // // 如果用户取消删除，返回字符串 cancel
      // // console.log(confirmResult);
      // if (confirmResult !== 'confirm') {
      //   return this.$message({
      //     showClose: true,
      //     type: 'info',
      //     message: '已取消退出',
      //     duration: 1500
      //   });
      // }
      window.sessionStorage.clear();
      this.$router.push('/login');
    },
    // 获取菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus');
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          message: res.meta.msg,
          type: 'error',
          duration: 1000,
        });
      }
      this.menuList = res.data;
      console.log(res);
    },
    // 统一加的字体类
    iconfont() {
      return 'iconfont';
    },
    // 保存链接的激活状态
    saveLinkState(saveLinkPath) {
      window.sessionStorage.setItem('saveLinks', saveLinkPath);
      this.saveLinkPath = saveLinkPath;
    },
    returnWelcomePage() {
      this.$router.replace('/welcome');
      this.saveLinkPath = '';
    },
  },
};
// http://gdfrk.cn/UNhVY
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
  width: 100%;
  .home_header {
    display: flex;
    justify-content: space-between;
    background-color: #2b4b6b;
    padding-left: 5px;
    align-items: center;
    color: #fff;
    font-size: 23px;
    .home_header_left {
      display: flex;
      align-items: center;
      cursor: pointer;
      img {
        width: 53px;
        height: 51px;
      }
      span {
        margin-left: 10px;
      }
    }
  }
  .home_container {
    .iconfont {
      margin-right: 8px;
    }
  }
  .home_main {
    background-color: #eaedf1;
  }
}
.el-menu-item {
  width: 50px;
}
.firstMenuText {
  margin-left: 10px;
}
.secondMenuText {
  margin-left: 5px;
}
.secondMenuI {
  margin-left: 10px;
}
.secondMenuI:hover {
  background-color: #2b4b6b;
}
.displayUsername {
  font-size: 14px;
  margin-left: 50px;
  color: antiquewhite;
}
</style>
