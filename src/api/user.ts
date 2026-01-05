import request from '@/utils/request'
import type { AdminUser, AppUser, PageParams, PageResult, ApiResponse } from '@/types'

/**
 * 管理端用户API
 */
export const adminUserApi = {
  // 获取管理端用户列表
  getList: (params: PageParams & { username?: string; nickname?: string; status?: number }) => {
    return request.get<ApiResponse<PageResult<AdminUser>>>('/api/admin/user/admin/list', { params })
  },
  
  // 获取管理端用户详情
  getDetail: (id: number) => {
    return request.get<ApiResponse<AdminUser>>(`/api/admin/user/admin/${id}`)
  },
  
  // 新增管理端用户
  create: (data: AdminUser) => {
    return request.post<ApiResponse<void>>('/api/admin/user/admin', data)
  },
  
  // 更新管理端用户
  update: (id: number, data: AdminUser) => {
    return request.put<ApiResponse<void>>(`/api/admin/user/admin/${id}`, data)
  },
  
  // 删除管理端用户
  delete: (id: number) => {
    return request.delete<ApiResponse<void>>(`/api/admin/user/admin/${id}`)
  },
  
  // 更新状态
  updateStatus: (id: number, status: number) => {
    return request.put<ApiResponse<void>>(`/api/admin/user/admin/${id}/status`, { status })
  },
  
  // 重置密码
  resetPassword: (id: number, password: string) => {
    return request.put<ApiResponse<void>>(`/api/admin/user/admin/${id}/password`, { password })
  }
}

/**
 * App端用户API
 */
export const appUserApi = {
  // 获取App端用户列表
  getList: (params: PageParams & { 
    username?: string
    nickname?: string
    phone?: string
    status?: number
    registerSource?: string
  }) => {
    return request.get<ApiResponse<PageResult<AppUser>>>('/api/admin/user/app/list', { params })
  },
  
  // 获取App端用户详情
  getDetail: (id: number) => {
    return request.get<ApiResponse<AppUser>>(`/api/admin/user/app/${id}`)
  },
  
  // 更新App端用户
  update: (id: number, data: Partial<AppUser>) => {
    return request.put<ApiResponse<void>>(`/api/admin/user/app/${id}`, data)
  },
  
  // 删除App端用户
  delete: (id: number) => {
    return request.delete<ApiResponse<void>>(`/api/admin/user/app/${id}`)
  },
  
  // 更新状态（封禁/解封）
  updateStatus: (id: number, status: number) => {
    return request.put<ApiResponse<void>>(`/api/admin/user/app/${id}/status`, { status })
  }
}

