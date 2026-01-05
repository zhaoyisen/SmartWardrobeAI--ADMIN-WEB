import request from '@/utils/request'
import type {
  StorageFileVO,
  StorageFileQueryDTO,
  StorageStatisticsVO,
  FilePreviewVO,
  BatchDeleteResultVO,
  PageResult,
  ApiResponse
} from '@/types'

/**
 * 【后台】存储管理API
 */
export const storageApi = {
  /**
   * 分页查询文件列表
   */
  pageQuery: (params: StorageFileQueryDTO) => {
    return request.get<ApiResponse<PageResult<StorageFileVO>>>('/api/admin/storage/files/page', { params })
  },

  /**
   * 获取文件详情
   */
  getDetail: (id: number) => {
    return request.get<ApiResponse<StorageFileVO>>(`/api/admin/storage/files/${id}`)
  },

  /**
   * 获取存储统计信息
   */
  getStatistics: () => {
    return request.get<ApiResponse<StorageStatisticsVO>>('/api/admin/storage/statistics')
  },

  /**
   * 删除单个文件
   */
  delete: (id: number) => {
    return request.delete<ApiResponse<void>>(`/api/admin/storage/files/${id}`)
  },

  /**
   * 批量删除文件
   */
  batchDelete: (ids: number[]) => {
    return request.delete<ApiResponse<BatchDeleteResultVO>>('/api/admin/storage/files/batch', { data: { ids } })
  },

  /**
   * 下载文件
   */
  downloadFile: (id: number) => {
    return request.get(`/api/admin/storage/files/${id}/download`, {
      responseType: 'blob'
    })
  },

  /**
   * 获取文件预览URL
   */
  getPreviewUrl: (id: number, expiresIn?: number) => {
    const params = expiresIn ? { expiresIn } : undefined
    return request.get<ApiResponse<FilePreviewVO>>(`/api/admin/storage/files/${id}/preview`, { params })
  }
}

