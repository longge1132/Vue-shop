<template>
<el-container class="home-wrapper">
<!--  头部区域-->
  <el-header>
    <div>
      <img style="width: 58px" src="../assets/img/square1.jpg" alt="loge">
      <span>一个简简单单的后台管理系统</span>
    </div>
    <el-button type="info" @click="logout">退出</el-button>
  </el-header>
  <el-container>
<!--    左侧导航-->
    <el-aside :width="(isFold ? 200 : 64) + 'px'">
      <div class="flod-btn" @click="collapseNav">|||</div>
      <!--   unique-opened：是否保持一个子菜单展开，collapse：菜单折叠， c-t：折叠动画-->
      <el-menu
        class="el-menu-vertical-demo"
        :unique-opened="true"
        :collapse-transition="false"
        :collapse="!isFold"
        :router="true"
        :default-active="activePath"
        background-color="skyblue"
        text-color="#fff"
        active-text-color="#ffd04b">
<!--        一级菜单-->
        <el-submenu :index="'/'+item.path" v-for="(item,index) in menulist" :key="item.id">
<!--          一级菜单模板区域 template中 包括图标 和文本-->
          <template slot="title">
            <i :class="iconList[index]"></i>
            <span>{{item.authName}}</span>
          </template>
<!--          二级菜单区域， template中是模板-->
          <el-menu-item :index="'/'+subitem.path" v-for="subitem in item.children"
                        :key="subitem.id" @click="saveRouter('/' + subitem.path)">
            <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{subitem.authName}}</span>
            </template>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>
<!--    主要内容区-->
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</el-container>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      menulist: [],
      iconList: ['el-icon-s-custom',
        'el-icon-s-goods',
        'el-icon-s-order',
        'el-icon-toilet-paper',
        'el-icon-s-marketing',
        'el-icon-toilet-paper'
      ],
      isFold: true,
      activePath: ''
    }
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      // 左侧导航栏的数据也是通过 axios请求得到的  接口 是 menus得到
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      // console.log(res)
    },
    collapseNav () {
      this.isFold = !this.isFold
    },
    saveRouter (routerUrl) {
      window.sessionStorage.setItem('routerUrl', routerUrl)
      this.activePath = routerUrl
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('routerUrl')
  }
}
</script>

<style lang="less" scoped>
  .home-wrapper{
    height: 100%;
  }
  .flod-btn{
    background-color: cornflowerblue;
    letter-spacing: 0.2em;
    text-align: center;
    font-size: 20px;
    cursor: pointer;
    color: gray;
  }
  .el-header{
    background-color: lightblue;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    > div {
      display: flex;
      align-items: center;
      >img {
        margin-left: -15px;
      }
      > span {
        margin-left: 10px;
      }
    }
  }
  .el-aside{
    background-color: lightsalmon;
    .el-menu{
      border-right: none;
    }
  }
  .el-main{
    background-color: #e7e1cd;
  }
</style>
