<template>
  <div>
    <!--    头部导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!--      上面的搜索栏-->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" class="input-with-select"
                    v-model="queryParams.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
<!--      表格区域-->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status===1">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="addressDialogVs=true"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProcess(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
<!--      页脚分页栏-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
<!--      修改地址对话框 任务窗口-->
      <el-dialog
        title="修改地址" width="50%"
        :visible.sync="addressDialogVs"
        @close="addressClose">
        <!--      表单主体部分-->
        <el-form :model="addressForm" :rules="addressFormRules"  ref="addressRef" label-width="100px">
          <el-form-item label="省市区/县" prop="address1">
                        <el-cascader
                          v-model="addressForm.address1"
                          :props="cascaderProps"
                          :options="cityData"
                          clearable></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <!--          表单尾部信息，控制按钮-->
        <span slot="footer" class="dialog-footer">
    <el-button @click="addressDialogVs = false">取 消</el-button>
    <el-button type="primary" @click="addressDialogVs = false">确 定</el-button>
  </span>
      </el-dialog>
<!--      进度的 任务窗口-->
      <el-dialog
        title="物流进度" width="50%"
        :visible.sync="processDialogVs">
        <!--      物流进度时间线控件部分-->
        <el-timeline :reverse="true">
          <el-timeline-item
            v-for="(item, index) in processInfo"
            :key="index"
            :timestamp="item.time">
            {{item.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import citydata from './citydata.js'
export default {
  name: 'Order',
  data () {
    return {
      queryParams: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      orderList: [],
      total: 0,
      addressDialogVs: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      cityData: citydata,
      cascaderProps: {
        value: 'value',
        label: 'label',
        children: 'children',
        expandTrigger: 'hover'
      },
      processDialogVs: false,
      processInfo: []
    }
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryParams })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.orderList = res.data.goods
      this.total = res.data.total
      // console.log(this.orderList)
    },
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryParams.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange (newPage) {
      this.queryParams.pagenum = newPage
      this.getOrderList()
    },
    addressClose () {
      this.$refs.addressRef.resetFields()
    },
    async showProcess (row) {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // this.$message.success(res.meta.msg)
      this.processInfo = res.data
      this.processDialogVs = true
      // console.log(res.data)
    }
  },
  created () {
    this.getOrderList()
  }
}
</script>
