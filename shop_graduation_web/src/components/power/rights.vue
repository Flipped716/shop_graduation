<template>
  <div class="rightsContainer">
    <!-- 面包屑导航; -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="rightsList"
                stripe
                border
                size="mini">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称"
                         prop="authName"></el-table-column>
        <el-table-column label="路径"
                         prop="path"></el-table-column>
        <el-table-column label="等级"
                         prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level==='0'"
                    type="danger">一级</el-tag>
            <el-tag v-else-if="scope.row.level==='1'"
                    type="warning">二级</el-tag>
            <el-tag v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rightsList: [] // 权限列表数据
    };
  },
  created () {
    this.getRightsList();
  },
  methods: {
    // 获取权限列表数据
    async getRightsList () {
      const { data: res } = await this.$http.get('rights/list');
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: '获取权限列表失败',
          duration: 1000
        });
      }
      this.rightsList = res.data;
    }
  }
};
</script>

<style lang="less" scoped>
.rightsContainer{
  margin-bottom: 60px;
}
</style>
