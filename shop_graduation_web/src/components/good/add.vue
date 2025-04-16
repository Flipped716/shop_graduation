<template>
  <div class="addContainer">
    <!-- 面包屑导航; -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-button
      type="primary"
      class="returnGood"
      icon="el-icon-arrow-left"
      size="small"
      @click="returnGoods"
      >返回商品列表</el-button
    >

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示用户 -->
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        center
        :closable="false"
      >
      </el-alert>

      <!-- 添加商品步骤区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 添加商品步骤条下的tabs -->
      <el-form
        :model="addGoodsForm"
        :rules="addGoodsRules"
        ref="addGoodsRulesFormRef"
        label-width="100px"
        class="demo-ruleForm"
        label-position="top"
        status-icon
      >
        <el-tabs
          tab-position="left"
          v-model="activeIndex"
          :before-leave="tagsBeferLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格(元)" prop="goods_price">
              <el-input
                v-model="addGoodsForm.goods_price"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="addGoodsForm.goods_weight"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="addGoodsForm.goods_number"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                :options="categorieList"
                v-model="addGoodsForm.goods_cat"
                :props="cateCascader"
                @change="cateCascaderHandleChange"
              >
              </el-cascader>
              <div class="cateCascaderError" v-show="cateCascaderError">
                <span>只允许选择第三级分类</span>
              </div>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in manyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  v-for="(index, i) in item.attr_vals"
                  :key="i"
                  :label="index"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in onlyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action：图片上传的API接口
                     on-preview:预览图片
                     on-remove:处理移出图片的操作
                     list-type:当前预览组件的呈现方式 -->
            <el-upload
              class="upload-demo"
              :action="upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <el-button
              class="addCommodityBtn"
              type="primary"
              size="default"
              @click="addCommodityBtn"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <!-- 图片预览对话框 -->
      <el-dialog
        title="图片预览"
        :visible.sync="addImgHandlePreviewdialogVisible"
        width="50%"
        @close="addImgHandlePreviewdialogVisible = false"
      >
        <img :src="handlePreviewImgUrl" alt="" style="width: 100%" />
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  data() {
    // 商品数量的正则验证
    var checkGoodsNumber = (rule, value, callback) => {
      const regGoodsNumber = /^[0-9]*$/;
      if (!value) {
        return callback(new Error("请输入商品的数量"));
      }
      if (!regGoodsNumber.test(value)) {
        return callback(new Error("您输入的商品数量有误"));
      }
      callback();
    };
    // 商品价格的正则验证
    var checkGoodsPrice = (rule, value, callback) => {
      const regGoodsPrice = /^[0-9]*$/;
      if (!value) {
        return callback(new Error("请输入商品的价格"));
      }
      if (!regGoodsPrice.test(value)) {
        return callback(new Error("您输入的商品价格有误"));
      }
      callback();
    };
    // 商品重量的正则验证
    var checkGoodsWeight = (rule, value, callback) => {
      const regGoodsWeight = /^[0-9]*$/;
      if (!value) {
        return callback(new Error("请输入商品的重量"));
      }
      if (!regGoodsWeight.test(value)) {
        return callback(new Error("您输入的商品重量有误"));
      }
      callback();
    };
    return {
      activeIndex: "0", // 步骤条默认选中第一个
      // 添加商品的表单数据对象
      addGoodsForm: {
        goods_name: "",
        goods_price: "0",
        goods_weight: "0",
        goods_number: "0",
        // 商品所属的分类数组
        goods_cat: [],
        // 上传的图片临时路径（对象）
        pics: [],
        // 商品的介绍
        goods_introduce: "",
        attrs: [],
      },
      // 添加商品的表单数据验证规则
      addGoodsRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, validator: checkGoodsPrice, trigger: "blur" },
        ],
        goods_weight: [
          { required: true, validator: checkGoodsWeight, trigger: "blur" },
        ],
        goods_number: [
          { required: true, validator: checkGoodsNumber, trigger: "blur" },
        ],
        goods_cat: [
          {
            required: true,
            message: "请选择商品的分类（注意：只允许选择第三级分类）",
            trigger: "blur",
          },
        ],
      },
      // 获取级联选择框中的商品分类数据
      categorieList: [],
      // 级联选择框数据配置
      cateCascader: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      cateCascaderError: false,
      // 点击第二个tabs后获取的动态参数列表
      manyTableData: [],
      // 点击第二个tabs后获取的静态属性列表
      onlyTableData: [],
      // 图片上传的接口地址
      upload: "http://127.0.0.1:8888/api/private/v1/upload",
      // 图片上传组件的token
      headerObj: {
        Authorization: window.sessionStorage.getItem("loginToken"),
      },
      // 添加图片页面  图片预览对话框的显示与隐藏
      addImgHandlePreviewdialogVisible: false,
      // 预览图片的URL
      handlePreviewImgUrl: "",
    };
  },
  created() {
    this.getCategorieList();
  },
  computed: {
    cateId() {
      if (this.addGoodsForm.goods_cat.length === 3) {
        return this.addGoodsForm.goods_cat[2];
      }
      return null;
    },
  },
  methods: {
    async getCategorieList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: "error",
          message: "获取商品分类列表失败",
          duration: 1500,
        });
      }
      this.categorieList = res.data;
    },
    // 级联选择框选中项变化触发
    cateCascaderHandleChange() {
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = [];
        this.cateCascaderError = true;
      } else {
        this.cateCascaderError = false;
      }

      console.log(this.addGoodsForm.goods_cat);
    },
    // 切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换。
    tagsBeferLeave(activeName, oldActiveName) {
      if (
        !this.addGoodsForm.goods_name ||
        !this.addGoodsForm.goods_price ||
        !this.addGoodsForm.goods_weight ||
        !this.addGoodsForm.goods_number ||
        this.addGoodsForm.goods_cat.length !== 3
      ) {
        this.$message({
          showClose: true,
          type: "error",
          message: "请先完成商品基本信息的填写和选择",
          duration: 1500,
        });
        return false;
      }
    },
    // tabs被点击后
    async tabClicked() {
      // 访问的是动态参数面板
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message({
            showClose: true,
            type: "error",
            message: "获取动态参数列表失败",
            duration: 1500,
          });
        }
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableData = res.data;
        console.log(this.manyTableData);
      } else if (this.activeIndex === "2") {
        // 访问的是商品属性面板
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message({
            showClose: true,
            type: "error",
            message: "获取商品属性列表失败",
            duration: 1500,
          });
        }
        this.onlyTableData = res.data;
        console.log(this.onlyTableData);
      }
    },
    // 处理预览图片的预览效果
    handlePreview(file) {
      console.log(file);
      this.handlePreviewImgUrl = file.response.data.url;
      this.addImgHandlePreviewdialogVisible = true;
    },
    // 处理移出图片的操作
    handleRemove(file) {
      console.log(file);
      // 获取将要删除的图片的临时路径
      const picRemovePath = file.response.data.tmp_path;
      // 从pics数组中找到这个图片对应的索引值
      const i = this.addGoodsForm.pics.findIndex(
        (x) => x.pic === picRemovePath
      );
      // 调用splice，把图片信息从pics数组中移除
      this.addGoodsForm.pics.splice(i, 1);
      console.log(this.addGoodsForm);
    },
    // 监听图片上传成功
    handleSuccess(response) {
      console.log(response);
      // 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      // 将图片信息，push到pics数组中
      this.addGoodsForm.pics.push(picInfo);
      console.log(this.addGoodsForm);
    },
    // 添加商品
    addCommodityBtn() {
      this.$refs.addGoodsRulesFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message({
            showClose: true,
            type: "error",
            message: "有必填属性未填写，请填写",
            duration: 1500,
          });
        }

        // 级联选择器 cascader v-model 绑定到 addGoodsForm.goods_cat中，并且级联选择器规定，绑定的必须是一个数组，而我们要用的是字符串，因此可以将 addGoodsForm 这个对象深拷贝一份供我们使用
        // 深拷贝使用的包 lodash
        const form = _.cloneDeep(this.addGoodsForm);
        form.goods_cat = form.goods_cat.join(",");

        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          };
          this.addGoodsForm.attrs.push(newInfo);
        });
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          this.addGoodsForm.attrs.push(newInfo);
        });
        form.attrs = this.addGoodsForm.attrs;

        console.log(form);
        // 发起请求 商品的名称唯一
        const { data: res } = await this.$http.post("goods", form);
        console.log(res);
        if (res.meta.status !== 201) {
          return this.$message({
            showClose: true,
            type: "error",
            message: "添加商品失败",
            duration: 1500,
          });
        }
        this.$message({
          showClose: true,
          type: "success",
          message: "添加商品成功",
          duration: 1500,
        });
        this.$router.push("/goods");
      });
    },
    returnGoods() {
      this.$router.push("/goods");
    },
  },
};
</script>

<style lang="less" scoped>
.addContainer {
  margin-bottom: 60px;
}
.el-steps {
  margin: 20px 50px 20px 50px;
}
.el-form-item {
  margin-left: 20px;
  width: 850px;
}
.cateCascaderError {
  width: 250px;
  font-size: 12px;
  margin-top: -10px;
  color: #f56c6c;
}
.el-checkbox {
  margin: 5px 5px 0 0 !important;
}
.addCommodityBtn {
  margin-top: 20px;
}
.returnGood {
  margin-bottom: 15px;
}
</style>
