<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { getPosts, createPost, updatePost, deletePost } from '@/api/post'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const router = useRouter()
const authStore = useAuthStore()

const posts = ref([])
const loading = ref(false)

const dialogVisible = ref(false)
const editingId = ref(null)
const submitting = ref(false)

const form = reactive({
  title: '',
  content: '',
})

async function loadPosts() {
  loading.value = true
  try {
    posts.value = await getPosts()
  } catch (e) {
    ElMessage.error('加载文章失败')
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  editingId.value = null
  form.title = ''
  form.content = ''
  dialogVisible.value = true
}

function openEditDialog(row) {
  editingId.value = row.id
  form.title = row.title
  form.content = row.content
  dialogVisible.value = true
}

async function handleSubmit() {
  // 手动校验，替代 el-form rules
  if (!form.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  if (!form.content.trim()) {
    ElMessage.warning('请输入内容')
    return
  }

  submitting.value = true
  try {
    const payload = {
      Title: form.title,
      Content: form.content,
    }

    if (editingId.value) {
      await updatePost(editingId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await createPost(payload)
      ElMessage.success('发布成功')
    }

    dialogVisible.value = false
    loadPosts()
  } catch (e) {
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row) {
  // 原生 confirm，替代 el-popconfirm
  if (!window.confirm(`确定要删除「${row.title}」这篇文章吗？`)) return
  try {
    await deletePost(row.id)
    ElMessage.success('删除成功')
    loadPosts()
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

function handleLogout() {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}

// 自定义“插入图片”按钮：只支持填 URL（保留原逻辑）
function insertImage() {
  const url = window.prompt('请输入图片 URL：')
  if (!url) return
  form.content += `\n![图片](${url})\n`
}

onMounted(() => {
  loadPosts()
})
</script>

<template>
  <div class="admin">

    <!-- 报头：品牌 + 导航（返回首页 / 退出登录） -->
    <header class="masthead">
      <div class="masthead__inner">
        <span class="brand">我的博客</span>

        <nav class="masthead__nav">
          <span class="welcome">欢迎，{{ authStore.displayName }}</span>

          <router-link to="/" class="link">
            <span>返回首页</span>
          </router-link>

          <button type="button" class="link" @click="handleLogout">
            <span>退出登录</span>
          </button>
        </nav>
      </div>
    </header>

    <!-- 页首标题 -->
    <section class="page-head">
      <div class="page-head__inner">
        <p class="label">Admin</p>
        <h1 class="page-title">后台管理</h1>
      </div>
    </section>

    <!-- 工具条 -->
    <section class="toolbar">
      <div class="toolbar__inner">
        <button type="button" class="btn-primary" @click="openCreateDialog">
          <span>+ 新增文章</span>
        </button>
      </div>
    </section>

    <!-- 文章列表 -->
    <section class="list">
      <div class="list__inner">
        <div v-if="loading" class="state">加载中...</div>
        <div v-else-if="posts.length === 0" class="state">
          还没有文章，点击上方按钮开始撰写
        </div>

        <table v-else class="table">
          <thead>
            <tr>
              <th class="col-id">ID</th>
              <th>标题</th>
              <th class="col-time">发布时间</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in posts" :key="row.id">
              <td class="col-id">{{ row.id }}</td>
              <td class="cell-title">
                <span class="title-text">{{ row.title }}</span>
              </td>
              <td class="col-time">{{ row.createdAt }}</td>
              <td class="col-actions">
                <button
                  type="button"
                  class="link-action"
                  @click="openEditDialog(row)"
                >
                  <span>编辑</span>
                </button>
                <button
                  type="button"
                  class="link-action"
                  @click="handleDelete(row)"
                >
                  <span>删除</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 新增 / 编辑弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="dialogVisible"
          class="modal"
          @click.self="dialogVisible = false"
        >
          <div class="modal__panel" role="dialog" aria-modal="true">
            <header class="modal__head">
              <p class="label">{{ editingId ? 'Edit' : 'Create' }}</p>
              <h2 class="modal__title">
                {{ editingId ? '编辑文章' : '新增文章' }}
              </h2>
            </header>

            <div class="modal__body">
              <!-- 标题：底线输入框 + 浮动标签 -->
              <div class="field">
                <input
                  id="post-title"
                  v-model="form.title"
                  type="text"
                  class="field__input"
                  placeholder=" "
                />
                <label for="post-title" class="field__label">标题</label>
              </div>

              <!-- 内容：MdEditor 包边 -->
              <div class="editor-wrap">
                <MdEditor
                  v-model="form.content"
                  style="height: 480px"
                  :toolbars="[
                    'bold', 'italic', 'title', 'strikeThrough',
                    'quote', 'unorderedList', 'orderedList',
                    'link',
                    'code', 'codeRow',
                    'revoke', 'next', 'preview'
                  ]"
                />
              </div>
            </div>

            <footer class="modal__foot">
              <button
                type="button"
                class="btn-ghost"
                @click="dialogVisible = false"
              >
                <span>取消</span>
              </button>
              <button
                type="button"
                class="btn-primary"
                :disabled="submitting"
                @click="handleSubmit"
              >
                <span>{{ submitting ? '提交中...' : '确定' }}</span>
              </button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ============================================
   Editorial（编辑杂志风）— 后台管理
   背景 #F9F8F6 / 文字 #1C1C1C
   单色透明度层次 /60 /40 /10
   无圆角 / 无阴影 / 无彩色强调
   ============================================ */

.admin {
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

.masthead__nav {
  display: flex;
  align-items: center;
  gap: 28px;
}

.welcome {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(28, 28, 28, 0.4);
}

/* 链接：hover-underline 从右到左展开 */
.link {
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
  text-decoration: none;
  cursor: pointer;
  transition: color 0.5s ease;
}

.link::after {
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

.link:hover {
  color: #1C1C1C;
}

.link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

/* ---------- 页首标题 ---------- */
.page-head {
  padding: 72px 24px 0;
}

.page-head__inner {
  max-width: 1280px;
  margin: 0 auto;
}

.label {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(28, 28, 28, 0.4);
  margin: 0 0 24px 0;
}

.page-title {
  font-family: Georgia, 'Times New Roman', 'Songti SC', serif;
  font-weight: 400;
  letter-spacing: -0.04em;
  line-height: 0.95;
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  margin: 0;
  color: #1C1C1C;
}

/* ---------- 工具条 ---------- */
.toolbar {
  padding: 56px 24px 0;
}

.toolbar__inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: flex-end;
}

/* ---------- 主按钮 ---------- */
.btn-primary {
  position: relative;
  display: inline-block;
  padding: 14px 32px;
  background-color: #1C1C1C;
  color: #F9F8F6;
  border: none;
  border-radius: 0;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.5s ease, color 0.5s ease,
    box-shadow 0.5s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: transparent;
  color: #1C1C1C;
  box-shadow: inset 0 0 0 1px #1C1C1C;
}

.btn-primary:disabled {
  background-color: rgba(28, 28, 28, 0.4);
  cursor: not-allowed;
}

/* ---------- 次要按钮 ---------- */
.btn-ghost {
  position: relative;
  display: inline-block;
  padding: 14px 32px;
  background-color: transparent;
  color: #1C1C1C;
  border: none;
  border-radius: 0;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(28, 28, 28, 0.2);
  transition: box-shadow 0.5s ease, color 0.5s ease;
}

.btn-ghost:hover {
  box-shadow: inset 0 0 0 1px #1C1C1C;
}

/* ---------- 列表 ---------- */
.list {
  padding: 32px 24px 128px;
}

.list__inner {
  max-width: 1280px;
  margin: 0 auto;
  border-top: 1px solid rgba(28, 28, 28, 0.1);
}

.state {
  padding: 64px 0;
  color: rgba(28, 28, 28, 0.6);
  font-size: 15px;
  line-height: 1.7;
}

/* 表格：极简骨架 */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 24px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(28, 28, 28, 0.1);
  vertical-align: middle;
}

.table th {
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-weight: 400;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(28, 28, 28, 0.4);
  padding-top: 20px;
  padding-bottom: 20px;
}

.table td {
  font-size: 14px;
  color: rgba(28, 28, 28, 0.8);
}

.table tbody tr {
  transition: background-color 0.5s ease, border-color 0.5s ease;
}

.table tbody tr:hover {
  background-color: rgba(28, 28, 28, 0.02);
}

.table tbody tr:hover td {
  border-bottom-color: rgba(28, 28, 28, 0.4);
}

.col-id {
  width: 80px;
  font-family: Georgia, 'Times New Roman', serif;
  color: rgba(28, 28, 28, 0.4);
}

.col-time {
  width: 200px;
  font-size: 12px !important;
  letter-spacing: 0.05em;
  color: rgba(28, 28, 28, 0.4) !important;
}

.col-actions {
  width: 160px;
  text-align: right;
  white-space: nowrap;
}

.cell-title {
  color: #1C1C1C;
}

.title-text {
  font-family: Georgia, 'Times New Roman', 'Songti SC', serif;
  font-size: 17px;
  letter-spacing: -0.01em;
  line-height: 1.3;
  transition: font-style 0.5s ease;
}

.table tbody tr:hover .title-text {
  font-style: italic;
}

/* 行内操作按钮：排版型反馈，无背景无边框 */
.link-action {
  position: relative;
  display: inline-block;
  background: none;
  border: none;
  padding: 0 0 3px;
  margin-left: 20px;
  font-family: inherit;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(28, 28, 28, 0.6);
  cursor: pointer;
  transition: color 0.5s ease;
}

.link-action::after {
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

.link-action:hover {
  color: #1C1C1C;
}

.link-action:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

/* ---------- 弹窗 ---------- */
.modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  background-color: rgba(28, 28, 28, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 64px 24px;
  overflow-y: auto;
}

.modal__panel {
  width: 100%;
  max-width: 860px;
  background-color: #F9F8F6;
  border: 1px solid rgba(28, 28, 28, 0.1);
  border-radius: 0;
  padding: 48px;
  box-sizing: border-box;
}

.modal__head {
  margin-bottom: 48px;
}

.modal__title {
  font-family: Georgia, 'Times New Roman', 'Songti SC', serif;
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  margin: 0;
  color: #1C1C1C;
}

.modal__body {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.modal__foot {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid rgba(28, 28, 28, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 16px;
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
  font-size: 22px;
  color: #1C1C1C;
  transition: border-color 0.5s ease;
}

.field__input:focus {
  border-bottom-color: #1C1C1C;
}

.field__label {
  position: absolute;
  left: 0;
  top: 14px;
  font-size: 18px;
  line-height: 1;
  color: rgba(28, 28, 28, 0.4);
  pointer-events: none;
  transform-origin: left top;
  transition: transform 0.4s ease, color 0.4s ease;
}

.field__input:focus + .field__label,
.field__input:not(:placeholder-shown) + .field__label {
  transform: translateY(-22px) scale(0.62);
  color: rgba(28, 28, 28, 0.6);
}

/* MdEditor 最小化包边：去圆角、贴合单色骨架 */
.editor-wrap :deep(.md-editor) {
  border-radius: 0 !important;
  border-color: rgba(28, 28, 28, 0.1) !important;
  box-shadow: none !important;
}

.editor-wrap :deep(.md-editor-toolbar-wrapper) {
  border-radius: 0 !important;
  border-bottom-color: rgba(28, 28, 28, 0.1) !important;
}

.editor-wrap :deep(.md-editor-preview-wrapper) {
  border-radius: 0 !important;
}

.editor-wrap :deep(.md-editor-input-wrapper) {
  border-radius: 0 !important;
}

/* 弹窗过渡：轻微浮现 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.35s ease;
}

.modal-enter-active .modal__panel,
.modal-leave-active .modal__panel {
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal__panel,
.modal-leave-to .modal__panel {
  transform: translateY(-12px);
}

/* ---------- 响应式 ---------- */
@media (min-width: 768px) {
  .masthead__inner {
    padding: 24px 48px;
  }

  .page-head {
    padding: 120px 48px 0;
  }

  .toolbar {
    padding: 72px 48px 0;
  }

  .list {
    padding: 40px 48px 200px;
  }

  .modal {
    padding: 80px 48px;
  }

  .modal__panel {
    padding: 64px;
  }
}

@media (max-width: 640px) {
  .masthead__nav {
    gap: 16px;
  }

  .welcome {
    display: none;              /* 小屏隐藏欢迎语，保留两个入口 */
  }

  .col-time,
  .col-id {
    display: none;
  }

  .table th,
  .table td {
    padding: 18px 8px;
  }

  .modal__panel {
    padding: 32px 24px;
  }
}

/* ---------- 无障碍：尊重减少动效偏好 ---------- */
@media (prefers-reduced-motion: reduce) {
  .link,
  .link::after,
  .btn-primary,
  .btn-ghost,
  .table tbody tr,
  .title-text,
  .link-action,
  .link-action::after,
  .field__input,
  .field__label,
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .modal__panel,
  .modal-leave-active .modal__panel {
    transition: none !important;
  }
}
</style>