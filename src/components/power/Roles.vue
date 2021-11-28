<template>
  <div>
    <!--    头部导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
<!--    表格主题内容区-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesVs = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe>
<!--        权限树的扩展栏显示-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['vcenter','bdbottom', index===0?'bdtop':'']"
              v-for="(item1, index) in scope.row.children" :key="item1.id">
<!--              渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="deleteUserRole(scope.row,item1.id)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
<!--              渲染二级与三级权限-->
              <el-col :span="18">
                <el-row :class="['vcenter',i2===0?'':'bdtop']" v-for="(item2,i2) in item1.children" :key="item2.id">
<!--                  渲染二级权限-->
                  <el-col :span="8">
                    <el-tag type="success" closable
                            @close="deleteUserRole(scope.row,item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
<!--                  渲染三级权限-->
                  <el-col :span="14">
                    <el-tag type="warning" closable @close="deleteUserRole(scope.row,item3.id)"
                            v-for="item3 in item2.children" :key="item3.id">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>

              </el-col>
            </el-row>
<!--            <pre>-->
<!--              <span>{{scope.row}}</span>-->
<!--            </pre>-->
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRolesByid(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="changeUserRight(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--添加新用户任务窗口-->
    <el-dialog
      title="添加角色" width="50%"
      :visible.sync="addRolesVs"
      @close="addRoleClose">
      <!--      表单主体部分-->
      <el-form :model="addRoleForm" :rules="addRoleRules" ref="addRoleForm" label-width="70px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--          表单尾部信息，控制按钮-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addRolesVs = false">取 消</el-button>
    <el-button type="primary" @click="addRoles">确 定</el-button>
  </span>
    </el-dialog>
<!--    编辑用户任务窗口-->
    <el-dialog
      title="编辑角色信息" width="50%"
      :visible.sync="editRolesVs"
      @close="editRoleClose">
      <!--      表单主体部分-->
      <el-form :model="editRoleForm" :rules="editRoleRules" ref="editRoleForm" label-width="70px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!--          表单尾部信息，控制按钮-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="editRolesVs = false">取 消</el-button>
    <el-button type="primary" @click="editRoles">确 定</el-button>
  </span>
    </el-dialog>
<!--    编辑用户权限任务窗口-->
    <el-dialog
      title="分配角色权限" width="50%"
      :visible.sync="setRightVs"
     @close="setRightClose">
      <!--      树形结构控件部分-->
      <el-tree :data="rightList" :props="rightProps" default-expand-all show-checkbox
               :default-checked-keys="defKeys" node-key="id" ref="setRightForm"></el-tree>
      <!--          表单尾部信息，控制按钮-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightVs = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data () {
    return {
      roleList: [],
      addRolesVs: false,
      editRolesVs: false,
      setRightVs: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      editRoleForm: {},
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      },
      editRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      },
      // 存储权限列表
      rightList: [],
      // 对应属性结构的标签与子树
      rightProps: {
        children: 'children',
        label: 'authName'
      },
      // 这是勾选权限的列表
      defKeys: [],
      roleId: ''
    }
  },
  methods: {
    // 获得角色信息列表
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.roleList = res.data
      // console.log(this.roleList)
    },
    // 添加一个角色
    addRoles () {
      this.$refs.addRoleForm.validate(async valid => {
        if (!valid) return this.$message.error('请输入正确信息')
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) return this.$message.error('创建失败')
        this.$message.success('添加成功')
        this.addRolesVs = false
        await this.getRoleList()
        // console.log(this.addRoleForm)
      })
    },
    // 任务窗口关闭重置
    addRoleClose () {
      this.$refs.addRoleForm.resetFields()
    },
    // 通过id查询用户权限，存储数据
    async editRolesByid (id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editRoleForm = res.data
      this.editRolesVs = true
    },
    // 编辑角色信息，先要获取角色信息通过id 然后暂存， 再提交
    editRoles () {
      this.$refs.editRoleForm.validate(async valid => {
        if (!valid) return this.$message.error('请输入正确信息')
        const { data: res } = await this.$http.put(`roles/${this.editRoleForm.roleId}`, {
          roleName: this.editRoleForm.roleName, roleDesc: this.editRoleForm.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('修改成功成功')
        this.editRolesVs = false
        await this.getRoleList()
        // console.log(this.addRoleForm)
      })
    },
    editRoleClose () {
      this.$refs.editRoleForm.resetFields()
    },
    // 删除角色要确认框提示
    async deleteRole (id) {
      // console.log(id)
      // 弹框信息询问是否删除
      const res = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(res)
      // 如果用户确认删除，返回的时字符串 confirm， 取消则返回 cancel
      if (res !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res1 } = await this.$http.delete(`roles/${id}`)
      if (res1.meta.status !== 200) return this.$message.error('删除失败')
      await this.getRoleList()
      this.$message.success('删除成功')
    },
    // 操作权限树，删除角色对应的权限
    async deleteUserRole (role, rightId) {
      // 弹框信息询问是否删除
      const res = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(res)
      // 如果用户确认删除，返回的时字符串 confirm， 取消则返回 cancel
      if (res !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res1 } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res1.meta.status !== 200) return this.$message.error('删除失败')
      // await this.getRoleList()
      role.children = res1.data
      this.$message.success(res1.meta.msg)
    },
    // 分配权限设置，获取所有权限的列表为角色分配权限
    async changeUserRight (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // console.log(res.data)
      this.rightList = res.data
      // console.log(this.rightList)
      this.getLeftKeys(role, this.defKeys)
      // console.log(this.defKeys)
      this.setRightVs = true
    },
    // 输入当前角色与获取选中权限的id， 用递归的方式将三级节点加入到数组中
    getLeftKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getLeftKeys(item, arr)
      })
    },
    setRightClose () {
      this.defKeys = []
    },
    // 修改当前角色的权限并发送给后端更新
    async allotRights () {
      const rightlist = [
        ...this.$refs.setRightForm.getCheckedKeys(),
        ...this.$refs.setRightForm.getHalfCheckedKeys()
      ]
      const strIdList = rightlist.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`,
        { rids: strIdList })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.setRightVs = false
      await this.getRoleList()
      // console.log(rightlist)
    }
  },
  created () {
    this.getRoleList()
  }
}
</script>

<style lang="less" scoped>
  .el-tag{
    margin: 7px;
  }
  .bdtop{
    border-top: 1px solid #eee;
  }
  .bdbottom{
    border-bottom: 1px solid #eee;
  }
  .vcenter{
    display: flex;
    align-items: center;
  }
</style>
