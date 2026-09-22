<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPost } from '@/api/post'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()

const post = ref(null)
const loading = ref(false)

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

    <!-- 顶部返回：hover-underline，风格内交互 -->
    <div class="detail__bar">
      <button class="back" type="button" @click="router.back()">
        <span>← 返回</span>
      </button>
    </div>

    <div v-if="loading" class="state">加载中...</div>

    <article v-else-if="post" class="article">

      <!-- 标题区 -->
      <header class="article__head">
        <p class="label">Article</p>
        <h1 class="article__title">{{ post.title }}</h1>
        <p class="time">{{ post.createdAt }}</p>
      </header>

      <div class="rule"></div>

      <!-- 正文：Markdown 渲染 -->
      <div class="content" v-html="htmlContent"></div>

    </article>
  </div>
</template>

<style scoped>
/* ============================================
   Editorial（编辑杂志风）— 阅读页
   背景 #F9F8F6 / 文字 #1C1C1C
   单色透明度层次 /60 /40 /10
   无圆角 / 无阴影 / 无彩色强调
   图片：无任何动效
   ============================================ */

.detail {
  min-height: 100vh;
  background-color: #F9F8F6;
  color: #1C1C1C;
  font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI',
    'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0 24px 128px;
}

/* ---------- 顶部返回 ---------- */
.detail__bar {
  max-width: 780px;
  margin: 0 auto;
  padding: 32px 0 0;
}

.back {
  position: relative;
  display: inline-block;
  background: none;
  border: none;
  padding: 0 0 4px;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(28, 28, 28, 0.6);
  cursor: pointer;
  transition: color 0.5s ease;
}

.back::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background-color: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.5s ease;
}

.back:hover {
  color: #1C1C1C;
}

.back:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

/* ---------- 状态 ---------- */
.state {
  max-width: 780px;
  margin: 0 auto;
  padding: 96px 0;
  color: rgba(28, 28, 28, 0.6);
  font-size: 15px;
  line-height: 1.7;
}

/* ---------- 文章主体 ---------- */
.article {
  max-width: 780px;
  margin: 0 auto;
}

.article__head {
  padding: 72px 0 40px;
}

.label {
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(28, 28, 28, 0.4);
  margin: 0 0 28px 0;
}

.article__title {
  font-family: Georgia, 'Times New Roman', 'Songti SC', serif;
  font-weight: 400;                 /* 标题不加粗 */
  letter-spacing: -0.03em;          /* tracking-tighter */
  line-height: 1.1;
  font-size: clamp(2rem, 6vw, 3.5rem);
  margin: 0;
  color: #1C1C1C;
}

.time {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(28, 28, 28, 0.4);
  margin: 24px 0 0 0;
}

/* 分隔线：用透明度骨架替代原 <hr> */
.rule {
  height: 1px;
  background-color: rgba(28, 28, 28, 0.1);
  margin-bottom: 56px;
}

/* ---------- 正文排版 ---------- */
.content {
  font-size: 16px;
  line-height: 1.85;                /* leading-relaxed 以上 */
  color: rgba(28, 28, 28, 0.8);
  max-width: 42rem;
}

.content :deep(p) {
  margin: 0 0 1.5em 0;
}

.content :deep(h1),
.content :deep(h2),
.content :deep(h3),
.content :deep(h4) {
  font-family: Georgia, 'Times New Roman', 'Songti SC', serif;
  font-weight: 400;
  letter-spacing: -0.02em;
  color: #1C1C1C;
  line-height: 1.2;
  margin: 2.4em 0 0.8em 0;
}

.content :deep(h2) {
  font-size: 1.75rem;
}

.content :deep(h3) {
  font-size: 1.35rem;
}

.content :deep(a) {
  color: #1C1C1C;
  text-decoration: none;
  border-bottom: 1px solid rgba(28, 28, 28, 0.4);
  transition: border-color 0.5s ease;
}

.content :deep(a:hover) {
  border-bottom-color: #1C1C1C;
}

.content :deep(strong) {
  font-weight: 600;
  color: #1C1C1C;
}

.content :deep(em) {
  font-style: italic;
  color: rgba(28, 28, 28, 0.6);
}

.content :deep(ul),
.content :deep(ol) {
  margin: 0 0 1.5em 0;
  padding-left: 1.25em;
}

.content :deep(li) {
  margin: 0.4em 0;
}

/* 图片：无任何动效，直角，居中 */
.content :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 2.5em auto;
  /* 无圆角 / 无阴影 / 无 transition / 无 transform */
}

/* 引用：细线 + 斜体，克制的杂志语气 */
.content :deep(blockquote) {
  margin: 2em 0;
  padding: 0 0 0 20px;
  border-left: 1px solid rgba(28, 28, 28, 0.4);
  color: rgba(28, 28, 28, 0.6);
  font-style: italic;
}

.content :deep(blockquote p) {
  margin: 0;
}

/* 代码：暖色浅底 + 极细边框，直角，无圆角 */
.content :deep(pre) {
  background-color: rgba(28, 28, 28, 0.04);
  border: 1px solid rgba(28, 28, 28, 0.1);
  padding: 20px;
  margin: 2em 0;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.7;
}

.content :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9em;
  color: #1C1C1C;
}

/* 行内代码 */
.content :deep(p code),
.content :deep(li code) {
  background-color: rgba(28, 28, 28, 0.05);
  padding: 2px 6px;
}

.content :deep(hr) {
  border: none;
  height: 1px;
  background-color: rgba(28, 28, 28, 0.1);
  margin: 3em 0;
}

.content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 2em 0;
  font-size: 14px;
}

.content :deep(th),
.content :deep(td) {
  border-bottom: 1px solid rgba(28, 28, 28, 0.1);
  padding: 12px 8px;
  text-align: left;
}

.content :deep(th) {
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 400;
  color: #1C1C1C;
}

/* ---------- 响应式 ---------- */
@media (min-width: 768px) {
  .detail {
    padding: 0 48px 200px;
  }

  .detail__bar {
    padding-top: 48px;
  }

  .article__head {
    padding: 96px 0 48px;
  }
}

/* ---------- 无障碍：尊重减少动效偏好 ---------- */
@media (prefers-reduced-motion: reduce) {
  .back,
  .back::after,
  .content :deep(a) {
    transition: none !important;
  }
}
</style>