<template>
  <div class="usersContainer">
    <!-- 面包屑导航; -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框和添加区域 -->
      <div>
        <el-row :gutter="20">
          <el-col :span="7">
            <el-input placeholder="请输入查询关键词"
                      v-model="queryInfo.query"
                      clearable
                      @clear="getUserList">
              <el-button slot="append"
                         icon="el-icon-search"
                         @click="getUserList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary"
                       @click="addUsersDialogVisible = true">添加用户</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 渲染表格区域 -->
      <el-table :data="userList"
                stripe
                border
                size="mini">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="用户名"
                         prop="username"></el-table-column>
        <el-table-column label="邮箱"
                         prop="email"></el-table-column>
        <el-table-column label="电话"
                         prop="mobile"></el-table-column>
        <el-table-column label="角色"
                         prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state"
                       active-color="#13ce66"
                       inactive-color="#ff4949"
                       @change="userStateChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作"
                         width="178px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-tooltip content="编辑用户"
                        placement="top-end"
                        :enterable="false">
              <el-button type="primary"
                         icon="el-icon-edit"
                         size="small"
                         @click="showEditUsersDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 删除 -->
            <el-tooltip content="删除用户"
                        placement="top"
                        :enterable="false">
              <el-button type="danger"
                         icon="el-icon-delete"
                         size="small"
                         @click="deleteUserDialog(scope.row.id, scope.row.username)"></el-button>
            </el-tooltip>
            <!-- 分配角色 -->
            <el-tooltip content="分配角色"
                        placement="top-start"
                        :enterable="false">
              <el-button type="warning"
                         icon="el-icon-setting"
                         size="small"
                         @click="setUserRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <div class="block">
        <el-pagination @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       :current-page="queryInfo.pagenum"
                       :page-sizes="[1, 2, 5, 10]"
                       :page-size="queryInfo.pagesize"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="total">
        </el-pagination>
      </div>
    </el-card>

    <!-- 添用户区域 -->
    <el-dialog title="添加用户"
               :visible.sync="addUsersDialogVisible"
               width="50%"
               @close="addUsersDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addUsersForm"
               :rules="addUsersFormRules"
               ref="addUsersFormRef"
               label-width="70px"
               label-position="left"
               status-icon>
        <el-form-item label="用户名:"
                      prop="username">
          <el-input v-model="addUsersForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码:"
                      prop="password">
          <el-input v-model="addUsersForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱:"
                      prop="email">
          <el-input v-model="addUsersForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机:"
                      prop="mobile">
          <el-input v-model="addUsersForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addUsersDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户"
               :visible.sync="editUsersDialogVisible"
               width="50%"
               @close="editUsersDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editUsersForm"
               :rules="editUsersFormRules"
               ref="editUsersFormRef"
               label-width="70px"
               label-position="top"
               status-icon>
        <el-form-item label="用户名:">
          <el-input v-model="editUsersForm.username"
                    :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱:"
                      prop="email">
          <el-input v-model="editUsersForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机:"
                      prop="mobile">
          <el-input v-model="editUsersForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editUsersDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 为用户分配角色的对话框 -->
    <el-dialog title="分配角色"
               :visible.sync="setRoleDialogVisible"
               width="50%"
               @close="setRoleDialogClose">
      <div>
        <p>当前的用户：{{ userRole.username }}</p>
        <p>当前用户的角色：{{ userRole.role_name }}</p>
        <p>
          分配新角色：<el-select v-model="selectRoleId"
                     placeholder="请选择">
            <el-option v-for="item in userRoleList"
                       :key="item.id"
                       :label="item.roleName"
                       :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="userNewRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 验证邮箱的自定义校验规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      if (!value) {
        return callback(new Error('邮箱不能为空'));
      }
      if (!regEmail.test(value)) {
        return callback(new Error('请输入合法的邮箱'));
      }
      callback();
    };
    // 验证电话的自定义校验规则
    var checkMobile = (rule, value, callback) => {
      const checkMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (!value) {
        return callback(new Error('电话不能为空'));
      } else if (!checkMobile.test(value)) {
        return callback(new Error('请输入合法的电话号码'));
      }
      callback();
    };
    return {
      addUsersDialogVisible: false, // 添加用户对话框的显示与隐藏
      editUsersDialogVisible: false, // 修改用户对话框的显示与隐藏
      setRoleDialogVisible: false, // 为用户分配角色的对话框
      // 获取用户列表的参数对象
      queryInfo: {
        query: '', // 查询参数
        pagenum: 1, // 当前页码
        pagesize: 5 // 每页显示条数
      },
      userList: [], // 用户列表
      total: 0, // 总条数
      addUsersForm: {
        // 添加用户对象
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editUsersForm: {
        // 查询到的用户信息
      },
      // 添加用户表单验证对象
      addUsersFormRules: {
        // 用户名验证
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 18, message: '长度在 3 到 18 个字符', trigger: 'blur' }
        ],
        // 密码验证
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 18,
            message: '密码长度在 6 到 18 个字符',
            trigger: 'blur'
          }
        ],
        // 邮箱验证
        email: [{ required: true, validator: checkEmail, trigger: 'blur' }],
        // 电话验证
        mobile: [{ required: true, validator: checkMobile, trigger: 'blur' }]
      },
      // 修改用户表单验证对象
      editUsersFormRules: {
        // 邮箱验证
        email: [{ required: true, validator: checkEmail, trigger: 'blur' }],
        // 电话验证
        mobile: [{ required: true, validator: checkMobile, trigger: 'blur' }]
      },
      userRole: {}, // 需要被分配角色的用户信息
      userRoleList: [], // 角色数据列表
      selectRoleId: '' // 为用户分配的新角色的 id
    };
  },
  created () {
    this.getUserList();
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          message: '获取用户列表失败!',
          type: 'error',
          duration: 1500
        });
      }
      this.userList = res.data.users;
      this.total = res.data.total;
      console.log('123');
      console.log(res);
    },
    // 监听最新的 pagesize（每页显示的数目） 的改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听 current-page 当前页面改变后触发
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 获取 switch 的状态的改变
    async userStateChange (userinfo) {
      console.log(userinfo);
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message({
          showClose: true,
          message: `修改用户 ${userinfo.username} 状态失败！`,
          type: 'error',
          duration: 1500
        });
      }
      this.$message({
        showClose: true,
        message: `修改用户 ${userinfo.username} 状态成功！`,
        type: 'success',
        duration: 1500
      });
    },
    // 添加用户对话框关闭后，重置添加表单
    addUsersDialogClosed () {
      this.$refs.addUsersFormRef.resetFields();
    },
    // 点击对话框中确定按钮时进行预验证并添加新用户
    addUser () {
      this.$refs.addUsersFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        // 可以发起添加用户的请求
        const { data: res } = await this.$http.post('users', this.addUsersForm);
        if (res.meta.status !== 201) {
          this.$message({
            showClose: true,
            message: '添加新用户失败',
            type: 'error',
            duration: 1500
          });
        }
        this.$message({
          showClose: true,
          message: '添加新用户成功',
          type: 'success',
          duration: 1500
        });
        // 隐藏添加用户对话框
        this.addUsersDialogVisible = false;
        // 重新获取用户列表
        this.getUserList();
      });
    },
    // 修改用户
    async showEditUsersDialog (id) {
      const { data: res } = await this.$http.get(`users/${id}`);
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          message: '查询用户信息失败',
          type: 'error',
          duration: 1500
        });
      }
      this.editUsersForm = res.data;
      this.editUsersDialogVisible = true;
    },
    // 修改用户对话框关闭后，重置表单
    editUsersDialogClosed () {
      this.$refs.editUsersFormRef.resetFields();
    },
    // 点击对话框中确定按钮时进行预验证并修改新用户
    editUser () {
      this.$refs.editUsersFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        // 发起修改用户的请求
        const { data: res } = await this.$http.put(
          `users/${this.editUsersForm.id}`,
          {
            email: this.editUsersForm.email,
            mobile: this.editUsersForm.mobile
          }
        );
        if (res.meta.status !== 200) {
          return this.$message({
            showClose: true,
            message: '修改该用户信息失败',
            type: 'error',
            duration: 1500
          });
        }
        // 关闭对话框
        this.editUsersDialogVisible = false;
        // 刷新用户列表
        this.getUserList();
        // 提示修改成功
        this.$message({
          showClose: true,
          message: '修改该用户信息成功',
          type: 'success',
          duration: 1500
        });
      });
    },
    // 删除指定用户
    async deleteUserDialog (id, username) {
      // 询问用户是否删除
      const confirmResult = await this.$confirm(
        `您将删除 ${username} 用户，是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err);
      // 如果用户确认删除，返回字符串 confirm
      // 如果用户取消删除，返回字符串 cancel
      // console.log(confirmResult);
      if (confirmResult !== 'confirm') {
        return this.$message({
          showClose: true,
          type: 'info',
          message: '已取消删除',
          duration: 1500
        });
      }
      const { data: res } = await this.$http.delete(`users/${id}`);
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: `删除用户 ${username} 失败`,
          duration: 1500
        });
      }
      // const nowPageNum = this.total % this.queryInfo.pagesize;
      // console.log(nowPageNum);
      if (this.queryInfo.pagesize === 1) {
        this.queryInfo.pagenum = 1;
      } else if (this.queryInfo.pagesize > 1) {
        if (this.total % this.queryInfo.pagesize === 1) {
          this.queryInfo.pagenum = 1;
        }
      }
      this.getUserList();
      this.$message({
        showClose: true,
        type: 'success',
        message: `删除用户 ${username} 成功`,
        duration: 1500
      });
    },
    // 为用户分配角色
    async setUserRole (userRole) {
      this.userRole = userRole; // 需要被分配角色的用户信息
      // 展示所有的角色列表
      const { data: res } = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: '获取角色列表失败',
          duration: 1500
        });
      }
      this.userRoleList = res.data;
      this.setRoleDialogVisible = true;
    },
    // 为用户分配新角色后确定
    async userNewRole () {
      // 用户没有选择新的角色
      if (!this.selectRoleId) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: '请选择新的角色',
          duration: 1500
        });
      }
      // 为用户分配新角色成功后
      const { data: res } = await this.$http.put(
        `users/${this.userRole.id}/role`,
        {
          rid: this.selectRoleId
        }
      );
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: '获取角色列表失败',
          duration: 1500
        });
      }
      this.setRoleDialogVisible = false;
      this.getUserList();
      this.$message({
        showClose: true,
        message: '为该用户分配新角色成功',
        type: 'success',
        duration: 1500
      });
    },
    // 分配角色对话框关闭后将 select 恢复默认
    setRoleDialogClose () {
      this.selectRoleId = '';
      this.userRole = {};
    }
  }
  // watch: {
  //   deleteUserDialog () {
  //     if (this.total % this.queryInfo.pagesize <= 1) {
  //       this.getUserList();
  //       this.queryInfo.pagenum = 1;
  //     }
  //     this.getUserList();
  //   }
  // }
};
</script>

<style lang="less" scoped>
.usersContainer {
  margin-bottom: 60px;
}
.block {
  margin-top: 15px;
}
</style>
