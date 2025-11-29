<script setup>
import { onMounted, ref } from 'vue';
import { queryAllApi as queryAllClazzsApi } from '@/api/clazz.js';
import { queryPageApi, addApi, queryByIdApi, updateApi, deleteByIdsApi, punishApi } from '@/api/stu.js';
import { ElMessage, ElMessageBox } from 'element-plus';

const searchStu = ref({ name: '', degree: '', clazzId: '' });
const stuList = ref([]);
const degrees = ref([{ name: '初中', value: 1 }, { name: '高中', value: 2 }, { name: '大专', value: 3 }, { name: '本科', value: 4 }, { name: '硕士', value: 5 }, { name: '博士', value: 6 }]);
const clazzs = ref([]);
const total = ref(0);
const pageSize = ref(10);
const currentPage = ref(1);
const background = ref(true);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const student = ref({
  name: '',
  no: '',
  gender: '',
  phone: '',
  idCard: '',
  isCollege: '',
  address: '',
  degree: '',
  graduationDate: '',
  clazzId: ''
});
const rules = ref({
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度应在2到10个字符之间', trigger: 'blur' },
    { pattern: /^[\u4e00-\u9fa5a-zA-Z]+$/, message: '姓名只能包含汉字、字母', trigger: 'blur' }
  ],
  no: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { len: 10, message: '学号必须是10个字符', trigger: 'blur' },
    { pattern: /^[0-9a-zA-Z]+$/, message: '学号只能包含数字、字母', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    {
      pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
      message: '请输入有效的身份证号', trigger: 'blur'
    }
  ],
  isCollege: [
    { required: true, message: '请选择是否院校学员', trigger: 'change' }
  ],
  address: [
    { min: 0, max: 100, message: '地址长度应在0到100个字符之间', trigger: 'blur' }
  ]
});
const stuFormRef = ref();
const genders = ref([{ name: '男', value: 1 }, { name: '女', value: 2 }]);
const selections = ref([{ name: '是', value: 1 }, { name: '否', value: 0 }]);
//记录勾选的学员的id
const selectedIds = ref([]);

const queryAllClazzs = async () => {
  const result = await queryAllClazzsApi();
  if (result.code) {
    clazzs.value = result.data;
  }
}

const search = async () => {
  const result = await queryPageApi(searchStu.value.name, searchStu.value.degree, searchStu.value.clazzId, currentPage.value, pageSize.value);
  if (result.data) {
    stuList.value = result.data.rows;
    total.value = result.data.total;
  };
};

const clear = () => {
  searchStu.value = { name: '', degree: '', clazzId: '' };
  search();
};

const addStu = () => {
  dialogVisible.value = true;
  dialogTitle.value = '添加学员';
  student.value = {
    name: '',
    no: '',
    gender: '',
    phone: '',
    idCard: '',
    isCollege: '',
    address: '',
    degree: '',
    graduationDate: '',
    clazzId: ''
  };
  //重置表单的校验规则-提示信息
  if (stuFormRef.value) {
    stuFormRef.value.resetFields();
  };
};

const save = async () => {
  //表单校验
  if (!stuFormRef.value) return;
  stuFormRef.value.validate(async (valid) => { //valid表示是否校验通过：true通过 / false不通过
    if (valid) {//通过
      let result;
      if (student.value.id) {//修改
        result = await updateApi(student.value);
      } else {//新增
        result = await addApi(student.value);
      }
      if (result.code) {
        ElMessage.success('保存成功');
        dialogVisible.value = false;
        search();
      } else {
        ElMessage.error(result.msg);
      }
    } else { //不通过
      ElMessage.error('表单校验不通过');
    }
  })
};

const edit = async (id) => {
  //重置表单的校验规则-提示信息
  if (stuFormRef.value) {
    stuFormRef.value.resetFields();
  };
  const result = await queryByIdApi(id);
  if (result.code) {
    dialogVisible.value = true;
    dialogTitle.value = '修改学员';
    student.value = result.data;
  };
};

const deleteById = async (id) => {
  //弹出确认框
  ElMessageBox.confirm(
    '您确定要删除该学员的信息吗?',
    '删除学员',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => { //确认
      const result = await deleteByIdsApi(id);
      if (result.code) {
        ElMessage.success('删除成功');
        search();
      } else {
        ElMessage.error(result.msg);
      }
    }).catch(() => { //取消
      ElMessage.info('您已取消删除');
    });
};

const deleteByIds = async () => {
  //弹出确认框
  ElMessageBox.confirm(
    '您确定要删除该学员的信息吗?',
    '删除学员',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => { //确认
      if (selectedIds.value && selectedIds.value.length > 0) {
        const result = await deleteByIdsApi(selectedIds.value);
        if (result.code) {
          ElMessage.success('删除成功');
          search();
        } else {
          ElMessage.error(result.msg);
        }
      } else {
        ElMessage.info('您没有选择任何要删除的数据');
      }
    }).catch(() => { //取消
      ElMessage.info('您已取消删除');
    });
};

const punish = (id) => {
  ElMessageBox.prompt('违纪扣分', '学员违纪处理', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPattern: /^\d+$/,
    inputErrorMessage: '请输入有效的整数',
  })
    .then(async ({ value }) => {
      const result = await punishApi(id, value);
      if (result.code) {
        ElMessage.success('违纪处理成功');
        search();
      } else {
        ElMessage.error(result.msg);
      }
    })
    .catch(() => {
      ElMessage.info('您已取消违纪处理');
    })
};

