<template>
  <div>
    <!--    头部导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
<!--    主题内容区域-->
    <el-card>
<!--      提示区域-->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
<!--      步骤条  activeIndex 绑定了下面的 tab 下面需要字符串 减0 等于数字-->
      <el-steps :space="200" :active="activeIndex - 0" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
<!--      导航tab包裹在 form表单中，  规则时 tabs中只允许 tab-pane-->
<!--      左侧tabs 导航栏  name 会自动绑定 v-model的值-->
      <el-form :model="addForm" :rules="addFormRules"  ref="addFormRef"
               label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" tab-position="left"
                 :before-leave="beforeTabLeave" @tab-click="tabClicked">
<!--          每一个tab-pane里面都对应自己的输入页面，  基本信息-->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!--      商品分类选择器-->
              <el-row class="row_opt">
                <el-col>
                  <span>选择商品分类：</span>
                  <!--          商品分类的级联选择器-->
                  <el-cascader
                    v-model="addForm.goods_cat"
                    :props="cascaderProps"
                    :options="cateList"
                    clearable
                    @change="listCateChange"></el-cascader>
                </el-col>
              </el-row>
            </el-form-item>
          </el-tab-pane>
<!--          商品参数的页面-->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="bc" v-for="(bc, i) in item.attr_vals" :key="i">
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
           </el-tab-pane>
<!--          商品属性参数-->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData"
                          :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
<!--          商品图片页-->
          <el-tab-pane label="商品图片" name="3">
<!--            图片上传的组件-->
            <el-upload
              :on-success="handleSuccess"
              :headers="headerObj"
              class="upload-demo"
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
<!--          商品内容的富文本编辑器-->
          <el-tab-pane label="商品内容" name="4">
<!--            富文本编辑器组件-->
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor>
<!--            添加按钮-->
            <el-button type="primary" class="edBtn" @click="addCont">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
<!--    图片预览的窗口视图-->
    <el-dialog
      title="图片预览" width="50%"
      :visible.sync="imgDialogVs"
      @close="imgDialogVs=false">
      <img :src="preview" alt="#" class="dialog-img">
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Add',
  data () {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择', trigger: 'blur' }
        ]
      },
      cateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: false
      },
      manyTableData: [],
      onlyTableData: [],
      // 图片的上传地址，与封装的请求头, 之前所有axios都封装了全局调用， 这个 upload需要手动封装请求
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片的临时存储地址与图片预览窗口的可视化
      preview: '',
      imgDialogVs: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // this.$message.success(res.meta.msg)
      this.cateList = res.data
      // console.log(res.data)
    },
    // 级联选择器改变时触发函数
    listCateChange () {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // tab栏切换时触发的函数， 会默认传入两个参数， 要离开的 tab 和 要 进入的 tab
    beforeTabLeave (entertab, leavetab) {
      // console.log('将要离开', leavetab)
      // console.log('要进入', entertab)
      if (leavetab === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // tab栏切换时触发的函数
    async tabClicked () {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
          { params: { sel: 'many' } })
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyTableData = res.data
        // console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
          { params: { sel: 'only' } })
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.onlyTableData = res.data
        // console.log(this.manyTableData)
      }
    },
    // 图片上传预览的触发事件
    handlePreview (file) {
      this.preview = file.response.data.url
      console.log(this.preview)
      this.imgDialogVs = true
    },
    // 图片删除的触发事件, 会传入要删除图片的删除时的响应信息 file
    handleRemove (file) {
      const filePath = file.response.data.tmp_path
      const index = this.addForm.pics.findIndex(x => x.pic === filePath)
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm)
    },
    // 监听网络上传成功时的回调
    handleSuccess (response) {
      const picInfo = {
        pic: response.data.tmp_path
      }
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    addCont () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单！')
        // 因为传参的数据有的需要字符串和数组的互相转换，而项目中也有引用，所以需要深拷贝一份表单
        const newaddForm = deepClone(this.addForm)
        newaddForm.goods_cat = newaddForm.goods_cat.join(',')
        // 处理动态参数与静态属性
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        newaddForm.attrs = this.addForm.attrs
        console.log(newaddForm)
        const { data: res } = await this.$http.post('goods', newaddForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        // console.log(res)
        this.$message.success(res.meta.msg)
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
function deepClone (obj) {
  const objClone = Array.isArray(obj) ? [] : {}
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        objClone[key] = deepClone(obj[key])
      } else {
        objClone[key] = obj[key]
      }
    }
  }
  return objClone
}
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }
  .dialog-img {
    width: 100%;
  }
  .edBtn {
    margin-top: 15px;
  }
</style>
