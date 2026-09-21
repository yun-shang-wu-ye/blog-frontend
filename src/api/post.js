import request from './request'

// 获取所有文章
export function getPosts() {
  return request.get('/posts')
}

// 获取单篇文章
export function getPost(id) {
  return request.get(`/post/${id}`)
}

// 新增文章
export function createPost(data) {
  return request.post('/post', data)
}

// 更新文章
export function updatePost(id, data) {
  return request.put(`/post/${id}`, data)
}

// 删除文章
export function deletePost(id) {
  return request.delete(`/post/${id}`)
}

// 登录
export function login(data) {
  return request.post('/login', data)
}