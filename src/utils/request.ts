import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// Token存储key
const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 从localStorage获取token，添加到请求头
    const token = localStorage.getItem(TOKEN_KEY)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 如果是 blob 响应（文件下载），直接返回原始响应
    if (response.config.responseType === 'blob') {
      return response
    }
    
    const res = response.data
    
    // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
    if (res.code === 200 || res.code === 0) {
      return res
    } else {
      // 否则说明有错误，抛出错误信息
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  (error) => {
    // 处理HTTP错误
    let message = '请求失败'
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录'
          // 清除token和用户信息
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_INFO_KEY)
          // 跳转到登录页（如果当前不在登录页）
          if (router.currentRoute.value.path !== '/login') {
            router.push('/login')
          }
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求错误，未找到该资源'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = error.response.data?.message || `连接错误${error.response.status}`
      }
    } else {
      message = '网络连接异常'
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

// Token工具函数
export const tokenUtils = {
  // 保存token
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token)
  },
  
  // 获取token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY)
  },
  
  // 移除token
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY)
  },
  
  // 保存用户信息
  setUserInfo: (userInfo: any) => {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
  },
  
  // 获取用户信息
  getUserInfo: () => {
    const userInfo = localStorage.getItem(USER_INFO_KEY)
    return userInfo ? JSON.parse(userInfo) : null
  },
  
  // 移除用户信息
  removeUserInfo: () => {
    localStorage.removeItem(USER_INFO_KEY)
  },
  
  // 清除所有认证信息
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_INFO_KEY)
  }
}

export default request

