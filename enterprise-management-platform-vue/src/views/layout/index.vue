<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { updatePassApi } from "@/api/emp.js";
import { loginApi } from '@/api/login.js';


//当前登录的员工
const id = ref('');
const loginName = ref('');
const username = ref('');
const router = useRouter();
//退出
const logout = () => {
  ElMessageBox.confirm(
    '您确认退出登录吗？',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => { //确认
      ElMessage.success('退出成功');
      localStorage.removeItem('loginUser');
      //跳转页面
      router.push('/login');
    }).catch(() => { //取消
      ElMessage.info('您已取消退出');
    });
}

// 修改密码
const changePass = () => {
  ElMessageBox.prompt('请输入原密码', '修改密码', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputType: 'password'
  }).then(async ({ value: oldPassword }) => {
    // 验证原密码是否正确
    const result = await loginApi({
      username: username.value,
      password: oldPassword
    });

    if (result.code) {
      // 验证原密码后，输入新密码
      return ElMessageBox.prompt('请输入新密码', '修改密码', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputType: 'password',
        inputValidator: (value) => {
          if (!value) {
            return '密码不能为空'
          }
          if (value.length < 6) {
            return '密码长度不能少于6位'
          }
          return true
        }
      }).then(({ value: newPassword }) => {
        // 确认新密码
        return ElMessageBox.prompt('请再次输入新密码', '修改密码', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          inputType: 'password',
          inputValidator: (value) => {
            if (value !== newPassword) {
              return '两次输入的密码不一致'
            }
            return true
          }
        }).then(async () => {
          // 调用API修改密码
          const result = await updatePassApi(id.value, newPassword)
          if (result.code) {
            ElMessage.success('修改密码成功')
          } else {
            ElMessage.error(result.msg || '修改密码失败')
          }
        })
      })
    } else {
      ElMessage.error('原密码错误');
    }
  }).catch(() => {
    ElMessage.info('您已取消修改密码')
  })
};


onMounted(() => {
  const loginUser = JSON.parse(localStorage.getItem('loginUser'));
  if (loginUser && loginUser.name) {
    loginName.value = loginUser.name;
  }
  if (loginUser && loginUser.id) {
    id.value = loginUser.id;
  }
  if (loginUser && loginUser.username) {
    username.value = loginUser.username;
  }
});

</script>

<template>
  <div class="common-layout">
    <el-container>
      <!-- Header 区域 -->
      <el-header class="header">
        <span class="title">Tlias智能学习辅助系统</span>
        <span class="right_tool">
          <a href="javascript:;" @click="changePass">
            <el-icon>
              <EditPen />
            </el-icon> 修改密码 &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
          </a>
          <a href="javascript:;" @click="logout">
            <el-icon>
              <SwitchButton />
            </el-icon> 退出登录 【{{ loginName }}】
          </a>
        </span>
      </el-header>

      <el-container>
        <!-- 左侧菜单 -->
        <el-aside width="200px" class="aside">
          <!-- 左侧菜单栏 -->
          <el-menu router>
            <!-- 首页菜单 -->
            <el-menu-item index="/index">
              <el-icon>
                <Promotion />
              </el-icon> 首页
            </el-menu-item>

            <!-- 班级管理菜单 -->
            <el-sub-menu index="/manage">
              <template #title>
                <el-icon>
                  <Menu />
                </el-icon> 班级学员管理
              </template>
              <el-menu-item index="/clazz">
                <el-icon>
                  <HomeFilled />
                </el-icon>班级管理
              </el-menu-item>
              <el-menu-item index="/stu">
                <el-icon>
                  <UserFilled />
                </el-icon>学员管理
              </el-menu-item>
            </el-sub-menu>

            <!-- 系统信息管理 -->
            <el-sub-menu index="/system">
              <template #title>
                <el-icon>
                  <Tools />
                </el-icon>系统信息管理
              </template>
              <el-menu-item index="/dept">
                <el-icon>
                  <HelpFilled />
                </el-icon>部门管理
              </el-menu-item>
              <el-menu-item index="/emp">
                <el-icon>
                  <Avatar />
                </el-icon>员工管理
              </el-menu-item>
            </el-sub-menu>

            <!-- 数据统计管理 -->
            <el-sub-menu index="/report">
              <template #title>
                <el-icon>
                  <Histogram />
                </el-icon>数据统计管理
              </template>
              <el-menu-item index="/empReport">
                <el-icon>
                  <InfoFilled />
                </el-icon>员工信息统计
              </el-menu-item>
              <el-menu-item index="/stuReport">
                <el-icon>
                  <Share />
                </el-icon>学员信息统计
              </el-menu-item>
              <el-menu-item index="/log">
                <el-icon>
                  <Document />
                </el-icon>日志信息统计
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>

        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>

    </el-container>
  </div>
</template>

<style scoped>
.header {
  background-image: linear-gradient(to right, #00547d, #007fa4, #00aaa0, #00d072, #a8eb12);
}

.title {
  color: white;
  font-size: 40px;
  font-family: 楷体;
  line-height: 60px;
  font-weight: bolder;
}

.right_tool {
  float: right;
  line-height: 60px;
}

a {
  color: white;
  text-decoration: none;
}

.aside {
  width: 220px;
  border-right: 1px solid #ccc;
  height: 730px;
}
</style>
