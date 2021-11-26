<template>
  <div class="login_container">
    <div class="login_box">
<!--      头像区域-->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="#">
      </div>
<!--      表单区域-->
      <el-form ref="loginRef" :model="loginForm" :rules="rules" label-width="0px" class="form-wrap">
        <el-form-item label-width="0" prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-geren"></el-input>
        </el-form-item>
        <el-form-item label-width="0" prop="password">
          <el-input type="password" v-model="loginForm.password" prefix-icon="iconfont icon-gouwu "></el-input>
        </el-form-item>
        <el-form-item label-width="0" class="btn-cont">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击按钮重置
    resetLoginForm () {
      console.log(this)
      this.$refs.loginRef.resetFields()
    },
    login () {
      // 表单的预验证， 返回是否成功
      this.$refs.loginRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('用户名或密码输入错误！')
        this.$message.success('登录成功')
        console.log(res)
        window.sessionStorage.setItem('token', res.data.token)
        await this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
 .login_container{
   background-color: #2b4b6b;
   height: 100%;
  }
  .login_box{
    width: 450px;
    height: 300px;
    background-color:#fff ;
    border-radius: 10px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .avatar_box{
    width: 130px;
    height: 130px;
    margin: -65px auto 3px auto;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    background-color: lightblue;
    img{
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .btn-cont{
    /*text-align: right;*/
    display: flex;
    justify-content: flex-end;
  }
  .form-wrap{
    padding: 20px;
  }
</style>
