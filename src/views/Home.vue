<script setup>
import { ref, onMounted } from 'vue'
import { getPosts } from '@/api/post'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import { useAuthStore } from '@/stores/auth'
import { toExcerpt } from '@/utils/markdown'

const authStore = useAuthStore()

const posts = ref([])
const loading = ref(false)

// 落地页主视觉：替换成你自己的图片地址即可
const heroImage = 'https://picsum.photos/seed/editorial/1800/1100'
const heroImageAlt = '落地页主视觉'

async function loadPosts() {
  loading.value = true
  try {
    const data = await getPosts()
    posts.value = data.map(post => ({
      ...post,
      excerpt: toExcerpt(post.content),
    }))
  } catch (e) {
    ElMessage.error('加载文章失败')
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => { loadPosts() })
</script>

<template>
  <div class="home">

    <!-- 报头 -->
    <header class="masthead">
      <div class="masthead__inner">
        <span class="brand">我的博客</span>

        <router-link v-if="authStore.isLoggedIn" to="/admin" class="entry">
          <span>进入后台</span>
        </router-link>
        <router-link v-else to="/login" class="entry">
          <span>管理入口</span>
        </router-link>
      </div>
    </header>

    <!-- ============ 落地页 Hero ============ -->
    <section class="landing">
      <div class="landing__inner">

        <!-- 上：标题组（逐级浮现） -->
        <div class="landing__top">
          <p class="label animate-rise" style="--d: 0.05s">Journal</p>

          <h1 class="hero__title animate-rise" style="--d: 0.18s">
            我的博客
          </h1>

          <p class="hero__subtitle animate-rise" style="--d: 0.34s">
            记录思考、笔记与创作
          </p>
        </div>

        <!-- 下：主视觉（由小恢复 + 浮现） -->
        <figure class="hero__media animate-reveal" style="--d: 0.46s">
          <img
            :src="heroImage"
            :alt="heroImageAlt"
            loading="eager"
            decoding="async"
          />
        </figure>

      </div>
    </section>

    <!-- ============ 文章归档 ============ -->
    <section class="archive">
      <div class="archive__inner">
        <p class="label">Archive</p>

        <div v-if="loading" class="state">加载中...</div>

        <div v-else-if="posts.length === 0" class="state">
          还没有文章，快去后台发布一篇吧
        </div>

        <ul v-else class="post-list">
          <li
            v-for="(post, index) in posts"
            :key="post.id"
            class="post-item"
            @click="$router.push(`/post/${post.id}`)"
          >
            <span class="post-index">
              {{ String(index + 1).padStart(2, '0') }}
            </span>

            <div class="post-body">
              <h2 class="post-title">{{ post.title }}</h2>
              <p class="time">{{ post.createdAt }}</p>
              <p class="excerpt">{{ post.excerpt }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ============================================
   Editorial（编辑杂志风）
   背景 #F9F8F6 / 文字 #1C1C1C
   单色透明度层次 /60 /40 /10
   无圆角 / 无阴影 / 无彩色强调
   ============================================ */

.home {
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background-color: rgba(249, 248, 246, 0.9);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
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

/* ---------- 落地页 Hero ---------- */
.landing {
  /* 接近满屏，形成落地页的“第一屏” */
  min-height: 100vh;
  padding: 128px 24px 0;
  display: flex;
  box-sizing: border-box;
}

.landing__inner {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  /* 文字在上、图片沉底，撑满一屏 */
  justify-content: space-between;
  gap: 64px;
}

/* 标题组 */
.landing__top {
  max-width: 60rem;
}

.label {
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(28, 28, 28, 0.4);
  margin: 0 0 28px 0;
}

.hero__title {
  font-family: Georgia, 'Times New Roman', 'Songti SC', serif;
  font-weight: 400;             /* 标题绝不加粗 */
  letter-spacing: -0.045em;     /* tracking-tighter */
  line-height: 0.9;
  font-size: clamp(3.5rem, 13vw, 9rem);
  margin: 0;
  color: #1C1C1C;
}

.hero__subtitle {
  font-style: italic;           /* 斜体仅用于装饰性副标题 */
  color: rgba(28, 28, 28, 0.6);
  font-size: 17px;
  line-height: 1.7;
  margin: 28px 0 0 0;
  max-width: 32rem;             /* 控制行宽，保持呼吸感 */
}

/* 主视觉：容器裁切 + 慢速恢复 */
.hero__media {
  margin: 0;
  overflow: hidden;             /* 裁切，配合子元素缩放 */
  aspect-ratio: 16 / 9;
  max-height: 56vh;
  background-color: rgba(28, 28, 28, 0.04); /* 图片加载前的暖灰底 */
}

.hero__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1);
  transition: transform 1s ease;
}

/* 悬停：极其克制的凝视感（时装大片式） */
.hero__media:hover img {
  transform: scale(1.03);
}

/* ---------- 归档区 ---------- */
.archive {
  padding: 96px 24px 128px;
  border-top: 1px solid rgba(28, 28, 28, 0.1);
}

.archive__inner {
  max-width: 1280px;
  margin: 0 auto;
}

.state {
  color: rgba(28, 28, 28, 0.6);
  font-size: 15px;
  line-height: 1.7;
  padding: 48px 0;
}

.post-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid rgba(28, 28, 28, 0.1);
}

