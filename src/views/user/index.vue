<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="姓名或账户" style="width: 300px;" class="filter-item" />
      <el-button style="margin-left: 100px" class="filter-item" type="primary" icon="el-icon-search" @click="handleSearch()">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 30px; width: 120px" type="primary" icon="el-icon-edit" @click="handleAddUser()">
        Add
      </el-button>
    </div>

    <el-table :data="userList" style="width: 100%;margin-top:30px;" border>
      <el-table-column v-if="false" prop="id" />
      <el-table-column align="center" label="姓名" width="220">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
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
          <el-button type="primary" size="small" @click="handleUpdate(scope.row)">Edit</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-show="total>0"
      :hide-on-single-page="true"
      :current-page="listQuery.page"
      :page-size="listQuery.limit"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      style="margin-top: 20px"
      @size-change="handleSizeChangle"
      @current-change="handlePageChange"
    />

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'Edit User':'New User'">
      <el-form ref="user" :model="user" :rules="userRule" label-width="80px" label-position="left">
        <el-form-item label="账号" prop="username">
          <el-input v-model="user.username" placeholder="Username" />
        </el-form-item>
        <el-form-item v-if="dialogType=='new'" label="密码" prop="password">
          <el-input v-model="user.password" placeholder="Password" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="user.name" placeholder="Name" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="user.email" placeholder="Email" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="user.phone" placeholder="Phone" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="user.note"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="Note"
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
import { deepClone } from '@/utils'
import { validPhone, validEmail } from '@/utils/validate'
import { getUsers, addUser, deleteUser, updateUser } from '@/api/user'

const defaultUser = {
  username: '',
  password: '',
  name: '',
  phone: '',
  email: '',
  note: ''
}

export default {
  data() {
    const checkPhone = (rule, value, callback) => {
      if (value && !validPhone(value)) {
        callback(new Error('请输入正确的电话号码'))
      } else {
        callback()
      }
    }
    const checkEmail = (rule, value, callback) => {
      if (value && !validEmail(value)) {
        callback(new Error('请输入正确的邮箱账号'))
      } else {
        callback()
      }
    }
    return {
      total: 0,
      listQuery: {
        name: undefined,
        page: 1,
        limit: 10
      },
      user: Object.assign({}, defaultUser),
      userList: [],
      userRule: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入用户姓名', trigger: 'blur' }
        ],
        phone: [
          { required: false, trigger: 'blur', validator: checkPhone }
        ],
        email: [
          { required: false, trigger: 'blur', validator: checkEmail }
        ]
      },
      dialogVisible: false,
      dialogType: 'new'
    }
  },
  created() {
    this.handleSearch()
  },
  methods: {
    async getUsers(data) {
      const res = await getUsers(data)
      const list = []
      res.result.forEach(element => {
        list.push({
          id: element.id,
          name: element.name,
          username: element.username,
          phone: element.phone,
          email: element.email,
          note: element.note
        })
      })
      this.userList = list
      this.total = res.total
    },
    handleSearch() {
      this.getUsers({
        name: this.listQuery.name,
        pageNum: this.listQuery.page,
        pageSize: this.listQuery.limit
      })
    },
    handleAddUser() {
      this.user = Object.assign({}, this.defaultUser)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleUpdate(row) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.user = deepClone(row)
    },
    handleDelete({ $index, row }) {
      this.$confirm('Confirm to remove the user?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await deleteUser(row.id)
          this.userList.splice($index, 1)
          this.$message({
            type: 'success',
            message: 'Delete succed!'
          })
        })
        .catch(err => { console.error(err) })
    },
    confirmUser() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        this.userRule.password[0].required = false
        this.$refs.user.validate(async(valid) => {
          if (valid) {
            await updateUser(this.user)
            for (let index = 0; index < this.userList.length; index++) {
              if (this.userList[index].id === this.user.id) {
                this.userList.splice(index, 1, Object.assign({}, this.user))
                this.$message({
                  type: 'success',
                  message: '成功更新数据'
                })
                break
              }
            }
            this.dialogVisible = false
          } else {
            this.$message.error('数据不符合规范，请重新填写')
            return false
          }
        })
      } else {
        this.userRule.password[0].required = true
        this.$refs.user.validate(async(valid) => {
          if (valid) {
            const res = await addUser(this.user)
            this.user.id = res.result
            delete this.user.password
            this.userList.push(this.user)
            this.$message({
              message: '添加数据成功！',
              type: 'success'
            })
            this.dialogVisible = false
          } else {
            this.$message.error('数据不符合规范，请重新填写')
            return false
          }
        })
      }
    },
    handleSizeChange() {
      this.handleSearch()
    },
    handlePageChange() {
      this.handleSearch()
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
