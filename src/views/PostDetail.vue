<script setup>
import { ref, onMounted, computed } from 'vue'          // ← 加 computed
import { useRoute, useRouter } from 'vue-router'
import { getPost } from '@/api/post'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'                          // ← 加这一行

const route = useRoute()
const router = useRouter()

const post = ref(null)
const loading = ref(false)

// 把 Markdown 原文渲染成 HTML
const htmlContent = computed(() => {
  if (!post.value) return ''
  return marked(post.value.content || '')
})

async function loadPost() {
  loading.value = true
  try {
    post.value = await getPost(route.params.id)
  } catch (e) {
    ElMessage.error('文章不存在或加载失败')
    router.push('/')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPost()
})
</script>

<template>
  <div class="detail">
    <el-button @click="router.back()" style="margin-bottom: 16px">← 返回</el-button>

    <div v-if="loading">加载中...</div>

    <div v-else-if="post">
      <h1>{{ post.title }}</h1>
      <p class="time">发布时间：{{ post.createdAt }}</p>
      <hr />
      <!-- 原来：<div class="content">{{ post.content }}</div> -->
      <div class="content" v-html="htmlContent"></div>
    </div>
  </div>
</template>

<style scoped>
.detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
h1 {
  margin-bottom: 8px;
}
.time {
  color: #999;
  font-size: 14px;
}
.content {
  margin-top: 16px;
  line-height: 1.8;
  color: #333;
}
/* 让 Markdown 渲染出来的图片不超出容器 */
.content :deep(img) {
  max-width: 100%;
  border-radius: 6px;
  display: block; /* 关键：img默认是行内元素，margin:auto生效需要block */
  margin: 15px auto;
}
/* 让 Markdown 渲染出来的代码块有点样式 */
.content :deep(pre) {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
}
.content :deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 12px;
  color: #666;
  margin: 12px 0;
}
</style>