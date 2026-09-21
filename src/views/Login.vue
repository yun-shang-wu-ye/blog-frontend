<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login as loginApi } from '@/api/post'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
    token:'',
  username: '',
  password: '',
})
const loading = ref(false)

async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }

  loading.value = true
  try {
    const res = await loginApi(form.value)
    if (res.success) {
      authStore.login(res.token,form.value.username)   // 存状态
      ElMessage.success('登录成功')
      router.push('/admin')
    } else {
      ElMessage.error(res.message || '账号或密码错误')
    }
  } catch (e) {
    ElMessage.error('登录失败，请检查后端服务')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login">
    <h1>管理员登录</h1>
    <el-form @submit.prevent="handleLogin">
      <el-form-item>
        <el-input v-model="form.username" placeholder="账号" />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="form.password"
          type="password"
          placeholder="密码"
          show-password
        />
      </el-form-item>
      <el-button type="primary" :loading="loading" @click="handleLogin">
        登录
      </el-button>
    </el-form>
  </div>
</template>

<style scoped>
.login {
  max-width: 360px;
  margin: 100px auto;
  padding: 24px;
  border: 1px solid #eee;
  border-radius: 8px;
}
h1 {
  text-align: center;
  margin-bottom: 24px;
}
</style>