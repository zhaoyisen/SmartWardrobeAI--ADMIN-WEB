import request from '@/utils/request'
import type { DictType, DictData, PageParams, PageResult, ApiResponse, DictDropdownOption } from '@/types'

/**
 * 字典类型分页查询参数
 */
export interface DictTypePageParams extends PageParams {
  sortField?: string // 排序字段
  isAsc?: boolean // 是否升序
  dictType?: string // 字典类型编码（模糊查询）
  dictName?: string // 字典类型名称（模糊查询）
  status?: number // 状态（精确查询，1启用 0禁用）
}

/**
 * 字典数据分页查询参数
 */
export interface DictDataPageParams extends PageParams {
  sortField?: string // 排序字段
  isAsc?: boolean // 是否升序
  dictTypeId?: number // 字典类型ID（精确查询）
  dictType?: string // 字典类型编码（精确查询）
  dictLabel?: string // 字典标签（模糊查询）
  status?: number // 状态（精确查询，1启用 0禁用）
}

/**
 * 字典类型API
 */
export const dictTypeApi = {
  /**
   * 分页查询字典类型列表
   */
  getPage: (params: DictTypePageParams) => {
    return request.get<ApiResponse<PageResult<DictType>>>('/api/admin/dict-type/page', { params })
  },

  /**
   * 获取字典类型详情
   */
  getDetail: (id: number) => {
    return request.get<ApiResponse<DictType>>(`/api/admin/dict-type/${id}`)
  },

  /**
   * 新增字典类型
   */
  create: (data: Omit<DictType, 'id' | 'createTime' | 'updateTime'>) => {
    return request.post<ApiResponse<void>>('/api/admin/dict-type/add', data)
  },

  /**
   * 修改字典类型
   */
  update: (data: DictType) => {
    return request.put<ApiResponse<void>>('/api/admin/dict-type/update', data)
  },

  /**
   * 删除字典类型（单个）
   */
  delete: (id: number) => {
    return request.delete<ApiResponse<void>>(`/api/admin/dict-type/${id}`)
  },

  /**
   * 批量删除字典类型
   */
  batchDelete: (ids: number[]) => {
    return request.delete<ApiResponse<void>>('/api/admin/dict-type/batch', { data: ids })
  },

  /**
   * 修改字典类型状态
   */
  updateStatus: (id: number, status: number) => {
    return request.patch<ApiResponse<void>>(`/api/admin/dict-type/status/${id}/${status}`)
  },

  /**
   * 获取所有启用的字典类型下拉列表
   */
  getDropdown: () => {
    return request.get<ApiResponse<DictDropdownOption[]>>('/api/admin/dict-type/dropdown')
  }
}

/**
 * 字典数据API
 */
export const dictDataApi = {
  /**
   * 分页查询字典数据列表
   */
  getPage: (params: DictDataPageParams) => {
    return request.get<ApiResponse<PageResult<DictData>>>('/api/admin/dict-data/page', { params })
  },

  /**
   * 获取字典数据详情
   */
  getDetail: (id: number) => {
    return request.get<ApiResponse<DictData>>(`/api/admin/dict-data/${id}`)
  },

  /**
   * 新增字典数据
   */
  create: (data: Omit<DictData, 'id' | 'createTime' | 'updateTime' | 'dictType'>) => {
    return request.post<ApiResponse<void>>('/api/admin/dict-data/add', data)
  },

  /**
   * 修改字典数据
   */
  update: (data: DictData) => {
    return request.put<ApiResponse<void>>('/api/admin/dict-data/update', data)
  },

  /**
   * 删除字典数据（单个）
   */
  delete: (id: number) => {
    return request.delete<ApiResponse<void>>(`/api/admin/dict-data/${id}`)
  },

  /**
   * 批量删除字典数据
   */
  batchDelete: (ids: number[]) => {
    return request.delete<ApiResponse<void>>('/api/admin/dict-data/batch', { data: ids })
  },

  /**
   * 修改字典数据状态
   */
  updateStatus: (id: number, status: number) => {
    return request.patch<ApiResponse<void>>(`/api/admin/dict-data/status/${id}/${status}`)
  },

  /**
   * 根据字典类型编码获取启用的字典数据列表
   */
  getListByType: (dictType: string) => {
    return request.get<ApiResponse<DictDropdownOption[]>>(`/api/admin/dict-data/list-by-type/${dictType}`)
  },

  /**
   * 根据字典类型ID获取启用的字典数据列表
   */
  getListByTypeId: (dictTypeId: number) => {
    return request.get<ApiResponse<DictDropdownOption[]>>(`/api/admin/dict-data/list-by-type-id/${dictTypeId}`)
  }
}
