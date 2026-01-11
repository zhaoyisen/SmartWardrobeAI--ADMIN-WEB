import request from '@/utils/request'
import type { AiModel, PageParams, PageResult, ApiResponse } from '@/types'

/**
 * AI模型配置API
 */
export const aiModelApi = {
  // 获取模型列表（分页查询）
  getList: (params: PageParams & { modelKey?: string; label?: string; status?: number }) => {
    return request.get<ApiResponse<PageResult<AiModel>>>('/api/admin/ai-model/page', { params })
  },
  
  // 获取模型详情
  getDetail: (id: number) => {
    return request.get<ApiResponse<AiModel>>(`/api/admin/ai-model/${id}`)
  },
  
  // 新增模型
  create: (data: AiModel) => {
    return request.post<ApiResponse<void>>('/api/admin/ai-model/add', data)
  },
  
  // 更新模型
  update: (data: AiModel) => {
    return request.put<ApiResponse<void>>('/api/admin/ai-model/update', data)
  },
  
  // 删除模型
  delete: (id: number) => {
    return request.delete<ApiResponse<void>>(`/api/admin/ai-model/${id}`)
  },
  
  // 更新模型状态
  updateStatus: (id: number, status: number) => {
    return request.patch<ApiResponse<void>>(`/api/admin/ai-model/status/${id}/${status}`)
  },
  
  // 批量删除
  batchDelete: (ids: number[]) => {
    return request.delete<ApiResponse<void>>('/api/admin/ai-model/batch', { data: ids })
  },

  // 刷新AI模型缓存
  refreshCache: () => {
    return request.post<ApiResponse<void>>('/api/admin/ai-model/refresh-cache')
  }
}

