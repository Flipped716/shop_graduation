<template>
  <div class="cataContainer">
    <!-- 面包屑导航; -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary"
                     @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <!-- https://github.com/MisterTaki/vue-table-with-tree-grid 查看配置详情 -->
      <tree-table class="cate_tree_table"
                  :data="cateList"
                  :columns="columns"
                  :selection-type="false"
                  :show-index="true"
                  index-text=""
                  :expand-type="false"
                  :border="true">

        <!-- 是否有效的作用域插槽 -->
        <template slot="cat_deleted"
                  slot-scope="scope">
          <i class="el-icon-success"
             v-if="scope.row.cat_deleted===false"
             style="color:#67C23A; font-size: 16px;"></i>
          <i class="el-icon-error"
             v-else
             style="color:#F56C6C; font-size: 16px;"></i>
        </template>

        <!-- 排序的作用域插槽 -->
        <template slot="cat_level"
                  slot-scope="scope">
          <el-tag type="danger"
                  v-if="scope.row.cat_level===0"
                  size="medium">一级分类</el-tag>
          <el-tag type="warning"
                  v-else-if="scope.row.cat_level===1"
                  size="medium">二级分类</el-tag>
          <el-tag v-else
                  size="medium">三级分类</el-tag>
        </template>

        <!-- 操作的作用域插槽 -->
        <template slot="cat_operation"
                  slot-scope="scope">
          <el-button type="primary"
                     icon="el-icon-edit"
                     size="small"
                     @click="showEditCateDialog(scope.row)">编辑</el-button>
          <el-button type="danger"
                     icon="el-icon-delete"
                     size="small"
                     @click="deleteCateDialog(scope.row)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[5, 10, 15, 20]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类"
               :visible.sync="addCateDialogVisible"
               width="50%"
               @close="addCateDialogClose">
      <el-form :model="addCateForm"
               :rules="addCateFormRules"
               ref="addCateFormRef"
               label-width="100px">
        <el-form-item label="分类名称："
                      prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options:指定数据源   props:指定配置选项 -->
          <el-cascader v-model="selectedKeys"
                       expand-trigger="hover"
                       :options="parentCateList"
                       :props="cascaderProps"
                       @change="parentCateChange"
                       :clearable="true"
                       :change-on-select="true">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类"
               :visible.sync="editCateDialogVisible"
               width="50%"
               @close="editCateDialogClose">
      <el-form :model="editCateForm"
               :rules="editCateFormRules"
               ref="editCateFormRef"
               label-width="100px">
        <el-form-item label="分类名称"
                      prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类的数据列表
      cateList: [],
      total: 0, // 总数据条数
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 为tree-table指定列
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template', // 表示将当前列定义为模板列
          template: 'cat_deleted' // 是否有效 表示当前这一列使用模板
        },
        {
          label: '排序',
          type: 'template', // 表示将当前列定义为模板列
          template: 'cat_level' // 排序 表示当前这一列使用模板
        },
        {
          label: '操作',
          type: 'template', // 表示将当前列定义为模板列
          template: 'cat_operation' // 操作 表示当前这一列使用模板
        }
      ],
      addCateDialogVisible: false, // 添加分类对话框的显示与隐藏
      addCateForm: {
        // 添加分类的数据对象
        cat_name: '', // 将要添加的分类名称
        cat_pid: 0, // 父级分类的 ID
        cat_level: 0 // 分类层级(默认添加的是一级分类)
      },
      // 添加分类表单的验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的属性
      cascaderProps: {
        value: 'cat_id', // 选择的属性值
        label: 'cat_name', // 看到的属性值
        children: 'children' // 指定选项的子选项为选项对象的某个属性值
      },
      // 选中的父级分类的id数组
      selectedKeys: [],

      editCateDialogVisible: false, // 编辑分类对话框的显示与隐藏
      // 编辑时根据id查询到的数据信息
      editCateForm: {},
      // 编辑对话框验证
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    };
  },
  created () {
    this.getCateList();
  },
  methods: {
    // 获取商品分类列表的分类
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: '获取商品分类数据列表数据失败',
          duration: 1500
        });
      }
      // 把数据列表赋值给 cateList
      console.log(res.data);
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    // 监听分页区域 pagesize 的改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听分页区域 pagenum 的改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 点击添加分类按钮显示对话框
    showAddCateDialog () {
      // 获取父级分类得到数据列表
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 添加分类时获取数据(获取父级分类的数据列表)
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: '获取商品分类数据列表数据失败',
          duration: 1500
        });
      }
      this.parentCateList = res.data;
      console.log(res.data);
    },
    // 级联选择器选择项发生改变时
    parentCateChange () {
      console.log(this.selectedKeys);
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的是父级分类，防止，就说明没有选中父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0;
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击确认按钮添加分类
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message({
            showClose: true,
            type: 'error',
            message: '添加新分类失败',
            duration: 1500
          });
        }
        this.$message({
          showClose: true,
          type: 'success',
          message: '添加新分类成功',
          duration: 1500
        });
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    // 添加分类对话框关闭后清空内容
    addCateDialogClose () {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },

    // 点击编辑按钮弹出编辑对话框
    async showEditCateDialog (editRoleId) {
      console.log(editRoleId.cat_id);
      const { data: res } = await this.$http.get(
        `categories/${editRoleId.cat_id}`
      );
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          message: '获取该分类信息失败',
          type: 'error',
          duration: 1500
        });
      }
      console.log(res.data);
      this.editCateForm = res.data;
      this.editCateDialogVisible = true;
    },
    // 编辑对话框关闭时恢复默认值
    editCateDialogClose () {
      this.$refs.editCateFormRef.resetFields();
    },
    // 点击确定按钮提交修改请求和数据
    editCate () {
      this.$refs.editCateFormRef.validate(async valid => {
        console.log(this.editCateForm);
        const {
          data: res
        } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, {
          cat_name: this.editCateForm.cat_name
        });
        if (res.meta.status !== 200) {
          return this.$message({
            showClose: true,
            message: '修改该分类名称失败',
            type: 'error',
            duration: 1500
          });
        }
        this.editCateDialogVisible = false;
        this.getCateList();
        this.$message({
          showClose: true,
          message: '修改该分类名称成功',
          type: 'success',
          duration: 1500
        });
      });
    },
    // 删除指定分类
    async deleteCateDialog (deleteRoleId) {
      // 询问用户是否删除
      const confirmResult = await this.$confirm(
        `您将删除分类 ${deleteRoleId.cat_name}，是否继续?`,
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
      const { data: res } = await this.$http.delete(
        `categories/${deleteRoleId.cat_id}`
      );
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: `删除分类 ${deleteRoleId.cat_name} 失败`,
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
      this.getCateList();
      this.$message({
        showClose: true,
        type: 'success',
        message: `删除分类 ${deleteRoleId.cat_name} 成功`,
        duration: 1500
      });
    }
  }
};
</script>

<style lang="less" scoped>
.cataContainer {
  margin-bottom: 60px;
}
.cate_tree_table {
  margin-top: 15px;
  margin-bottom: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
