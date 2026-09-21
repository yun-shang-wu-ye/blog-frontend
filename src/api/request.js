import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,   // Railway 冷启动可能慢，超时加长
})
request.interceptors.request.use(config=>{
  const token =localStorage.getItem('token')
  if (token)
  {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一处理返回结果
request.interceptors.response.use(
  response => response.data,        // 成功时直接返回 data，省去 res.data 的写法
  error => {
    console.error('请求失败:', error)
    return Promise.reject(error)
  }
)

export default request