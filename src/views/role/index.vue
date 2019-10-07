<template>
  <div class="app-container">
    <el-row style="height: 100%">
      <el-col :span="9">
        <el-row>
          <el-button type="primary" @click="handleAddRole">New Role</el-button>
          <el-button type="primary" @click="assignRole">Assign</el-button>
        </el-row>
        <el-table :data="roleList" style="width: 100%; margin-top:30px;" highlight-current-row border @current-change="handleTableChange">
          <el-table-column v-if="false" prop="id" />
          <el-table-column type="index" align="center" width="60px" />
          <el-table-column label="角色名" align="center" width="200px">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="medium" @click="handleEditRole(scope.row)">Edit</el-button>
              <el-button type="danger" size="medium" @click="handleDeleteRole(scope)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="14" :offset="1">
        <el-table :data="userRoleInfo" style="width: 100%; margin-top:50px;" border>
          <el-table-column v-if="false" prop="id" />
          <el-table-column type="index" align="center" width="60px" />
          <el-table-column label="姓名" align="center">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column label="账号" align="center">
            <template slot-scope="scope">
              {{ scope.row.username }}
            </template>
          </el-table-column>
          <el-table-column label="备注" align="center">
            <template slot-scope="scope">
              {{ scope.row.note }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作">
            <template slot-scope="scope">
              <el-button type="danger" size="medium" @click="handleDelete(scope)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'Edit Role':'New Role'">
      <el-form ref="role" :model="role" :rules="roleRule" label-width="80px" label-position="left">
        <el-form-item label="名称" prop="name">
          <el-input v-model="role.name" placeholder="Role Name" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="role.note"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="Role Description"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">Cancel</el-button>
        <el-button type="primary" @click="confirmRole">Confirm</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogTableVisible" title="分配角色">
      <el-table ref="userList" :data="userList" @select="handleSelect">
        <el-table-column v-if="false" prop="id" />
        <el-table-column type="selection" />
        <el-table-column align="center" label="姓名">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="账户">
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
      </el-table>
      <div style="text-align:right; margin-top: 30px">
        <el-button @click="dialogTableVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmAssign">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { getUsers } from '@/api/user'
import { getRoles, addRole, deleteRole, updateRole, getUserByRole, assignRole, deleteUserRole } from '@/api/role'

const defaultRole = {
  id: undefined,
  name: undefined,
  note: undefined
}

export default {
  data() {
    return {
      role: Object.assign({}, defaultRole),
      roleList: [],
      roleRule: {
        name: [
          { required: true, message: '请输入用户姓名', trigger: 'blur' }
        ]
      },
      currentRow: undefined,
      userRoleInfo: [],
      userList: [],
      dialogVisible: false,
      dialogType: 'new',
      dialogTableVisible: false
    }
  },
  created() {
    this.getRoles()
  },
  methods: {
    async getRoles() {
      const res = await getRoles()
      const list = []
      res.result.forEach(element => {
        list.push({
          id: element.id,
          name: element.name,
          note: element.note
        })
      })
      this.roleList = list
    },
    async getUsers() {
      const data = { pageNum: 1, pageSize: 100 }
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
    },
    handleAddRole() {
      this.role = Object.assign({}, defaultRole)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEditRole(row) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.role = deepClone(row)
    },
    handleDeleteRole({ $index, row }) {
      this.$confirm('Confirm to remove the role?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          await deleteRole(row.id)
          this.roleList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '成功删除数据'
          })
        })
        .catch(err => { console.error(err) })
    },
    confirmRole() {
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        this.$refs.role.validate(async(valid) => {
          if (valid) {
            await updateRole(this.role)
            for (let index = 0; index < this.roleList.length; index++) {
              if (this.roleList[index].id === this.role.id) {
                this.roleList.splice(index, 1, Object.assign({}, this.role))
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
        this.$refs.role.validate(async(valid) => {
          if (valid) {
            const res = await addRole(this.role)
            this.role.id = res.result
            this.roleList.push(this.role)
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
    async handleTableChange(row) {
      this.currentRow = row
      const res = await getUserByRole(row.id)
      this.userRoleInfo = res.result
    },
    assignRole() {
      if (this.currentRow) {
        this.getUsers()
        this.dialogTableVisible = true
      } else {
        this.$message({
          type: 'warning',
          message: '请先选择一个角色'
        })
      }
    },
    async confirmAssign() {
      const roleId = this.currentRow.id
      const userList = this.$refs.userList.selection
      const list = []
      userList.forEach(user => {
        list.push({
          'userId': user.id,
          'roleId': roleId
        })
      })
      const res = await assignRole(list)
      if (res.code === 200) {
        this.$message({
          type: 'success',
          message: '操作成功'
        })
        const data = await getUserByRole(roleId)
        this.userRoleInfo = data.result
        this.dialogTableVisible = false
      } else {
        this.$message.error(res.msg)
      }
    },
    handleDelete({ $index, row }) {
      this.$confirm('是否确认删除该用户角色?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteUserRole(row.id)
          this.userRoleInfo.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => { console.error(err) })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .role-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
