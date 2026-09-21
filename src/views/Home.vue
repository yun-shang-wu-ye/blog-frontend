<script setup>
import { ref, onMounted } from 'vue'
import { getPosts } from '@/api/post'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import { useAuthStore } from '@/stores/auth'
import { toExcerpt } from '@/utils/markdown'

const authStore = useAuthStore()

const posts=ref([])
const loading=ref(false)

async function loadPosts() {
  loading.value = true
  try {
    const data = await getPosts()          // ← 声明 data
    posts.value = data.map(post => ({
      ...post,
      excerpt: toExcerpt(post.content),
    }))
  } catch (e) {
    ElMessage.error('加载文章失败')
    console.error(e)                        // ← 调试用，看真实错误
  } finally {
    loading.value = false
  }
}

onMounted(()=>{loadPosts()})
</script>


<template>
  <div class="home">

    <div class="header">
      <h1>我的博客</h1>
      <!-- 已登录显示“进入后台”，未登录显示“管理入口” -->
      <router-link v-if="authStore.isLoggedIn" to="/admin" class="entry">
        进入后台
      </router-link>
      <router-link v-else to="/login" class="entry">
        管理入口
      </router-link>
    </div>

    <div v-if="loading">加载中...</div>

    <div v-else-if="posts.length===0" class="empty">
      还没有文章，快去后台发布一片吧
    </div>
  
    <div v-else class="post-list">
      <div v-for="post in posts" :key="post.id" class="post-card" @click="$router.push(`/post/${post.id}`)">
        <h2>{{ post.title }}</h2>
        <p class="time">{{ post.createdAt }}</p>
        <p class="excerpt">{{ post.excerpt }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home
{
  max-width:800px ;
  margin: 0 auto;
  padding: 20px; 
  cursor: pointer; 
}
.post-card
{
  border: 1px solid #eee;
  background-color: rgba(176, 173, 173, 0.5);
  border-radius:8px ;
  padding: 16px;
  margin-bottom: 16px;
  
}
.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-card h2
{
  margin: 0 0 8px 0;
  font-size: 20px;
}
.time{
  color:#999;
  font-size: 12px;
  margin: 8px 0 0 0;
}
.excerpt
{
  color: #555;
  margin: 8px 0 0 0;
}
.empty {
  text-align: center;
  color: #999;
  padding: 40px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.entry {
  font-size: 13px;
  color: #999;
  text-decoration: none;
  border: 1px solid #ddd;
  padding: 4px 10px;
  border-radius: 4px;
  transition: all 0.2s;
}
.entry:hover {
  color: #409eff;
  border-color: #409eff;
}
</style>