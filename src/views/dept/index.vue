<template>
  <div class="app-container">
    <el-row style="height: 100%; margin-top: 20px">
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header" class="clearfix" style="text-align: center">
            <span>部门组织</span>
          </div>
          <el-tree
            ref="deptTree"
            node-key="id"
            :data="deptTree"
            :props="deptProps"
            class="filter-tree"
            default-expand-all
          >
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <span>{{ node.label }}</span>
              <span>
                <el-button type="text" size="mini" @click="() => append(data)">Add</el-button>
                <el-button type="text" size="mini" @click="() => remove(node, data)">Del</el-button>
              </span>
            </span>
          </el-tree>
        </el-card>
        <!-- <el-input v-model="filterText" placeholder="Filter keyword" style="margin-bottom:30px;" /> -->
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getDept } from '@/api/dept'

export default {
  data() {
    return {
      deptTree: [],
      deptProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  created() {
    this.getDeptTree()
  },
  methods: {
    async getDeptTree() {
      const res = await getDept()
      this.deptTree = res.result
      console.log(this.deptTree)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .box-card {
    .custom-tree-node {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      padding-right: 8px
    }
  }
  .role-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
