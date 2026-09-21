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

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
}

const formRef = ref(null)

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
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

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

// 自定义“插入图片”按钮：只支持填 URL
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
    <div class="header">
      <h1>后台管理</h1>
      <div class="user-info">
        <span>欢迎，{{ authStore.displayName }}</span>
        <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
      </div>
    </div>

    <div class="toolbar">
      <el-button type="primary" @click="openCreateDialog">+ 新增文章</el-button>
    </div>

    <el-table :data="posts" v-loading="loading" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="createdAt" label="发布时间" width="180" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-popconfirm
            title="确定要删除这篇文章吗？"
            @confirm="handleDelete(row)"
          >
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑文章' : '新增文章'"
      width="800px"
      top="5vh"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="60px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <!-- 用 MdEditor 替代原来的 el-input textarea -->
<MdEditor
  v-model="form.content"
  style="height: 500px"
  :toolbars="[
    'bold', 'italic', 'title', 'strikeThrough',
    'quote', 'unorderedList', 'orderedList',
    'link',
    'code', 'codeRow',
    'revoke', 'next', 'preview'
  ]"
/>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.toolbar {
  margin-bottom: 16px;
}
</style>