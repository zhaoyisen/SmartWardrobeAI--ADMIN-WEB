import request from '@/utils/request'
import type { AdminLoginDTO, Result, AdminLoginVO } from '@/types'

/**
 * 认证相关API
 */
export const authApi = {
  // 登录
  login: (data: AdminLoginDTO) => {
    return request.post<Result<AdminLoginVO>>('/api/admin/auth/login', data)
  },
  
  // 退出登录（如果有退出接口）
  logout: () => {
    return request.post<Result<void>>('/api/admin/auth/logout')
  }
}

