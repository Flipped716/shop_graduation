<template>
  <div class="rolesContainer">
    <!-- 面包屑导航; -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部按钮区域 -->
      <div>
        <el-button type="primary"
                   @click="addRoleDialogVisible=true">添加角色</el-button>
      </div>
      <!-- 底部表格区域 -->
      <el-table :data="rolesList"
                stripe
                border
                size="mini">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['borderBottom',i1===0?'borderTop':'','portraitCenter']"
                    v-for="(item1,i1) in scope.row.children"
                    :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag type="danger"
                        closable
                        @close="removeRightById(scope.row,item1.id,item1.authName)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-back"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row :class="[i2===0?'':'borderTop','portraitCenter']"
                        v-for="(item2,i2) in item1.children"
                        :key="item2.id">
                  <!-- 二级 -->
                  <el-col :span="6">
                    <el-tag type="warning"
                            closable
                            @close="removeRightById(scope.row,item2.id,item2.authName)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-back"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="18">
                    <el-tag type="primary"
                            closable
                            v-for="(item3) in item2.children"
                            :key="item3.id"
                            @close="removeRightById(scope.row,item3.id,item3.authName)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称"
                         prop="roleName"></el-table-column>
        <el-table-column label="角色描述"
                         prop="roleDesc"></el-table-column>
        <el-table-column label="操作"
                         width="288px">
          <template slot-scope="scope">
            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini"
                       @click="showEditRoleDialog(scope.row)">编辑</el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini"
                       @click="deleteRoleDialog(scope.row)">删除</el-button>
            <el-button type="warning"
                       icon="el-icon-setting"
                       size="mini"
                       @click="showSetRightsDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 展示分配角色权限对话框 -->
    <el-dialog title="分配角色权限"
               :visible.sync="setRightsDialogVisible"
               width="50%"
               @close="setRightsDialogClose">
      <!-- 权限列表树形结构 -->
      <el-tree :data="rightsList"
               :props="rightsListTreeProps"
               show-checkbox
               default-expand-all
               :default-checked-keys="rightsListDefaultCheckedKeys"
               node-key="id"
               ref="treeRef"></el-tree>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色"
               :visible.sync="addRoleDialogVisible"
               width="50%"
               @close="addRoleDialogClose">
      <el-form :model="addRoleForm"
               :rules="addRoleFormRules"
               ref="addRoleFormRef"
               label-width="90px"
               label-position="right"
               status-icon>
        <el-form-item label="角色名称:"
                      prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述:"
                      prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色信息"
               :visible.sync="editRoleDialogVisible"
               width="50%"
               @close="editRoleDialogClose">
      <el-form :model="editRoleForm"
               :rules="addRoleFormRules"
               ref="editRoleFormRef"
               label-width="80px"
               label-position="right"
               status-icon>
        <el-form-item label="角色名称:">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述:"
                      prop="email">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rolesList: [], // 角色权限列表
      setRightsDialogVisible: false, // 展示分配角色权限的对话框
      rightsList: [], // 所有权限列表
      // 树形控件的属性绑定对象
      rightsListTreeProps: {
        label: 'authName',
        children: 'children'
      },
      rightsListDefaultCheckedKeys: [], // 默认选中的节点的数组
      nowClickRoleId: '', // 当前点击的分配角色的id

      addRoleDialogVisible: false, // 添加角色对话框的显示与隐藏
      addRoleForm: {
        // 添加角色对象
        roleName: '',
        roleDesc: ''
      },
      addRoleFormRules: {
        // 添加角色的表单验证
        // 角色名称验证
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 1, max: 18, message: '长度在 1 到 18 个字符', trigger: 'blur' }
        ],
        // 角色描述验证
        roleDesc: [
          { required: false, message: '请输入角色描述', trigger: 'blur' },
          { min: 0, max: 20, message: '长度在 0 到 20 个字符', trigger: 'blur' }
        ]
      },

      editRoleDialogVisible: false, // 修改角色对话框的显示与隐藏
      editRoleForm: {},
      editRoleName: '' // 修改后的角色信息对象
      // editRoleFormRules: {
      //   // 修改角色的表单验证
      //   // 角色名称验证
      //   roleName: [
      //     { required: true, message: '请输入角色名称', trigger: 'blur' },
      //     { min: 1, max: 18, message: '长度在 1 到 18 个字符', trigger: 'blur' }
      //   ],
      //   // 角色描述验证
      //   roleDesc: [
      //     { required: false, message: '请输入角色描述', trigger: 'blur' },
      //     { min: 0, max: 20, message: '长度在 0 到 20 个字符', trigger: 'blur' }
      //   ]
      // }
    };
  },
  created () {
    this.getRolesList();
  },
  methods: {
    // 获取角色列表数据
    async getRolesList () {
      const { data: res } = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          message: '获取角色列表失败',
          type: 'error',
          duration: 1000
        });
      }
      this.rolesList = res.data;
    },
    // 根据id删除对应权限
    async removeRightById (role, id, authName) {
      // 弹框提示用户是否删除
      const confirmResult = await this.$confirm(
        `您将删除 ${role.roleName} 的'${authName}'权限，是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err);
      if (confirmResult !== 'confirm') {
        return this.$message({
          showClose: true,
          message: `您取消了删除 ${role.roleName} 的'${authName}'的权限`,
          type: 'info',
          duration: 1500
        });
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${id}`
      );
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          message: `删除 ${role.roleName} 的'${authName}'权限失败`,
          type: 'error',
          duration: 1500
        });
      }
      role.children = res.data;
    },
    // 展示分配角色权限对话框
    async showSetRightsDialog (role) {
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree');
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          message: '获取权限列表失败',
          type: 'error',
          duration: 1500
        });
      }
      // 将该角色的id保存在data中，供后续使用
      this.nowClickRoleId = role.id;
      // 获取到的权限列表数据保存在data中
      this.rightsList = res.data;
      console.log(this.rightsList);

      // 递归获取三级节点的id
      this.getThirdRightsKeys(role, this.rightsListDefaultCheckedKeys);

      this.setRightsDialogVisible = true;
    },
    // 通过递归的形式，获取所有角色的三级权限id，并保存在rightsListDefaultCheckedKeys中
    getThirdRightsKeys (node, arr) {
      // 如果当前node节点中不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }

      node.children.forEach(item => {
        this.getThirdRightsKeys(item, arr);
      });
    },
    // 分配角色权限对话框关闭时
    setRightsDialogClose () {
      this.rightsListDefaultCheckedKeys = [];
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedNodes()
      ];
      const idStr = keys.join(',');
      const { data: res } = await this.$http.post(
        `roles/${this.nowClickRoleId}/rights`,
        {
          rids: idStr
        }
      );
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          message: `为该角色分配权限失败`,
          type: 'error',
          duration: 1500
        });
      }
      // 授权成功后的弹框
      this.$message({
        showClose: true,
        message: `为该角色分配权限成功`,
        type: 'success',
        duration: 1500
      });
      this.getRolesList();
      this.setRightsDialogVisible = false;
    },
    // 点击添加角色对话框中确定按钮时进行预验证并添加新角色
    addRole () {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        // 可以发起添加新角色的请求
        const { data: res } = await this.$http.post('roles', this.addRoleForm);
        if (res.meta.status !== 201) {
          this.$message({
            showClose: true,
            message: '添加新角色失败',
            type: 'error',
            duration: 1500
          });
        }
        this.$message({
          showClose: true,
          message: '添加新角色成功',
          type: 'success',
          duration: 1500
        });
        // 隐藏添加角色对话框
        this.addRoleDialogVisible = false;
        // 重新获取角色列表
        this.getRolesList();
      });
    },
    // 关闭添加角色对话框
    addRoleDialogClose () {
      this.$refs.addRoleFormRef.resetFields();
    },
    // 删除对应角色
    async deleteRoleDialog (role) {
      // 询问用户是否删除对应角色
      console.log(role);
      const confirmResult = await this.$confirm(
        `您将删除角色 ${role.roleName} ，是否继续?`,
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
      const { data: res } = await this.$http.delete(`roles/${role.id}`);
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: `删除角色 ${role.roleName} 失败`,
          duration: 1500
        });
      }
      this.getRolesList();
      this.$message({
        showClose: true,
        type: 'success',
        message: `删除角色 ${role.roleName} 成功`,
        duration: 1500
      });
    },

    // 展示修改角色对话框时根据 id 查询对应角色的信息
    async showEditRoleDialog (showRole) {
      console.log(showRole);
      const { data: res } = await this.$http.get(`roles/${showRole.id}`);
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: `获取角色 ${showRole.roleName} 信息失败`,
          duration: 1500
        });
      }
      this.editRoleForm = res.data;
      console.log('123');
      console.log(this.editRoleForm);
      this.editRoleDialogVisible = true;
    },
    // 点击对话框中确定按钮时进行预验证并修改角色信息
    editRole () {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        // 发起修改角色信息的请求
        const { data: res } = await this.$http.put(
          `roles/${this.editRoleForm.roleId}`,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          }
        );
        if (res.meta.status !== 200) {
          return this.$message({
            showClose: true,
            message: '修改该用角色信息失败',
            type: 'error',
            duration: 1500
          });
        }
        this.editRoleDialogVisible = false; // 关闭对话框
        // 刷新角色列表
        this.getRolesList();
        // 提示用户修改成功
        this.$message({
          showClose: true,
          message: '修改该角色信息成功',
          type: 'success',
          duration: 1500
        });
      });
    },
    // 修改用户对话框关闭后重置表单
    editRoleDialogClose () {
      this.$refs.editRoleFormRef.resetFields();
    }
  }
};
</script>

<style lang="less" scoped>
.rolesContainer {
  margin-bottom: 60px;
}
.el-tag {
  margin: 7px;
}
.borderTop {
  border-top: 1px solid #eee;
}
.borderBottom {
  border-bottom: 1px solid #eee;
}
.el-icon-back {
  color: #000;
  transform: rotate(180deg);
}
.portraitCenter {
  display: flex;
  align-items: center;
}
</style>
