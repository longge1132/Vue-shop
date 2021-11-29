<template>
  <div>
    <!--    头部导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
<!--    主体内容-->
    <el-card>
<!--      警告区域-->
      <el-alert title="注意：只允许为三级分类设置相关参数！" show-icon
                type="warning" :closable="false"></el-alert>
<!--选择商品分类区域-->
<!--      头部商品分类选择器-->
      <el-row class="row_opt">
        <el-col>
          <span>选择商品分类：</span>
<!--          商品分类的级联选择器-->
          <el-cascader
            v-model="selectCateKey"
            :props="cascaderProps"
            :options="cateList"
            clearable
            @change="parentCateChange"></el-cascader>
        </el-col>
      </el-row>
<!--      标签页导航-->
      <el-tabs v-model="activeName" @tab-click="handleClick">
<!--        添加动态参数的面板-->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnAble" @click="addParamsDialogVs=true">添加参数</el-button>
<!--          操作表格区域-->
          <el-table :data="manyTableData" border stripe>
<!--            展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index"
                  closable @close="hanleClose(index, scope.row)">
                  {{item}}
                </el-tag>
<!--                标签新添加属性-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small"
                           @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini"
                           @click="editParamsGet(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini"
                           @click="deleteCateParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
<!--        添加静态属性的面板-->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnAble" @click="addParamsDialogVs=true">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
<!--            展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index"
                        closable @close="hanleClose(index, scope.row)">
                  {{item}}
                </el-tag>
                <!--                标签新添加属性-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small"
                           @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini"
                           @click="editParamsGet(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini"
                @click="deleteCateParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
<!--    添加属性或者参数的对话任务列表-->
    <el-dialog
      :title="'添加' + dateType" width="50%"
      :visible.sync="addParamsDialogVs"
      @close="addParamsClose">
      <!--      表单主体部分-->
      <el-form :model="newCateParmas" :rules="addParamsRules" ref="addParamsForm" label-width="70px">
        <el-form-item :label="dateType" prop="attr_name">
          <el-input v-model="newCateParmas.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!--          表单尾部信息，控制按钮-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addParamsDialogVs = false">取 消</el-button>
    <el-button type="primary" @click="addCateParams">确 定</el-button>
  </span>
    </el-dialog>
