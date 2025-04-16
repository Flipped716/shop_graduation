<template>
  <div class="orderContainer">
    <!-- 面包屑导航; -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- <el-row :gutter="24">
        <el-col :span="8">
          <el-input placeholder="请输入查询关键词"
                    v-model="queryInfo.query"
                    clearable
                    @clear="getOrdersList">
            <el-button slot="append"
                       icon="el-icon-search"
                       @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row> -->
      <!-- 表格区域 -->
      <el-table :data="ordersList"
                border
                stripe
                style="width: 100%">
        <el-table-column type="index">
        </el-table-column>
        <el-table-column prop="order_number"
                         label="订单编号"
                         width="260px">
        </el-table-column>
        <el-table-column prop="order_price"
                         label="订单价格(元)">
        </el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag type="danger"
                    v-if="scope.row.pay_status==='0'">未付款</el-tag>
            <el-tag type="success"
                    v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货">
          <template slot-scope="scope">
            <el-tag type="danger"
                    v-if="scope.row.is_send==='否'">未发货</el-tag>
            <el-tag type="success"
                    v-else>已发货</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间"
                         width="150px">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column prop="address"
                         label="操作"
                         width="185x">
          <template slot-scope="scope">
            <el-button type="info"
                       size="small"
                       icon="el-icon-view"
                       @click="showSeeOrderDetailedDialog(scope.row)">详情</el-button>
            <el-button type="primary"
                       size="small"
                       icon="el-icon-edit"
                       @click="showEditOrderDialog(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[5, 10, 15, 20]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>

    <!-- 详情按钮展示订单详情的对话框 -->
    <el-dialog title="订单详情"
               :visible.sync="detailedDialogVisible"
               width="30%">
      <el-form label-width="100px"
               label-position="left">
        <el-form-item label="订单编号:">
          <span>{{orderDetaile.order_number}}</span>
        </el-form-item>
        <el-form-item label="订单价格:">
          <span>{{orderDetaile.order_price}} 元</span>
        </el-form-item>
        <el-form-item label="收货地址:">
          <span>{{orderDetaile.consignee_addr}}</span>
        </el-form-item>
        <el-form-item label="支付方式:">
          <el-tag type="danger"
                  v-if="orderDetaile.order_pay==='0'">未支付</el-tag>
          <el-tag v-else-if="orderDetaile.order_pay==='1'">支付宝</el-tag>
          <el-tag type="success"
                  v-else-if="orderDetaile.order_pay==='2'">微信</el-tag>
          <el-tag type="info"
                  v-else>银行卡</el-tag>
        </el-form-item>
        <el-form-item label="是否发货:">
          <el-tag type="danger"
                  v-if="orderDetaile.is_send==='0'">未发货</el-tag>
          <el-tag type="success"
                  v-else>已发货</el-tag>
        </el-form-item>
        <el-form-item label="发票抬头:">
          <el-tag v-if="orderDetaile.order_fapiao_title==='个人'">个人</el-tag>
          <el-tag type="info"
                  v-else>公司</el-tag>
        </el-form-item>
        <el-form-item label="是否付款:">
          <el-tag type="danger"
                  v-if="orderDetaile.pay_status==='0'">未付款</el-tag>
          <el-tag type="success"
                  v-else>已付款</el-tag>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 编辑订单状态的对话框 -->
    <el-dialog title="修改订单"
               :visible.sync="editOrderDialogVisible"
               width="50%"
               @close="editOrderDialogVisibleClose">
      <el-form :model="editOrderDialogRuleForm"
               :rules="editOrderDialogRules"
               ref="editOrderDialogRuleFormRef"
               label-width="100px"
               class="demo-ruleForm"
               label-position="left">
        <!-- <el-form-item label="是否发货："
                      prop="is_send">
          <el-select v-model="editOrderDialogRuleForm.is_send"
                     placeholder="请选择是否发货">
            <el-option label="是"
                       value="1"></el-option>
            <el-option label="否"
                       value="0"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="订单价格："
                      prop="order_price">
          <el-input type="number"
                    placeholder="请输入订单价格"
                    v-model="editOrderDialogRuleForm.order_price"></el-input>
        </el-form-item>
        <el-form-item label="省市区/县:"
                      prop="address1">
          <el-cascader expand-trigger="hover"
                       :options="cityData"
                       v-model="editOrderDialogRuleForm.address1"
                       @change="handleChange">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址"
                      prop="address2">
          <el-input placeholder="请输入详细地址"
                    v-model="editOrderDialogRuleForm.address2"></el-input>
        </el-form-item>
        <!-- <el-form-item label="订单数量："
                      prop="order_number">
          <el-input type="number"
                    placeholder="请输入订单数量"
                    v-model="editOrderDialogRuleForm.order_number"></el-input>
        </el-form-item>
        <el-form-item label="是否付款："
                      prop="pay_status">
          <el-select v-model="editOrderDialogRuleForm.pay_status"
                     placeholder="请选择是否付款">
            <el-option label="未付款"
                       value="0"></el-option>
            <el-option label="已付款"
                       value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式："
                      prop="order_pay">
          <el-select v-model="editOrderDialogRuleForm.order_pay"
                     placeholder="请选择支付方式">
            <el-option label="未支付"
                       value="0"></el-option>
            <el-option label="支付宝"
                       value="1"></el-option>
            <el-option label="微信"
                       value="2"></el-option>
            <el-option label="银行卡"
                       value="3"></el-option>
          </el-select>
        </el-form-item> -->
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editOrderDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editOrder">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata';
export default {
  data () {
    // // 商品数量的正则验证
    // var checkOrderNumber = (rule, value, callback) => {
    //   const regOrderNumber = /^[0-9]*$/;
    //   if (!value) {
    //     return callback(new Error('请输入商品的数量'));
    //   }
    //   if (!regOrderNumber.test(value)) {
    //     return callback(new Error('您输入的商品数量有误'));
    //   }
    //   callback();
    // };
    // 商品价格的正则验证
    var checkOrderPrice = (rule, value, callback) => {
      const regOrderPrice = /^[0-9]*$/;
      if (!value) {
        return callback(new Error('请输入商品的价格'));
      }
      if (!regOrderPrice.test(value)) {
        return callback(new Error('您输入的商品价格有误'));
      }
      callback();
    };
    return {
      ordersList: [], // 订单列表
      queryInfo: {
        query: '',
        pagenum: 1, // 当前页码
        pagesize: 10 // 每页显示条数
      },
      total: 0,
      detailedDialogVisible: false, // 订单详情的对话框的显示与隐藏
      // 订单详情数据
      orderDetaile: {},
      editOrderDialogVisible: false, // 编辑订单状态的对话框的显示与隐藏
      // 编辑对话框信息
      editOrderDialogRuleForm: {
        order_price: 0,
        address1: [],
        address2: '',
        consignee_addr: ''
      },
      // 编辑对话框检验规则
      editOrderDialogRules: {
        // is_send: [
        //   { required: true, message: '请选择商品是否发货', trigger: 'blur' }
        // ],
        order_price: [
          { required: true, validator: checkOrderPrice, trigger: 'blur' }
        ],
        // order_number: [
        //   { required: true, validator: checkOrderNumber, trigger: 'blur' }
        // ],
        // pay_status: [
        //   { required: true, message: '请选择商品是否付款', trigger: 'blur' }
        // ],
        // order_pay: [
        //   { required: true, message: '请选择商品的支付方式', trigger: 'blur' }
        // ],
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      cityData: cityData,
      cascaderaddress1: {}
    };
  },
  created () {
    this.getOrdersList();
  },
  methods: {
    async getOrdersList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: '获取商品订单列表失败',
          duration: 1500
        });
      }
      this.ordersList = res.data.goods;
      this.total = res.data.total;
      console.log(res);
    },
    // 每页显示条数改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrdersList();
    },
    // 当前页码改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrdersList();
    },
    // 点击详情按钮查看订单详情
    async showSeeOrderDetailedDialog (detaileRow) {
      const { data: res } = await this.$http.get(
        `orders/${detaileRow.order_id}`
      );
      console.log(res);
      this.orderDetaile = res.data;
      this.detailedDialogVisible = true;
    },

    // 点击编辑按钮编辑订单状态
    async showEditOrderDialog (editRow) {
      const { data: res } = await this.$http.get(`orders/${editRow.order_id}`);
      if (res.meta.status !== 200) {
        return this.$message({
          showClose: true,
          type: 'error',
          message: '获取该商品的详细信息失败',
          duration: 1500
        });
      }
      this.editOrderDialogRuleForm = res.data;
      this.editOrderDialogVisible = true;
    },
    // 修改订单信息点击确定
    editOrder () {
      this.$refs.editOrderDialogRuleFormRef.validate(async valid => {
        if (!valid) {
          return this.$message({
            showClose: true,
            type: 'error',
            message: '请完善订单修改的填写',
            duration: 1500
          });
        }

        // // 订单是否发货重新赋值
        // if (this.editOrderDialogRuleForm.is_send === '否') {
        //   this.editOrderDialogRuleForm.is_send = 0;
        // } else {
        //   this.editOrderDialogRuleForm.is_send = 1;
        // }
        // // 订单支付方式重新赋值
        // this.editOrderDialogRuleForm.order_pay = parseInt(
        //   this.editOrderDialogRuleForm.order_pay
        // );
        // if (this.editOrderDialogRuleForm.order_pay === '未支付') {
        //   this.editOrderDialogRuleForm.order_pay = 0;
        // } else if (this.editOrderDialogRuleForm.order_pay === '支付宝') {
        //   this.editOrderDialogRuleForm.order_pay = 1;
        // } else if (this.editOrderDialogRuleForm.order_pay === '微信') {
        //   this.editOrderDialogRuleForm.order_pay = 2;
        // } else {
        //   this.editOrderDialogRuleForm.order_pay = 3;
        // }
        // 订单价格方式重新赋值
        this.editOrderDialogRuleForm.order_price = parseInt(
          this.editOrderDialogRuleForm.order_price
        );
        // // 订单数量方式重新赋值
        // this.editOrderDialogRuleForm.order_number = parseInt(
        //   this.editOrderDialogRuleForm.order_number
        // );
        // // 支付状态重新赋值
        // this.editOrderDialogRuleForm.pay_status = parseInt(
        //   this.editOrderDialogRuleForm.pay_status
        // );
        // if (this.editOrderDialogRuleForm.pay_status === '未付款') {
        //   this.editOrderDialogRuleForm.pay_status = 0;
        // } else {
        //   this.editOrderDialogRuleForm.pay_status = 1;
        // }
        this.editOrderDialogRuleForm.consignee_addr = this.cascaderaddress1 + ' ' + this.editOrderDialogRuleForm.address2;
        const { data: res } = await this.$http.put(
          `orders/${this.editOrderDialogRuleForm.order_id}`,
          {
            // is_send: this.editOrderDialogRuleForm.is_send,
            // order_pay: this.editOrderDialogRuleForm.order_pay,
            order_price: this.editOrderDialogRuleForm.order_price,
            consignee_addr: this.editOrderDialogRuleForm.consignee_addr
            // order_number: this.editOrderDialogRuleForm.order_number,
            // pay_status: this.editOrderDialogRuleForm.pay_status
          }
        );
        if (res.meta.status !== 201) {
          return this.$message({
            showClose: true,
            type: 'error',
            message: '修改该订单信息失败',
            duration: 1500
          });
        }
        this.$message({
          showClose: true,
          type: 'success',
          message: '修改该订单信息成功',
          duration: 1500
        });
        this.getOrdersList();
        this.editOrderDialogVisible = false;
      });
    },
    // 编辑订单信息中级联选择框改变后触发
    handleChange () {
      this.cascaderaddress1 = this.editOrderDialogRuleForm.address1.join(' ');
      console.log(this.cascaderaddress1);
      console.log(this.editOrderDialogRuleForm.address1);
    },
    editOrderDialogVisibleClose () {
      this.$refs.editOrderDialogRuleFormRef.resetFields();
    }
  }
};
</script>

<style lang="less" scoped>
.orderContainer {
  margin-bottom: 60px;
}
.el-table {
  margin-top: 30px;
  margin-bottom: 20px;
}
.el-cascader {
  width: 100%;
}
.el-select {
  width: 100%;
}
</style>