.post-item {
  display: grid;
  grid-template-columns: 2.5rem 1fr;
  gap: 24px;
  padding: 40px 0;
  border-bottom: 1px solid rgba(28, 28, 28, 0.1);
  cursor: pointer;
  transition: border-color 0.5s ease, background-color 0.5s ease;
}

.post-item:hover {
  border-color: rgba(28, 28, 28, 0.4);
  background-color: rgba(28, 28, 28, 0.02);
}

.post-index {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 13px;
  letter-spacing: 0.05em;
  color: rgba(28, 28, 28, 0.4);
  padding-top: 8px;
}

.post-body {
  min-width: 0;
}

.post-title {
  font-family: Georgia, 'Times New Roman', 'Songti SC', serif;
  font-weight: 400;
  letter-spacing: -0.02em;
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  line-height: 1.15;
  margin: 0;
  color: #1C1C1C;
  transition: font-style 0.5s ease;
}

.post-item:hover .post-title {
  font-style: italic;
}

.time {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(28, 28, 28, 0.4);
  margin: 16px 0 0 0;
}

.excerpt {
  font-size: 15px;
  line-height: 1.8;
  color: rgba(28, 28, 28, 0.8);
  margin: 16px 0 0 0;
  max-width: 42rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ============================================
   入场动效：浮现 + 由小恢复
   缓动为 easeOutQuint，优雅不弹跳
   ============================================ */

/* 文字：轻微上浮 + 淡入 */
@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 图片：由轻微放大恢复 + 淡入，形成一次冲击 */
@keyframes revealIn {
  from {
    opacity: 0;
    transform: scale(1.06);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-rise {
  animation: riseIn 1s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d, 0s);
}

.animate-reveal {
  animation: revealIn 1.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d, 0s);
  will-change: opacity, transform;
}

/* ---------- 响应式 ---------- */
@media (min-width: 768px) {
  .masthead__inner {
    padding: 20px 48px;
  }

  .landing {
    padding: 160px 48px 0;
  }

  .landing__inner {
    gap: 80px;
  }

  .archive {
    padding: 160px 48px 200px;
  }

  .post-item {
    grid-template-columns: 4.5rem 1fr;
    gap: 48px;
    padding: 56px 0;
  }
}

/* ---------- 无障碍：尊重减少动效偏好 ---------- */
@media (prefers-reduced-motion: reduce) {
  .animate-rise,
  .animate-reveal {
    animation: none !important;   /* 直接呈现终态，无位移无缩放 */
  }

  .entry,
  .entry::after,
  .post-item,
  .post-title,
  .hero__media img {
    transition: none !important;
  }
}
</style>