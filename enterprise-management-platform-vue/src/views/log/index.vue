<script setup>
import { ref, onMounted } from "vue";
import { queryPageApi } from '@/api/log.js';

const logList = ref([]);
const total = ref(0);
const pageSize = ref(10);
const currentPage = ref(1);
const background = ref(true);

//查询
const search = async () => {
  const result = await queryPageApi(currentPage.value, pageSize.value);
  if (result.code) {
    logList.value = result.data.rows;
    total.value = result.data.total;
  };
};



//格式化时间
const timeFormatter = (row, column) => {
  const date = row[column.property];
  if (date) {
    return date.replace('T', ' ');
  }
  return '';
}

//格式化类名
const classFormatter = (row, column) => {
  const data = row[column.property];
  if (data) {
    return data.substring(data.lastIndexOf('.') + 1);
  }
  return '';
}

//每页展示记录数变化时触发
const handleSizeChange = (val) => {
  search();
}

//页码变化时触发
const handleCurrentChange = (val) => {
  search();
}

//钩子函数
onMounted(() => {
  search();
});


</script>

<template>
  <h1>日志管理</h1>
  <!-- 表格 -->
  <div class="container">
    <el-table :data="logList" border style="width: 100%" :header-cell-style="{ backgroundColor: '#f5f7fa' }">
      <el-table-column type="index" label="序号" width="70" align="center" />
      <el-table-column prop="id" label="操作员工ID" width="100" align="center" />
      <el-table-column prop="operateEmpName" label="操作员工姓名" width="110" align="center" />
      <el-table-column prop="operateTime" label="操作时间" width="150" :formatter="timeFormatter" align="center" />
      <el-table-column prop="className" label="类名" width="180" align="center" :formatter="classFormatter" />
      <el-table-column label="方法名" width="150" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.methodName.includes('delete') ? 'danger' : 'primary'">{{ scope.row.methodName
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="请求参数" show-overflow-tooltip width="250" align="center">
        <template #default="scope">
          <el-tag type="success">{{ scope.row.methodParams }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="返回值" show-overflow-tooltip width="250" align="center">
        <template #default="scope">
          <el-tag type="info">{{ scope.row.returnValue }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="costTime" label="耗时(ms)" align="center" />

    </el-table>
  </div>

  <!-- 分页条 -->
  <div class="container">
    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
      :page-sizes="[5, 10, 20, 30, 50, 75, 100]" :background="background"
      layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />
  </div>

</template>

<style scoped>
.container {
  margin-top: 18px;
}
</style>