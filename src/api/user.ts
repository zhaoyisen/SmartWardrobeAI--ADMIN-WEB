import request from '@/utils/request'
import type { AdminUser, AppUser, PageParams, PageResult, ApiResponse } from '@/types'

/**
 * 管理端用户API
 */
export const adminUserApi = {
  // 分页查询管理端用户
  getList: (params: PageParams & { username?: string; nickname?: string; status?: number }) => {
    return request.get<ApiResponse<PageResult<AdminUser>>>('/api/admin/sys-user/page', { params })
  },
  
  // 获取管理端用户详情
  getDetail: (id: number) => {
    return request.get<ApiResponse<AdminUser>>(`/api/admin/sys-user/${id}`)
  },
  
  // 新增管理端用户
  create: (data: AdminUser) => {
    return request.post<ApiResponse<void>>('/api/admin/sys-user/add', data)
  },
  
  // 更新管理端用户
  update: (data: AdminUser) => {
    return request.put<ApiResponse<void>>('/api/admin/sys-user/update', data)
  },
  
  // 删除管理端用户
  delete: (id: number) => {
    return request.delete<ApiResponse<void>>(`/api/admin/sys-user/${id}`)
  },
  
  // 批量删除管理端用户
  batchDelete: (ids: number[]) => {
    return request.delete<ApiResponse<void>>('/api/admin/sys-user/batch', { data: { ids } })
  },
  
  // 更新状态（启用/禁用）
  updateStatus: (id: number, status: number) => {
    return request.patch<ApiResponse<void>>(`/api/admin/sys-user/status/${id}/${status}`)
  },
  
  // 重置密码（重置为默认密码123456）
  resetPassword: (id: number) => {
    return request.post<ApiResponse<void>>(`/api/admin/sys-user/reset-password/${id}`)
  }
}

/**
 * App端用户API
 */
export const appUserApi = {
  // 分页查询App端用户
  getList: (params: PageParams & { 
    username?: string
    email?: string
    phone?: string
    status?: number
  }) => {
    return request.get<ApiResponse<PageResult<AppUser>>>('/api/admin/app-user/page', { params })
  },
  
  // 获取App端用户详情
  getDetail: (id: number) => {
    return request.get<ApiResponse<AppUser>>(`/api/admin/app-user/${id}`)
  },
  
  // 更新App端用户
  update: (data: AppUser) => {
    return request.put<ApiResponse<void>>('/api/admin/app-user/update', data)
  },
  
  // 删除App端用户
  delete: (id: number) => {
    return request.delete<ApiResponse<void>>(`/api/admin/app-user/${id}`)
  },
  
  // 批量删除App端用户
  batchDelete: (ids: number[]) => {
    return request.delete<ApiResponse<void>>('/api/admin/app-user/batch', { data: { ids } })
  },
  
  // 更新状态（启用/禁用）
  updateStatus: (id: number, status: number) => {
    return request.patch<ApiResponse<void>>(`/api/admin/app-user/status/${id}/${status}`)
  }
}

