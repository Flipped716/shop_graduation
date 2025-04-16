<template>
  <div class="goodsContainer">
    <!-- 面包屑导航; -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框和添加商品按钮区域 -->
      <el-row :gutter="24">
        <el-col :span="8">
          <el-input placeholder="请输入查询关键词"
                    v-model="queryInfo.query"
                    clearable
                    @clear="getGoodsList">
            <el-button slot="append"
                       icon="el-icon-search"
                       @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary"
                     @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodsList"
                style="width: 100%"
                border
                stripe>
        <el-table-column type="index">
        </el-table-column>
        <el-table-column width="500px"
                         prop="goods_name"
                         label="商品名称">
        </el-table-column>
        <el-table-column width="100px"
                         prop="goods_price"
                         label="商品价格(元)">
        </el-table-column>
        <el-table-column width="100px"
                         prop="goods_weight"
                         label="商品重量(kg)">
        </el-table-column>
        <el-table-column label="创建时间">
          <template slot-scope="scope">
            {{scope.row.add_time|dateFormat}}
          </template>
        </el-table-column>
        <el-table-column width="260px"
                         label="操作">
          <template slot-scope="scope">
            <el-button type="primary"
                       size="mini"
                       icon="el-icon-picture"
                       @click="seeThisGood(scope.row)">查看</el-button>
            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini"
                       @click="goEditPage(scope.row)">编辑</el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini"
                       @click="deleteGood(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[10, 20, 50, 100]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>

    <!-- 显示商品图片的对话框 -->
    <el-dialog :show-close="false"
               :title="seeThisGoodPic.thisGoodName"
               :visible.sync="seeGoodPicDialogVisible"
               width="30%"
               @close="seeGoodPicDialogVisible=false">
      <!--  v-lazy="seeThisGoodPic.thisGoodPicUrl" -->
      <img :src="seeThisGoodPic.thisGoodPicUrl"
           class="loading"
           style="width:100%;"
           :alt="seeThisGoodPic.thisGoodName">
    </el-dialog>

    <!-- 编辑商品信息的对话框 -->
    <el-dialog title="修改商品信息"
               :visible.sync="editGoodDialogVisible"
               width="50%">
      <el-form :model="editGoodDialogRuleForm"
               :rules="editGoodDialogRules"
               ref="editGoodDialogRuleFormRef"
               label-width="110px"
               class="demo-ruleForm"
               label-position="left">
        <el-form-item label="商品名称:"
                      prop="goods_name">
          <el-input type="textarea"
                    autosize
                    resize="none"
                    v-model="editGoodDialogRuleForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格(元):"
                      prop="goods_price">
          <el-input type="number"
                    v-model="editGoodDialogRuleForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量(件):"
                      prop="goods_number">
          <el-input type="number"
                    v-model="editGoodDialogRuleForm.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量(kg):"
                      prop="goods_weight">
          <el-input type="number"
                    v-model="editGoodDialogRuleForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editGoodDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="edit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      goodsList: [], // 商品列表数据
      // 查询参数对象
      queryInfo: {
        query: '', // 查询的参数
        pagenum: 1, // 当前页码
        pagesize: 10 // 每页显示条数
      },
      total: 0, // 总页数
      // 查看商品图片的对话框
      seeGoodPicDialogVisible: false,
      // 当前商品的图片URl
      seeThisGoodPic: {
        thisGoodPicUrl: '',
        thisGoodName: ''
      },
      editGoodDialogVisible: false, // 编辑商品信息的对话框的显示隐藏
      editGoodDialogRuleForm: {// 该商品的商品信息

      },
      editGoodDialogRules: {
        // 编辑商品信息的对话框的校验
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格(元)', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量(件)', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量(kg)', trigger: 'blur' }
        ]
      }
    };
  },
  created () {
    this.getGoodsList();
  },
  methods: {
    // 获取商品列表数据
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: '获取商品列表失败',
          duration: 1500
        });
      }
      this.goodsList = res.data.goods;
      this.total = res.data.total;
      console.log(res);
    },
    // 分页功能中每页显示的条数（pagesize）发生改变时触发
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    // 分页功能中页码（queryInfo.pagenum）发生改变时触发
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    // 删除商品
    async deleteGood (deleteRow) {
      // 询问用户是否删除
      const confirmResult = await this.$confirm(
        `您将删除商品 ${deleteRow.goods_name.substring(0, 5)}···，是否继续?`,
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
        `goods/${deleteRow.goods_id}`
      );
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: `删除商品 ${deleteRow.goods_name.substring(0, 5)}··· 失败`,
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
      this.getGoodsList();
      this.$message({
        showClose: true,
        type: 'success',
        message: `删除分类 ${deleteRow.goods_name.substring(0, 5)}··· 成功`,
        duration: 1500
      });
    },
    // 跳转到添加商品页面
    goAddPage () {
      this.$router.push('/goods/add');
    },

    // 点击编辑商品按钮
    async goEditPage (editRow) {
      const { data: res } = await this.$http.get(`goods/${editRow.goods_id}`);
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: '获取商品信息失败',
          duration: 1500
        });
      }
      this.editGoodDialogRuleForm = res.data;

      this.editGoodDialogVisible = true;
      console.log(editRow);
    },
    // 修改商品成功点确定
    edit () {
      this.$refs.editGoodDialogRuleFormRef.validate(async valid => {
        if (!valid) {
          return this.$message({
            showClose: true,
            type: 'error',
            message: '有必填属性未填写，请填写',
            duration: 1500
          });
        }
        const { data: res } = await this.$http.put(
          `goods/${this.editGoodDialogRuleForm.goods_id}`, {
            goods_name: this.editGoodDialogRuleForm.goods_name,
            goods_price: this.editGoodDialogRuleForm.goods_price,
            goods_number: this.editGoodDialogRuleForm.goods_number,
            goods_weight: this.editGoodDialogRuleForm.goods_weight
            // goods_introduce: this.editGoodDialogRuleForm.goods_introduce,
            // pics: this.editGoodDialogRuleForm.pics,
            // attrs: this.editGoodDialogRuleForm.attrs
          }
        );

        console.log('123');
        console.log(res);
        if (res.meta.status !== 200) {
          return this.$message({
            showClose: true,
            type: 'error',
            message: '修改商品信息失败',
            duration: 1500
          });
        }
        this.$message({
          showClose: true,
          type: 'success',
          message: '修改该商品信息成功',
          duration: 1500
        });
        this.getGoodsList();
        this.editGoodDialogVisible = false;
      });
    },
    // 获取有商品图片的商品数据列表
    async seeThisGood (seeGoodRow) {
      const { data: res } = await this.$http.get(
        `goods/${seeGoodRow.goods_id}`
      );
      this.seeThisGoodPic.thisGoodName = res.data.goods_name;
      this.seeThisGoodPic.thisGoodPicUrl = res.data.pics[0].pics_mid_url;

      this.seeGoodPicDialogVisible = true;
    }
  }
};
</script>

<style lang="less" scoped>
.goodsContainer {
  margin-bottom: 60px;
}
.el-table {
  margin-bottom: 20px;
}
</style>
