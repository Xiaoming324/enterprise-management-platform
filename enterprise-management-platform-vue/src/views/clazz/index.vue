<script setup>
import { onMounted, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from 'element-plus';
import { queryPageApi, addApi, queryByIdApi, updateApi, deleteByIdApi } from "@/api/clazz.js";
import { queryAllApi as queryAllEmpsApi } from "@/api/emp.js";

const searchClazz = ref({ name: '', begin: '', end: '', date: [] });
const clazzList = ref([]);
const total = ref(0);
const pageSize = ref(10);
const currentPage = ref(1);
const background = ref(true);
const dialogFormVisible = ref(false)
const dialogTitle = ref('');
const clazzFormRef = ref();
const clazz = ref({
  name: '',
  room: '',
  beginDate: '',
  endDate: '',
  masterId: '',
  subject: ''
});

// 自定义验证函数
const validateDateRange = (rule, value, callback) => {
  if (!clazz.value.beginDate || !clazz.value.endDate) {
    callback();
    return;
  }

  const begin = new Date(clazz.value.beginDate);
  const end = new Date(clazz.value.endDate);

  if (begin > end) {
    callback(new Error('开课时间必须小于等于结课时间'));
  } else {
    callback();
  }
};

const rules = ref({
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 4, max: 30, message: '班级名称长度应在4-30个字符之间', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/, message: '班级名称只能包含汉字、数字和字母', trigger: 'blur' }
  ],
  room: [
    { min: 1, max: 20, message: '班级教室长度应在1-20个字符之间', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/, message: '班级教室只能包含汉字、数字和字母', trigger: 'blur' }
  ],
  beginDate: [
    { required: true, message: '请选择开课时间', trigger: 'blur' },
    { validator: validateDateRange, trigger: 'blur' }
  ],
  endDate: [
    { required: true, message: '请选择结课时间', trigger: 'blur' },
    { validator: validateDateRange, trigger: 'blur' }
  ],
  subject: [
    { required: true, message: '请选择学科', trigger: 'change' }
  ]
});
//元数据
//班主任列表数据
const emps = ref([]);
//职位列表数据
const subjects = ref([{ name: 'java', value: 1 }, { name: '前端', value: 2 }, { name: '大数据', value: 3 }, { name: 'Python', value: 4 }, { name: 'Go', value: 5 }, { name: '嵌入式', value: 6 }])

watch(() => searchClazz.value.date, (newVal, oldVal) => {
  if (newVal.length == 2) {
    searchClazz.value.begin = newVal[0];
    searchClazz.value.end = newVal[1];
  } else {
    searchClazz.value.begin = '';
    searchClazz.value.end = '';
  }
})

//查询班级列表
const search = async () => {
  const result = await queryPageApi(searchClazz.value.name, searchClazz.value.begin, searchClazz.value.end, currentPage.value, pageSize.value);
  if (result.code) {
    clazzList.value = result.data.rows;
    total.value = result.data.total;
  };
};

//清空查询班级列表
const clear = () => {
  searchClazz.value = { name: '', begin: '', end: '', date: [] };
  search();
}

//每页展示记录数变化时触发
const handleSizeChange = (val) => {
  search();
}

//页码变化时触发
const handleCurrentChange = (val) => {
  search();
}

//格式化时间
const formatter = (row, column) => {
  const date = row[column.property];
  if (date) {
    return date.replace('T', ' ');
  }
  return '';
}

//新增班级
const addClazz = () => {
  dialogFormVisible.value = true;
  dialogTitle.value = '新增班级';
  clazz.value = {
    name: '',
    room: '',
    beginDate: '',
    endDate: '',
    masterId: '',
    subject: ''
  };
  //重置表单的校验规则-提示信息
  if (clazzFormRef.value) {
    clazzFormRef.value.resetFields();
  };
}

//查询全部员工数据
const queryAllEmps = async () => {
  const result = await queryAllEmpsApi();
  if (result.code) {
    emps.value = result.data;
  }
};

//保存班级
const add = () => {
  //表单校验
  if (!clazzFormRef.value) return;
  clazzFormRef.value.validate(async (valid) => { //valid表示是否校验通过：true通过 / false不通过
    if (valid) {
      let result;
      if (clazz.value.id) { //修改
        result = await updateApi(clazz.value);
      } else { //新增
        result = await addApi(clazz.value);
      }
      if (result.code) {
        ElMessage.success('保存成功');
        dialogFormVisible.value = false;
        search();
      } else {
        ElMessage.error(result.msg);
      }
    } else {
      ElMessage.error('表单校验不通过')
    }
  })
};

