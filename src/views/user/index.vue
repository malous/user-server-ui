<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="姓名或账户" style="width: 300px;" class="filter-item"/>
      <el-button style="margin-left: 100px" class="filter-item" type="primary" icon="el-icon-search">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 30px; width: 120px" type="primary" icon="el-icon-edit">
        Add
      </el-button>
      <!-- <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        Export
      </el-button> -->
    </div>

    <el-table :data="userList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" prop="name" label="姓名" width="220">
        <!-- <template slot-scope="scope">
          {{ scope.row.name }}
        </template> -->
      </el-table-column>
      <el-table-column align="center" label="账户" width="220">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="电话">
        <template slot-scope="scope">
          {{ scope.row.phone }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="邮箱">
        <template slot-scope="scope">
          {{ scope.row.email }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="备注">
        <template slot-scope="scope">
          {{ scope.row.note }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'Edit User':'New User'">
      <el-form :model="user" label-width="80px" label-position="left">
        <el-form-item label="Name">
          <el-input v-model="user.name" placeholder="User Name" />
        </el-form-item>
        <el-form-item label="Desc">
          <el-input
            v-model="user.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="User Description"
          />
        </el-form-item>
        <el-form-item label="Menus">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="routesData"
            :props="defaultProps"
            show-checkbox
            node-key="path"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmUser">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import { deepClone } from '@/utils'
import { getUsers, addUser, deleteUser, updateUser } from '@/api/user'

const defaultUser = {
  key: '',
  name: '',
  description: '',
  routes: []
}

export default {
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined
      },
      user: Object.assign({}, defaultUser),
      routes: [],
      userList: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    // Mock: get all routes and users list from server
    this.getUsers({ name: undefined, pageNum: this.listQuery.page, pageSize: this.listQuery.limit })
  },
  methods: {
    async getUsers(data) {
      const res = await getUsers(data)
      res.result.forEach(element => {
        this.userList.push({
          id: element.id,
          name: element.name,
          username: element.username,
          phone: element.phone,
          note: element.note
        })
      })
    },

    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        data.push(route)
        if (route.children) {
          const temp = this.generateArr(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        }
      })
      return data
    },

    handleAddUser() {
      this.user = Object.assign({}, defaultUser)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
    },

    handleUpdate(row) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.user = deepClone(row)
      this.$nextTick(() => {
        const routes = this.generateRoutes(this.user.routes)
        this.$refs.tree.setCheckedNodes(this.generateArr(routes))
        // set checked state of a node not affects its father and child nodes
        this.checkStrictly = false
      })
    },
    handleDelete({ $index, row }) {
      this.$confirm('Confirm to remove the user?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await deleteUser(row.key)
          this.usersList.splice($index, 1)
          this.$message({
            type: 'success',
            message: 'Delete succed!'
          })
        })
        .catch(err => { console.error(err) })
    },
    generateTree(routes, basePath = '/', checkedKeys) {
      const res = []

      for (const route of routes) {
        const routePath = path.resolve(basePath, route.path)

        // recursive child routes
        if (route.children) {
          route.children = this.generateTree(route.children, routePath, checkedKeys)
        }

        if (checkedKeys.includes(routePath) || (route.children && route.children.length >= 1)) {
          res.push(route)
        }
      }
      return res
    },
    async confirmUser() {
      const isEdit = this.dialogType === 'edit'

      const checkedKeys = this.$refs.tree.getCheckedKeys()
      this.user.routes = this.generateTree(deepClone(this.serviceRoutes), '/', checkedKeys)

      if (isEdit) {
        await updateUser(this.user.key, this.user)
        for (let index = 0; index < this.usersList.length; index++) {
          if (this.usersList[index].key === this.user.key) {
            this.usersList.splice(index, 1, Object.assign({}, this.user))
            break
          }
        }
      } else {
        const { data } = await addUser(this.user)
        this.user.key = data.key
        this.usersList.push(this.user)
      }

      const { description, key, name } = this.user
      this.dialogVisible = false
      this.$notify({
        title: 'Success',
        dangerouslyUseHTMLString: true,
        message: `
            <div>User Key: ${key}</div>
            <div>User Name: ${name}</div>
            <div>Description: ${description}</div>
          `,
        type: 'success'
      })
    },
    // reference: src/view/layout/components/Sidebar/SidebarItem.vue
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)

      // When there is only one child route, the child route is displayed by default
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      // Show parent if there are no child route to display
      if (showingChildren.length === 0) {
        onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return onlyOneChild
      }

      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .users-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