<!--    修改动态参数任务窗口-->
    <el-dialog
      :title="'修改' + dateType" width="50%"
      :visible.sync="editParamsDialogVs"
      @close="editParamsClose">
      <!--      表单主体部分-->
      <el-form :model="editCateParmas" :rules="editParamsRules" ref="editParamsForm" label-width="70px">
        <el-form-item :label="dateType" prop="attr_name">
          <el-input v-model="editCateParmas.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!--          表单尾部信息，控制按钮-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="editParamsDialogVs = false">取 消</el-button>
    <el-button type="primary" @click="setCateParams">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data () {
    return {
      cateList: [],
      // 级联下拉菜单的属性
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
        // checkStrictly: true
      },
      selectCateKey: '',
      activeName: 'many',
      // 动态参数与静态属性分别得属性
      manyTableData: [],
      onlyTableData: [],
      addParamsDialogVs: false,
      newCateParmas: {
        attr_name: ''
      },
      addParamsRules: {
        attr_name: [
          { required: true, message: '请输入参数', trigger: 'blur' }
        ]
      },
      editParamsDialogVs: false,
      // 编辑栏的信息
      editCateParmas: {},
      // 请求数据时，保存的当前 scope的 row 信息
      tempCateParams: {},
      editParamsRules: {
        attr_name: [
          { required: true, message: '请输入参数', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取全部商品信息
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 3 } })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // this.$message.success(res.meta.msg)
      this.cateList = res.data
      // console.log(res.data)
    },
    // 获取选中商品的参数 和 信息
    async getCateParams () {
      if (this.selectCateKey.length !== 3) {
        this.selectCateKey = []
        this.manyTableData = []
        this.onlyTableData = []
        return 0
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 为每个标签分别添加新建标签的可视与value区域
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
      // console.log(res.data)
    },
    // 级联菜单选项改变的回调函数
    parentCateChange () {
      this.getCateParams()
    },
    handleClick () {
      // console.log(this.activeName)
      this.getCateParams()
    },
    // 任务框口关闭时的重置操作
    addParamsClose () {
      this.$refs.addParamsForm.resetFields()
    },
    editParamsClose () {
      this.$refs.editParamsForm.resetFields()
    },
    // 新增参数，任务窗口操作并提交
    addCateParams () {
      this.$refs.addParamsForm.validate(async valid => {
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`,
          {
            attr_name: this.newCateParmas.attr_name, attr_sel: this.activeName
          })
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        await this.getCateParams()
        this.addParamsDialogVs = false
      })
    },
    // 打开修改参数的任务窗口同时 请求服务器根据id获取参数
    async editParamsGet (pars) {
      this.tempCateParams = pars
      // console.log(pars)
      const { data: res } = await this.$http.get(`categories/${pars.cat_id}/attributes/${pars.attr_id}`,
        { params: { sel: this.activeName } })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editCateParmas = res.data
      this.editParamsDialogVs = true
      // console.log(res.data)
    },
    // 提交修改的商品参数
    setCateParams () {
      this.$refs.editParamsForm.validate(async valid => {
        if (!valid) return this.$message.error('请输入正确信息')
        const { data: res } = await this.$http.put(
          `categories/${this.tempCateParams.cat_id}/attributes/${this.tempCateParams.attr_id}`, {
            attr_name: this.editCateParmas.attr_name, attr_sel: this.activeName
          })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('信息修改成功')
        await this.getCateParams()
        this.editParamsDialogVs = false
        // console.log(res)
      })
    },
    // 删除商品的参数
    async deleteCateParams (id) {
      // console.log(id)
      // 弹框信息询问是否删除
      const res = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(res)
      // 如果用户确认删除，返回的时字符串 confirm， 取消则返回 cancel
      if (res !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res1 } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res1.meta.status !== 200) return this.$message.error('删除失败')
      await this.getCateParams()
      this.$message.success('删除成功')
    },
    // 添加标签添加动态属性
    handleInputConfirm (row) {
      // 判断输入的字符串是否合法， 合法再做下一步操作
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return 0
      }
      // 这是前端页面的改变，后面还需要请求数据库
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.changeHandleParams(row)
    },
    hanleClose (index, row) {
      row.attr_vals.splice(index, 1)
      this.changeHandleParams(row)
    },
    // 用于更新数据库的商品参数列表请求
    async changeHandleParams (row) {
      const { data: res } = await this.$http.put(
        `categories/${row.cat_id}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name, attr_sel: this.activeName, attr_vals: row.attr_vals.join(' ')
        })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('信息修改成功')
    },
    // tag切换 input的 回调函数
    showInput (item) {
      item.inputVisible = true
      this.$nextTick(() => {
        // 让文本框自动获取焦点
        this.$refs.saveTagInput.$refs.input.focus()
        // console.log(this.$refs.saveTagInput)
      })
    }
  },
  computed: {
    // 根据是否选择正确的三级目录分类来控制 按钮参数的可用
    isBtnAble () {
      return this.selectCateKey.length !== 3
    },
    cateId () {
      if (this.selectCateKey.length === 3) {
        return this.selectCateKey[2]
      }
      return null
    },
    dateType () {
      if (this.activeName === 'many') {
        return '动态属性'
      }
      return '静态参数'
    }
  }
}
</script>

<style lang="less" scoped>
  .row_opt {
    margin: 10px 5px;
  }
  .el-tag {
    margin: 2px 5px;
  }
  .input-new-tag {
    width: 100px !important;
  }
</style>