//格式化时间
const formatter = (row, column) => {
  const date = row[column.property];
  if (date) {
    return date.replace('T', ' ');
  }
  return '';
}

//每页展示记录数变化时触发
const handleSizeChange = (val) => {
  search();
};

//页码变化时触发
const handleCurrentChange = (val) => {
  search();
};

//复选框勾选发生变化时触发 - selection:当前选中的记录（数组）
const handleSelectionChange = (element) => {
  selectedIds.value = element.map(item => item.id);
};

onMounted(() => {
  search();
  queryAllClazzs();
});

</script>


<template>
  <h1>学员管理</h1>

  <!-- 搜索栏 -->
  <div class="container">
    <el-form :inline="true" :model="searchStu" class="demo-form-inline">
      <el-form-item label="姓名">
        <el-input v-model="searchStu.name" placeholder="请输入学员姓名" />
      </el-form-item>

      <el-form-item label="最高学历" label-width="80px">
        <el-select v-model="searchStu.degree" placeholder="请选择" style="width: 100%;">
          <el-option v-for="d in degrees" :key="d.name" :label="d.name" :value="d.value"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="所属班级" label-width="80px">
        <el-select v-model="searchStu.clazzId" placeholder="请选择" style="width: 100%;">
          <el-option v-for="c in clazzs" :key="c.id" :label="c.name" :value="c.id"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>
  </div>

  <!-- 功能按钮 -->
  <div>
    <el-button type="primary" @click="addStu">+ 添加学员</el-button>
    <el-button type="danger" @click="deleteByIds">- 批量删除</el-button>
  </div>

  <!-- 表格 -->
  <div class="container">
    <el-table :data="stuList" border @selection-change="handleSelectionChange" style="width: 100%"
      :header-cell-style="{ backgroundColor: '#f5f7fa' }">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column prop="name" label="姓名" width="100" align="center" />
      <el-table-column prop="no" label="学号" width="100" align="center" />
      <el-table-column prop="clazzName" label="班级" width="150" align="center" />
      <el-table-column label="性别" width="60" align="center">
        <template #default="scope">
          {{ scope.row.gender == 1 ? '男' : '女' }}
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="130" align="center" />
      <el-table-column label="最高学历" width="100" align="center">
        <template #default="scope">
          <span v-if="scope.row.degree == 1">初中</span>
          <span v-else-if="scope.row.degree == 2">高中</span>
          <span v-else-if="scope.row.degree == 3">大专</span>
          <span v-else-if="scope.row.degree == 4">本科</span>
          <span v-else-if="scope.row.degree == 5">硕士</span>
          <span v-else-if="scope.row.degree == 6">博士</span>
          <span v-else>其他</span>
        </template>
      </el-table-column>
      <el-table-column prop="violationCount" label="违纪次数" width="100" align="center" />
      <el-table-column prop="violationScore" label="违纪扣分" width="100" align="center" />
      <el-table-column prop="updateTime" label="最后操作时间" width="180" align="center" :formatter="formatter" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button size="small" type="primary" @click="edit(scope.row.id)">
            <el-icon>
              <EditPen />
            </el-icon>编辑
          </el-button>
          <el-button size="small" type="warning" @click="punish(scope.row.id)">
            <el-icon>
              <EditPen />
            </el-icon>违纪
          </el-button>
          <el-button size="small" type="danger" @click="deleteById(scope.row.id)">
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

  <!-- 新增员工/修改学员的对话框 -->
  <el-dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form :model="student" :rules="rules" ref="stuFormRef" label-width="120px">
      <!-- 基本信息 -->
      <!-- 第一行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="student.name" placeholder="请输入姓名"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="学号" prop="no">
            <el-input v-model="student.no" placeholder="请输入学号"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第二行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-select v-model="student.gender" placeholder="请选择" style="width: 100%;">
              <el-option v-for="(g) in genders" :key="g.value" :label="g.name" :value="g.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="student.phone" placeholder="请输入手机号"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第三行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="student.idCard" placeholder="请输入身份证号"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="是否院校学员" prop="isCollege">
            <el-select v-model="student.isCollege" placeholder="请选择" style="width: 100%;">
              <el-option v-for="(s) in selections" :key="s.value" :label="s.name" :value="s.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第四行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="联系地址" prop="address">
            <el-input v-model="student.address" placeholder="请输入联系地址"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="最高学历">
            <el-select v-model="student.degree" placeholder="请选择" style="width: 100%;">
              <el-option v-for="(d) in degrees" :key="d.value" :label="d.name" :value="d.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第五行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="毕业时间">
            <el-date-picker v-model="student.graduationDate" type="date" style="width: 100%;" placeholder="选择毕业时间"
              format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="所属班级">
            <el-select v-model="student.clazzId" placeholder="请选择" style="width: 100%;">
              <el-option v-for="(c) in clazzs" :key="c.id" :label="c.name" :value="c.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 底部按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </span>
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

.demo-form-inline .el-select {
  --el-select-width: 220px;
}

.avatar {
  height: 40px;
}

.avatar-uploader .avatar {
  width: 78px;
  height: 78px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 78px;
  height: 78px;
  text-align: center;
  border-radius: 10px;
  /* 添加灰色的虚线边框 */
  border: 1px dashed var(--el-border-color);
}
</style>