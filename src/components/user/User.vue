<template>
  <div>
<!--    头部导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
    </el-breadcrumb>
<!--    中间内容区-->
    <el-card class="box-card">
<!--      上面的搜索栏-->
      <el-row :gutter="20">
        <el-col :span="7">
            <el-input placeholder="请输入内容" class="input-with-select"
                      v-model="queryParams.query" clearable @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialog=true">添加</el-button>
        </el-col>
      </el-row>
<!--      表格内容区域-->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template class="temp-btn" slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="changeUser(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
<!--      页脚分页区-->
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryParams.pagenum"
          :page-sizes="[1, 2, 4, 10]"
          :page-size="queryParams.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
<!--添加新用户任务窗口-->
    <el-dialog
      title="添加用户" width="50%"
      :visible.sync="addDialog"
      @close="addClose">
<!--      表单主体部分-->
      <el-form :model="addForm" :rules="addRules" ref="addruleForm" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
<!--          表单尾部信息，控制按钮-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialog = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>
<!--    修改用户信息任务窗口-->
    <el-dialog
      title="修改用户信息" width="50%"
      :visible.sync="changeDialog"
    @close="editClose">
      <!--      表单主体部分-->
<!--      修改表单信息-->
      <el-form :model="editUser" :rules="editRule"  ref="changeruleForm" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editUser.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUser.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUser.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--          表单尾部信息，控制按钮-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="changeDialog = false">取 消</el-button>
    <el-button type="primary" @click="changeUserInfo(editUser.id)">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'User',
  data () {
    // 验证邮箱与手机号的规则， 是表单验证 rules的 validator的回调
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法邮箱号'))
    }
    // var checkpass = (rule, value, cb) => {
    //   if (value === this.addForm.password) {
    //     return cb
    //   }
    //   cb(new Error('两次密码输入不一致！'))
    // }
    return {
      // 请求数据的参数， query是参数 可搜索，  pagenum  pagesize是页信息
      queryParams: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 下面两个分别控制 增加、修改 信息的任务窗口的显示
      addDialog: false,
      changeDialog: false,
      // addform用于新增用户的数据存储，  edituser用于修改用户数据的暂时存储
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editUser: {},
      // rules对应表单的验证规则
      addRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { min: 11, max: 11, message: '请输入正确手机号码', trigger: 'blur' }
        ]
      },
      editRule: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { min: 11, max: 11, message: '请输入正确手机号码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取用户数据的方法， 接受 queryparams里的三个参数， 每次调用都会刷新页面的内容
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryParams })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
      console.log(this.userList, this.total)
    },
    // 下面两个分别控制页脚的页面切换功能，
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryParams.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange (newPage) {
      this.queryParams.pagenum = newPage
      this.getUserList()
    },
    // 改变用户状态的功能
    async userStateChanged (userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      console.log(res)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('改变状态成功')
    },
    // 这是 任务窗口关闭时，重置数据的 回调函数
    addClose () {
      this.$refs.addruleForm.resetFields()
    },
    editClose () {
      this.$refs.changeruleForm.resetFields()
    },
    // 添加表单的预校验,并且发请求添加新用户
    addUser () {
      this.$refs.addruleForm.validate(async (valid) => {
        if (!valid) return this.$message.error('请确认输入正确')
        const { data: res } = await this.$http.post('users', this.addForm)
        // console.log(res)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success('创建成功')
        await this.getUserList()
        this.addDialog = false
      })
    },
    // 发起请求，得到对应id的数据
    async changeUser (id) {
      // console.log(value)
      const { data: res } = await this.$http.get(`users/${id}`)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editUser = res.data
      this.changeDialog = true
    },
    // 修改用户信息的请求，提交时的方法
    changeUserInfo (id) {
      this.$refs.changeruleForm.validate(async valid => {
        if (!valid) return this.$message.error('请输入正确信息')
        const { data: res } = await this.$http.put(`users/${id}`, {
          email: this.editUser.email, mobile: this.editUser.mobile
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('信息修改成功')
        await this.getUserList()
        this.changeDialog = false
        // console.log(res)
      })
    },
    // 根据id删除用户数据
    async deleteUser (id) {
      // console.log(id)
      // 弹框信息询问是否删除
      const res = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      console.log(res)
      // 如果用户确认删除，返回的时字符串 confirm， 取消则返回 cancel
      if (res !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res1 } = await this.$http.delete(`users/${id}`)
      if (res1.meta.status !== 200) return this.$message.error('删除失败')
      await this.getUserList()
      this.$message.success('删除成功')
    }

  },
  created () {
    this.getUserList()
  }
}
</script>

<style lang="less" scoped>
  .el-breadcrumb{
    font-size: 12px;
  }
  .box-card{
    margin-top: 15px;
    box-shadow: 0 1px 1px rgba(0,0,0,0.15) !important;
  }
  .el-table{
    margin-top: 15px;
    font-size: 12px;
  }
  .block{
    margin-top: 15px;
  }
</style>