//编辑班级
const edit = async (id) => {
  dialogTitle.value = '修改班级';
  //重置表单的校验规则-提示信息
  if (clazzFormRef.value) {
    clazzFormRef.value.resetFields();
  };
  const result = await queryByIdApi(id);
  if (result.code) {
    dialogFormVisible.value = true;
    clazz.value = result.data;
  }
};

//删除
const delById = (id) => {
  ElMessageBox.confirm(
    '您确定要删除该班级吗?',
    '删除班级',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {//确认
      const result = await deleteByIdApi(id);
      if (result.code) {
        ElMessage.success('删除成功');
        search();
      } else {
        ElMessage.error(result.msg);
      }
    }).catch(() => {//取消
      ElMessage.info('您已取消删除');
    });
};


//钩子函数
onMounted(() => {
  search();
  queryAllEmps();
});

</script>

<template>
  <h1>班级管理</h1>
  <!-- 搜索栏 -->
  <div class="container">
    <el-form :inline="true" :model="searchClazz" class="demo-form-inline">
      <el-form-item label="班级名称">
        <el-input v-model="searchClazz.name" placeholder="请输入班级名称" />
      </el-form-item>

      <el-form-item label="结课时间">
        <el-date-picker v-model="searchClazz.date" type="daterange" range-separator="至" start-placeholder="开始时间"
          end-placeholder="结束时间" :size="size" value-format="YYYY-MM-DD" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>
  </div>

  <!-- 功能按钮 -->
  <div>
    <el-button type="primary" @click="addClazz">+ 新增班级</el-button>
  </div>

  <!-- 表格 -->
  <div class="container">
    <el-table :data="clazzList" border style="width: 100%" :header-cell-style="{ backgroundColor: '#f5f7fa' }">
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="name" label="班级名称" width="150" align="center" />
      <el-table-column prop="room" label="班级教室" width="150" align="center" />
      <el-table-column prop="masterName" label="班主任" width="150" align="center" />
      <el-table-column prop="beginDate" label="开课时间" width="180" align="center" />
      <el-table-column prop="endDate" label="结课时间" width="180" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center" />
      <el-table-column prop="updateTime" label="最后操作时间" width="180" align="center" :formatter="formatter" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button size="small" type="primary" @click="edit(scope.row.id)">
            <el-icon>
              <EditPen />
            </el-icon>编辑
          </el-button>
          <el-button size="small" type="danger" @click="delById(scope.row.id)">
            <el-icon>
              <Delete />
            </el-icon>删除
          </el-button>
        </template>
      </el-table-column>

    </el-table>
  </div>

  <!-- 分页条 -->
  <div class="container">
    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
      :page-sizes="[5, 10, 20, 30, 50, 75, 100]" :background="background"
      layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />
  </div>

  <!-- Dialog对话框 -->
  <el-dialog v-model="dialogFormVisible" :title="dialogTitle" width="500">
    <el-form :model="clazz" :rules="rules" ref="clazzFormRef">
      <el-form-item label="班级名称" label-width="80px" prop="name">
        <el-input v-model="clazz.name" placeholder="请输入班级名称" />
      </el-form-item>

      <el-form-item label="班级教室" label-width="80px" prop="room">
        <el-input v-model="clazz.room" placeholder="请填写班级教室" />
      </el-form-item>

      <el-form-item label="开课时间" label-width="80px" prop="beginDate">
        <el-date-picker v-model="clazz.beginDate" type="date" style="width: 100%;" placeholder="请选择开课时间"
          format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
      </el-form-item>

      <el-form-item label="结课时间" label-width="80px" prop="endDate">
        <el-date-picker v-model="clazz.endDate" type="date" style="width: 100%;" placeholder="请选择结课时间"
          format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
      </el-form-item>

      <el-form-item label="班主任" label-width="80px">
        <el-select v-model="clazz.masterId" placeholder="请选择" style="width: 100%;">
          <el-option v-for="e in emps" :key="e.id" :label="e.name" :value="e.id"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="学科" label-width="80px" prop="subject">
        <el-select v-model="clazz.subject" placeholder="请选择" style="width: 100%;">
          <el-option v-for="s in subjects" :key="s.name" :label="s.name" :value="s.value"></el-option>
        </el-select>
      </el-form-item>

    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="add">
          保存
        </el-button>
        <el-button type="info" @click="dialogFormVisible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>


</template>

<style scoped>
.container {
  margin-top: 18px;
}

.demo-form-inline .el-input {
  --el-input-width: 220px;
}
</style>