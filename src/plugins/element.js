import Vue from 'vue'
import {
  Button, Form, FormItem, Input, Message, MessageBox,
  Container, Header, Aside, Main,
  Menu, Submenu, MenuItem,
  Breadcrumb, BreadcrumbItem, Card,
  Row, Col, Table, TableColumn, Switch, Tooltip,
  Pagination, Dialog
} from 'element-ui'
// import { Form, FormItem } from 'element-ui'
// import { Input } from 'element-ui'

Vue.use(Button)
Vue.use(FormItem)
Vue.use(Form)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(BreadcrumbItem)
Vue.use(Breadcrumb)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(TableColumn)
Vue.use(Table)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
