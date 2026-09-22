<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login as loginApi } from '@/api/post'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  token: '',
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
      authStore.login(res.token, form.value.username)
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

    <!-- 报头 -->
    <header class="masthead">
      <div class="masthead__inner">
        <span class="brand">我的博客</span>
        <router-link to="/" class="entry">
          <span>返回首页</span>
        </router-link>
      </div>
    </header>

    <!-- 登录主体 -->
    <main class="login__main">
      <div class="login__inner">

        <!-- 标题区 -->
        <div class="login__head">
          <p class="label">Admin</p>
          <h1 class="login__title">管理员登录</h1>
          <p class="login__subtitle">请输入凭据以继续</p>
        </div>

        <!-- 表单 -->
        <form class="form" @submit.prevent="handleLogin">

          <!-- 账号：底线输入框 + 浮动标签 -->
          <div class="field">
            <input
              id="username"
              v-model="form.username"
              type="text"
              class="field__input"
              placeholder=" "
              autocomplete="username"
            />
            <label for="username" class="field__label">账号</label>
          </div>

          <!-- 密码 -->
          <div class="field">
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="field__input"
              placeholder=" "
              autocomplete="current-password"
            />
            <label for="password" class="field__label">密码</label>
          </div>

          <!-- 提交 -->
          <div class="form__actions">
            <button
              type="submit"
              class="submit"
              :disabled="loading"
            >
              <span>{{ loading ? '登录中...' : '登录' }}</span>
            </button>
          </div>

        </form>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ============================================
   Editorial（编辑杂志风）— 登录页
   背景 #F9F8F6 / 文字 #1C1C1C
   底线输入框 + 浮动标签 / 无圆角 / 无阴影
   ============================================ */

.login {
  min-height: 100vh;
  background-color: #F9F8F6;
  color: #1C1C1C;
  font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI',
    'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ---------- 报头 ---------- */
.masthead {
  border-bottom: 1px solid rgba(28, 28, 28, 0.1);
}

.masthead__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.brand {
  font-family: Georgia, 'Times New Roman', 'Songti SC', serif;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #1C1C1C;
}

.entry {
  position: relative;
  display: inline-block;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(28, 28, 28, 0.6);
  text-decoration: none;
  transition: color 0.5s ease;
}

.entry::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 100%;
  height: 1px;
  background-color: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.5s ease;
}

.entry:hover {
  color: #1C1C1C;
}

.entry:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

/* ---------- 主体 ---------- */
.login__main {
  padding: 96px 24px 128px;
}

.login__inner {
  max-width: 480px;
  margin: 0 auto;
}

/* 标题区 */
.login__head {
  margin-bottom: 72px;
}

.label {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(28, 28, 28, 0.4);
  margin: 0 0 28px 0;
}

.login__title {
  font-family: Georgia, 'Times New Roman', 'Songti SC', serif;
  font-weight: 400;
  letter-spacing: -0.035em;
  line-height: 1;
  font-size: clamp(2.5rem, 8vw, 4rem);
  margin: 0;
  color: #1C1C1C;
}

.login__subtitle {
  font-style: italic;
  color: rgba(28, 28, 28, 0.6);
  font-size: 15px;
  line-height: 1.7;
  margin: 24px 0 0 0;
}

/* ---------- 表单 ---------- */
.form {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

/* 底线输入框 + 浮动标签 */
.field {
  position: relative;
}

.field__input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 0 10px;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(28, 28, 28, 0.2);
  border-radius: 0;
  outline: none;
  font-family: Georgia, 'Times New Roman', 'Songti SC', serif;
  font-size: 20px;
  color: #1C1C1C;
  transition: border-color 0.5s ease;
}

/* 自动填充：抹掉浏览器默认的黄蓝色，保持单色体系 */
.field__input:-webkit-autofill,
.field__input:-webkit-autofill:hover,
.field__input:-webkit-autofill:focus {
  -webkit-text-fill-color: #1C1C1C;
  -webkit-box-shadow: 0 0 0 1000px #F9F8F6 inset;
  transition: background-color 5000s ease-in-out 0s;
}

.field__input:focus {
  border-bottom-color: #1C1C1C;    /* focus 只加深底线，无 outline、无 shadow、无 ring */
}

/* 浮动标签 */
.field__label {
  position: absolute;
  left: 0;
  top: 14px;
  font-size: 16px;
  line-height: 1;
  color: rgba(28, 28, 28, 0.4);
  pointer-events: none;
  transform-origin: left top;
  transition: transform 0.4s ease, color 0.4s ease;
}

/* 聚焦 或 已有内容时，标签上浮变小 */
.field__input:focus + .field__label,
.field__input:not(:placeholder-shown) + .field__label {
  transform: translateY(-22px) scale(0.68);
  color: rgba(28, 28, 28, 0.6);
}

/* ---------- 提交按钮 ---------- */
.form__actions {
  padding-top: 8px;
}

.submit {
  position: relative;
  display: inline-block;
  padding: 16px 40px;
  background-color: #1C1C1C;
  color: #F9F8F6;
  border: none;
  border-radius: 0;
  font-family: inherit;
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  overflow: hidden;
  transition: background-color 0.5s ease, color 0.5s ease;
}

.submit span {
  position: relative;
  z-index: 1;
}

/* 悬停：颜色在既有调色盘内反转（Brutal Contrast） */
.submit:hover:not(:disabled) {
  background-color: transparent;
  color: #1C1C1C;
  box-shadow: inset 0 0 0 1px #1C1C1C;   /* 用内描边模拟 1px 边框，非 shadow 装饰 */
}

.submit:disabled {
  background-color: rgba(28, 28, 28, 0.4);
  cursor: not-allowed;
}

/* ---------- 响应式 ---------- */
@media (min-width: 768px) {
  .masthead__inner {
    padding: 20px 48px;
  }

  .login__main {
    padding: 160px 48px 200px;
  }
}

/* ---------- 无障碍：尊重减少动效偏好 ---------- */
@media (prefers-reduced-motion: reduce) {
  .entry,
  .entry::after,
  .field__input,
  .field__label,
  .submit {
    transition: none !important;
  }
}
</style>