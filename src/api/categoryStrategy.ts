import request from '@/utils/request'
import type { CategoryStrategyVO, CategoryStrategyQueryDTO, CategoryStrategySaveDTO, PageResult, ApiResponse } from '@/types'

/**
 * 品类策略配置API
 */
export const categoryStrategyApi = {
  /**
   * 分页查询品类策略列表
   */
  getList: (params: CategoryStrategyQueryDTO) => {
    return request.get<ApiResponse<PageResult<CategoryStrategyVO>>>('/api/admin/category-strategy/page', { params })
  },

  /**
   * 获取品类策略详情
   */
  getDetail: (id: number) => {
    return request.get<ApiResponse<CategoryStrategyVO>>(`/api/admin/category-strategy/${id}`)
  },

  /**
   * 新增品类策略
   */
  create: (data: CategoryStrategySaveDTO) => {
    return request.post<ApiResponse<void>>('/api/admin/category-strategy/add', data)
  },

  /**
   * 修改品类策略
   */
  update: (data: CategoryStrategySaveDTO) => {
    return request.put<ApiResponse<void>>('/api/admin/category-strategy/update', data)
  },

  /**
   * 删除品类策略
   */
  delete: (id: number) => {
    return request.delete<ApiResponse<void>>(`/api/admin/category-strategy/${id}`)
  },

  /**
   * 修改品类策略状态
   */
  updateStatus: (id: number, status: number) => {
    return request.patch<ApiResponse<void>>(`/api/admin/category-strategy/status/${id}/${status}`)
  },

  /**
   * 批量删除品类策略
   */
  batchDelete: (ids: number[]) => {
    return request.delete<ApiResponse<void>>('/api/admin/category-strategy/batch', { data: ids })
  },

  /**
   * 刷新品类策略缓存
   */
  refreshCache: () => {
    return request.post<ApiResponse<void>>('/api/admin/category-strategy/refresh-cache')
  }
}

