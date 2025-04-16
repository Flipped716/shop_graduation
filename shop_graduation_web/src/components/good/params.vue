<template>
  <div class="paramsContainer">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示注意项 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数"
                type="warning"
                show-icon
                :closable="false">
      </el-alert>
      <!-- 选择商品分类 -->
      <div class="selectGoodsCate">
        <span class="selectGoodsCate_select">选择商品分类：</span>
        <el-cascader expand-trigger="hover"
                     :options="categoriesList"
                     :props="categoriesCascader"
                     v-model="selectedCategoriesKeys"
                     @change="categoriesCascaderChange">
        </el-cascader>
      </div>
      <!-- 动态参数和静态参数切换的tabs标签区域 -->
      <el-tabs v-model="categoriesTabsActiveName"
               @tab-click="categoriesHandleTabsClick">
        <el-tab-pane label="动态参数"
                     name="many">
          <!-- 动态参数 -->
          <el-button type="primary"
                     size="small"
                     :disabled="isTabPaneBtn"
                     @click="addDialogVisible=true">添加动态参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData"
                    :border="true"
                    :stripe="true">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag class="attr_vals_tags"
                        type="success"
                        size="normal"
                        closable
                        @close="deleteTagHandle(scope.row,i)"
                        v-for="(item,i) in scope.row.attr_vals"
                        :key="i">{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input class="input-new-tag"
                          v-if="scope.row.newTagInputVisible"
                          v-model="scope.row.newTagInputValue"
                          ref="newTagSaveTagInputRef"
                          size="small"
                          @keyup.enter.native="newTagHandleInputConfirm(scope.row)"
                          @blur="newTagHandleInputConfirm(scope.row)">
                </el-input>
                <!-- 点击的按钮 -->
                <el-button v-else
                           class="button-new-tag"
                           size="small"
                           @click="newTagShowInput(scope.row)">+ 添加新的{{titleText}}</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index">
            </el-table-column>
            <el-table-column label="参数名称"
                             prop="attr_name"
                             width="600px">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary"
                           size="small"
                           icon="el-icon-edit"
                           @click="showEditParamsDialog(scope.row)">修改</el-button>
                <el-button type="danger"
                           size="small"
                           icon="el-icon-delete"
                           @click="deleteEditParamsDialog(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性"
                     name="only">
          <!-- 静态属性 -->
          <el-button type="primary"
                     size="small"
                     :disabled="isTabPaneBtn"
                     @click="addDialogVisible=true">添加静态属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData"
                    :border="true"
                    :stripe="true">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag class="attr_vals_tags"
                        type="success"
                        size="normal"
                        closable
                        @close="deleteTagHandle(scope.row,i)"
                        v-for="(item,i) in scope.row.attr_vals"
                        :key="i">{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input class="input-new-tag"
                          v-if="scope.row.newTagInputVisible"
                          v-model="scope.row.newTagInputValue"
                          ref="newTagSaveTagInputRef"
                          size="small"
                          @keyup.enter.native="newTagHandleInputConfirm(scope.row)"
                          @blur="newTagHandleInputConfirm(scope.row)">
                </el-input>
                <!-- 点击的按钮 -->
                <el-button v-else
                           class="button-new-tag"
                           size="small"
                           @click="newTagShowInput(scope.row)">+ 添加新的{{titleText}}</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index">
            </el-table-column>
            <el-table-column label="属性名称"
                             prop="attr_name"
                             width="600px">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary"
                           size="small"
                           icon="el-icon-edit"
                           @click="showEditParamsDialog(scope.row)">修改</el-button>
                <el-button type="danger"
                           size="small"
                           icon="el-icon-delete"
                           @click="deleteEditParamsDialog(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加动态参数和静态属性对话框 -->
    <el-dialog :title="'添加' + titleText"
               :visible.sync="addDialogVisible"
               width="50%"
               @close="addDialogVisibleClose">
      <el-form :model="addAttributeForm"
               :rules="addAttributeFormRules"
               ref="addAttributeFormRef"
               label-width="100px">
        <el-form-item :label="titleText"
                      prop="attr_name">
          <el-input v-model="addAttributeForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改动态参数和静态属性对话框 -->
    <el-dialog :title="'修改' + titleText"
               :visible.sync="editDialogVisible"
               width="50%"
               @close="editDialogVisibleClose">
      <el-form :model="editAttributeForm"
               :rules="editAttributeFormRules"
               ref="editAttributeFormRef"
               label-width="100px">
        <el-form-item :label="titleText"
                      prop="attr_name">
          <el-input v-model="editAttributeForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      categoriesList: [], // 商品分类的数据（级联选择框）
      // 指定级联选择器的属性
      categoriesCascader: {
        value: 'cat_id', // 选择的属性值
        label: 'cat_name', // 看到的属性值
        children: 'children' // 指定选项的子选项为选项对象的某个属性值
      },
      // 级联选择框双向绑定到的数组
      selectedCategoriesKeys: [],
      // 被激活的页签
      categoriesTabsActiveName: 'many',
      manyTableData: [], // 动态参数的数据
      onlyTableData: [], // 静态属性的数据
      addDialogVisible: false, // 添加动态参数和静态属性对话框的显示与隐藏
      // 添加动态参数或者静态属性的提交数据
      addAttributeForm: {},
      // 添加动态参数或者静态属性的验证
      addAttributeFormRules: {
        attr_name: [
          {
            required: true,
            message: `请输入${this.titleText}`,
            trigger: 'blur'
          }
        ]
      },
      editDialogVisible: false, // 修改动态参数或者静态属性对话框的显示与隐藏
      // 修改动态参数或者静态属性的验证
      editAttributeFormRules: {
        attr_name: [
          {
            required: true,
            message: `请输入${this.titleText}`,
            trigger: 'blur'
          }
        ]
      },
      // 修改动态参数或者静态属性的提交数据
      editAttributeForm: {
        // 新属性的名字
        // 属性的类型[many或only]
        // 参数的属性值
      }
    };
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isTabPaneBtn () {
      if (this.selectedCategoriesKeys.length !== 3) {
        return true;
      }
      return false;
    },
    // 当前选中的三级分类的id
    categoriesThirdId () {
      if (this.selectedCategoriesKeys.length === 3) {
        return this.selectedCategoriesKeys[2];
      }
      return null;
    },
    // title 属性 添加动态参数和静态属性对话框(共用一个对话框)
    titleText () {
      if (this.categoriesTabsActiveName === 'many') {
        return '动态参数';
      }
      return '静态属性';
    }
  },
  created () {
    this.getCategoriesList();
  },
  methods: {
    // 上方级联选择框的数据
    async getCategoriesList () {
      const { data: res } = await this.$http.get('categories');
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: '获取商品分类数据列表失败',
          duration: 1500
        });
      }
      this.categoriesList = res.data;
    },
    // 级联选择框变化后触发
    categoriesCascaderChange () {
      if (this.selectedCategoriesKeys.length !== 3) {
        this.selectedCategoriesKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      this.getParamsData();
    },
    // tab页签点击的处理函数
    categoriesHandleTabsClick () {
      this.getParamsData();
      console.log(this.categoriesTabsActiveName);
    },
    // 获取参数的数据(下方表格区域的)
    async getParamsData () {
      console.log(this.selectedCategoriesKeys);
      if (this.selectedCategoriesKeys.length !== 3) {
        this.selectedCategoriesKeys = [];
        return this.$message({
          showClose: true,
          type: 'error',
          message: '选择失败，请选择三级分类下的分类名称',
          duration: 1500
        });
      }
      // 证明选中的是三级分类
      // 根据所选分类的id和tabs的面板发起请求
      const {
        data: res
      } = await this.$http.get(
        `categories/${this.categoriesThirdId}/attributes`,
        { params: { sel: this.categoriesTabsActiveName } }
      );
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: '获取该分类参数失败',
          duration: 1500
        });
      }

      res.data.forEach(item => {
        // 判断 attr_vals 是否为空
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
        // 将 attr_vals 用空格分开成一个数组
        // 控制newtag时文本框的显示与隐藏
        item.newTagInputVisible = false;
        // 文本框中输入的值
        item.newTagInputValue = '';
      });
      console.log(res.data);
      // 判断获取到的数据是动态参数还是静态属性
      if (this.categoriesTabsActiveName === 'many') {
        // 证明获取的是动态参数中的数据
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },

    // 添加
    // 添加动态参数或者静态属性对话框关闭后触发
    addDialogVisibleClose () {
      this.$refs.addAttributeFormRef.resetFields();
    },
    // 点击确定按钮添加动态参数或者静态属性
    addParams () {
      this.$refs.addAttributeFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.post(
          `categories/${this.categoriesThirdId}/attributes`,
          {
            attr_name: this.addAttributeForm.attr_name,
            attr_sel: this.categoriesTabsActiveName
          }
        );
        if (res.meta.status !== 201) {
          return this.$message({
            showClose: true,
            type: 'error',
            message: `为该分类添加的 ${this.titleText} 失败`,
            duration: 1500
          });
        }
        this.$message({
          showClose: true,
          type: 'success',
          message: `为该分类添加的 ${this.titleText} 成功`,
          duration: 1500
        });
        this.addDialogVisible = false;
        this.getParamsData();
      });
    },

    // 修改
    // 点击编辑按钮显示改动态参数或者静态属性对话框
    async showEditParamsDialog (editParams) {
      console.log(editParams);
      const {
        data: res
      } = await this.$http.get(
        `categories/${this.categoriesThirdId}/attributes/${editParams.attr_id}`,
        { params: { attr_sel: this.categoriesTabsActiveName } }
      );
      console.log(111);
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: `获取该分类的${this.titleText}失败`,
          duration: 1500
        });
      }
      console.log('1');
      console.log(res);
      this.editAttributeForm = res.data;
      this.editDialogVisible = true;
    },
    // 修改动态参数或者静态属性对话框关闭后触发
    editDialogVisibleClose () {
      this.$refs.editAttributeFormRef.resetFields();
    },
    // 点击确定按钮后提交修改改动态参数或者静态属性
    editParams () {
      this.$refs.editAttributeFormRef.validate(async valid => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.put(
          `categories/${this.editAttributeForm.cat_id}/attributes/${this.editAttributeForm.attr_id}`,
          {
            attr_name: this.editAttributeForm.attr_name,
            attr_sel: this.editAttributeForm.attr_sel,
            attr_vals: this.editAttributeForm.attr_vals
          }
        );
        if (res.meta.status !== 200) {
          return this.$message({
            showClose: true,
            type: 'error',
            message: `修改该分类的${this.titleText}失败`,
            duration: 1500
          });
        }
        this.$message({
          showClose: true,
          type: 'success',
          message: `修改该分类的${this.titleText}成功`,
          duration: 1500
        });
        this.getParamsData();
        this.editDialogVisible = false;
      });
    },
    // 点击删除按钮后提交删除改动态参数或者静态属性
    async deleteEditParamsDialog (deleteParams) {
      console.log(deleteParams);
      const confirmResult = await this.$confirm(
        `您将删除 ${this.titleText} ${deleteParams.attr_name}，是否继续?`,
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
        `categories/${deleteParams.cat_id}/attributes/${deleteParams.attr_id}`
      );
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: `删除 ${this.titleText} ${deleteParams.attr_name} 失败`,
          duration: 1500
        });
      }
      this.getParamsData();
      this.$message({
        showClose: true,
        type: 'success',
        message: `删除 ${this.titleText} ${deleteParams.attr_name} 成功`,
        duration: 1500
      });
    },
    // newtag 时文本框失去焦点或者安下 enter 时触发
    newTagHandleInputConfirm (inputRow) {
      if (inputRow.newTagInputValue.trim().length === 0) {
        inputRow.newTagInputValue = '';
        inputRow.newTagInputVisible = false;
        return;
      }
      // 输入了内容，后续处理
      inputRow.attr_vals.push(inputRow.newTagInputValue.trim());
      inputRow.newTagInputValue = '';
      inputRow.newTagInputVisible = false;
      // 发起请求提交参数
      this.saveAttrVals(inputRow);
    },
    // newtag 点击按钮展示input
    newTagShowInput (btnRow) {
      btnRow.newTagInputVisible = true;
      // 让newtag文本框自动获取焦点
      // $nextTick（当页面上元素被重新渲染后才会执行回调）
      this.$nextTick(_ => {
        this.$refs.newTagSaveTagInputRef.$refs.input.focus();
      });
    },

    // 将对attr_vals的操作保存在数据库
    async  saveAttrVals (inputRow) {
      const { data: res } = await this.$http.put(
        `categories/${inputRow.cat_id}/attributes/${inputRow.attr_id}`,
        {
          attr_name: inputRow.attr_name,
          attr_sel: inputRow.attr_sel,
          attr_vals: inputRow.attr_vals.join(' ')
        }
      );
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: `添加新的${this.titleText}失败`,
          duration: 1500
        });
      }
    },

    // 删除tag
    deleteTagHandle (deleteTagRow, i) {
      deleteTagRow.attr_vals.splice(i, 1);
      this.saveAttrVals(deleteTagRow);
    }
  }
};
</script>

<style lang="less" scoped>
.paramsContainer {
  margin-bottom: 60px;
}
.selectGoodsCate {
  margin-top: 15px;
  .selectGoodsCate_select {
    font-size: 16px;
  }
}
.attr_vals_tags {
  margin-right: 15px;
  margin-bottom: 10px;
}
.input-new-tag {
  width: 120px;
  vertical-align: bottom;
}
</style>
