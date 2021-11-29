<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
<!--      头部添加按钮-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
<!--      表格区域主体-->
      <tree-table :selection-type="false" :expand-type="false" show-index index-text="#" border
                  :show-row-hover="true" :data="cateList" :columns="columns" class="treetable">
<!--        第一个模板用于是否有效的插槽列-->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
<!--        第二个模板用于 排序 列的插槽-->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini"  v-if="scope.row.cat_level === 0" >一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1" >二级</el-tag>
          <el-tag size="mini" type="warning" v-else >三级</el-tag>
        </template>
<!--        第三行用于 操作 列-->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit"
                     @click="getCateInfoAndEdit(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete"
                     @click="deleteCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!--      页脚分页区-->
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3, 5, 8, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
<!--    添加商品的任务对话框-->
    <el-dialog
      title="添加商品" width="50%"
      :visible.sync="addCateDialogVs"
    @close="addCateClose">
      <!--      表单主体部分-->
      <el-form :model="addCateForm" :rules="addCateRules"  ref="addCateForm" label-width="70px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectKey"
            :props="cascaderProps"
            :options="parentCateList"
             clearable
            @change="parentCateChange"></el-cascader>
        </el-form-item>
      </el-form>
      <!--          表单尾部信息，控制按钮-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVs = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>
    <!--    修改用户信息任务窗口-->
    <el-dialog
      title="修改分类信息" width="50%"
      :visible.sync="changeCateDialogVs"
    @close="editCateClose">
      <!--      表单主体部分-->
      <!--      修改表单信息-->
      <el-form :model="editCate" :rules="addCateRules"  ref="changeCateForm" label-width="70px">
        <el-form-item label="类名">
          <el-input v-model="editCate.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!--          表单尾部信息，控制按钮-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="changeCateDialogVs = false">取 消</el-button>
    <el-button type="primary" @click="changeCateInfo">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cate',
  data () {
    return {
      cateList: [],
      total: 0,
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      // 为table制定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 自定义插槽属性， 名字叫isok
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 添加商品试图控制，与表单
      addCateDialogVs: false,
      addCateForm: {
        // 要添加的名称， 父级分类Id， 分类的等级
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 添加分类的父级列表
      parentCateList: [],
      // 级联下拉菜单的配置属性, 处罚方式 以及是否可以选择父级
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 选择的父级分类的数组
      selectKey: [],
      changeCateDialogVs: false,
      // 编辑商品信息的临时保存信息
      editCate: {}
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // this.$message.success(res.meta.msg)
      this.cateList = res.data.result
      this.total = res.data.total
      // console.log(res.data)
    },
    // 监听pagesize改变
    handleSizeChange (newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getCateList()
    },
    handleCurrentChange (newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getCateList()
    },
    // 控制添加分类任务框的显示
    showAddCateDialog () {
      this.getParentCateList()
      this.addCateDialogVs = true
    },
    // 获取父级分类的列表用语展示添加窗口
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // this.$message.success(res.meta.msg)
      // console.log(res.data)
      this.parentCateList = res.data
    },
    // 选择父级分类项发生变化的回调函数
    parentCateChange () {
      // console.log(this.selectKey)
      if (this.selectKey.length > 0) {
        this.addCateForm.cat_pid = this.selectKey[this.selectKey.length - 1]
        this.addCateForm.cat_level = this.selectKey.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
      // console.log(this.addCateForm)
    },
    // 关闭任务窗口的重置
    addCateClose () {
      this.$refs.addCateForm.resetFields()
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      this.selectKey = []
    },
    // 添加分类确认，发送请求
    editCateClose () {
      this.$refs.changeCateForm.resetFields()
    },
    addCate () {
      this.$refs.addCateForm.validate(async (valid) => {
        if (!valid) return this.$message.warning('请输入信息')
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        await this.getCateList()
        this.addCateDialogVs = false
      })
    },
    // 编辑商品分类信息，窗口控制，获取id 信息
    async getCateInfoAndEdit (id) {
      const { data: res } = await this.$http.get(`categories/${id}`)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editCate = res.data
      this.changeCateDialogVs = true
    },
    // 提交修改表单，修改数据
    changeCateInfo () {
      this.$refs.changeCateForm.validate(async valid => {
        if (!valid) return this.$message.error('请输入正确信息')
        const { data: res } = await this.$http.put(`categories/${this.editCate.cat_id}`, {
          cat_name: this.editCate.cat_name
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('信息修改成功')
        await this.getCateList()
        this.changeCateDialogVs = false
        // console.log(res)
      })
    },
    // 删除数据cate根据id
    async deleteCate (id) {
      const res = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(res)
      // 如果用户确认删除，返回的时字符串 confirm， 取消则返回 cancel
      if (res !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res1 } = await this.$http.delete(`categories/${id}`)
      if (res1.meta.status !== 200) return this.$message.error(res.meta.msg)
      await this.getCateList()
      this.$message.success('删除成功')
    }
  }
}
</script>

<style lang="less" scoped>
  .treetable{
    margin-top: 15px;
  }
  .el-cascader{
    width: 100%;
  }
</style>
