import Home from '@/views/Home.vue'
import PostDetail from '@/views/PostDetail.vue'
import Login from '@/views/Login.vue'
import Admin from '@/views/Admin.vue'
import { useAuthStore } from '@/stores/auth'

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },

    { path: '/post/:id', name: 'post-detail', component: PostDetail },

    { path: '/login', name: 'login', component: Login },

    { path: '/admin', name: 'Admin', component: Admin },
  ],
})

router.beforeEach((to,from)=>{
  // 在守卫内部调用 useAuthStore()，此时 Pinia 已初始化
  const authStore = useAuthStore()

  // 需要登录才能访问的页面（白名单之外）
  const protectedPaths = ['/admin']

  // 如果目标路径需要登录，且用户没登录
  if (protectedPaths.includes(to.path) && !authStore.isLoggedIn) {
    return '/login'   // 重定向到登录页
  }

  // 其他情况：放行
  // 返回 undefined 或 true 都表示放行
})

export default router
