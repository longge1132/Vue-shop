import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import User from '../components/user/User'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: User }
      ]
    }
  ]
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to: 将要访问的路径 from：从哪个路径来 next()放行  或 next（‘/path’）强制跳转
  if (to.path === '/login') return next()
  const isToken = window.sessionStorage.getItem('token')
  // console.log(isToken)
  if (!isToken) return next('/login')
  // 如果session中 token为空则强制跳转， 否则放行
  next()
})
export default router
