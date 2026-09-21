import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')

  // computed：由 token 推导出来，不能直接赋值
  const isLoggedIn = computed(() => !!token.value)
  const displayName = computed(() => username.value || '游客')

  function login(newToken, name) {
    token.value = newToken
    username.value = name
    localStorage.setItem('token', newToken)
    localStorage.setItem('username', name)
  }

  function logout() {
    token.value = ''        // ✅ 清 token（isLoggedIn 自动变 false）
    username.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  return {
    token,        // ✅ 别忘了暴露 token
    username,
    isLoggedIn,
    displayName,
    login,
    logout,
  }
})